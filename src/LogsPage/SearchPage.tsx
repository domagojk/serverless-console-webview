import React from 'react'
import { Input, DatePicker, Collapse, Button, Table, Icon } from 'antd'
import './searchPage.css'
import moment from 'moment'
import { startQuery, stopQuery, getQueryResults } from '../asyncData'
import { RelativeTime } from './RelativeTime'
import { LogEvent } from './LogEvent'
import { prepareMessagesArr } from './LogStream'
import { formatBytes } from '../util/formatBytes'

const { Search, TextArea } = Input
const { Panel } = Collapse

const defaultQuery = `fields @timestamp, @message
  | filter @message like /(?i)$SEARCH_INPUT/
  | sort @timestamp asc
  | limit 20`

const { RangePicker } = DatePicker

type QueryData = {
  isRunning: boolean
  searchStr: string
  query: string
  status: string
  resultsWithoutMatches: any[]
  resultsWithMatches: any[]
  queryId?: string
  activeTimeFrame: string
  customRange: number[]
  stats?: {
    bytesScanned: number
    recordsMatched: number
    recordsScanned: number
  }
  error?: string
}

const inMs = {
  '5m': 300000,
  '10m': 600000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '3h': 10800000,
  '6h': 21600000,
  '12h': 43200000,
  '1d': 86400000,
  '2d': 172800000,
  '3d': 259200000,
  '7d': 604800000,
  '30d': 2592000000
}

const initialState = {
  activeTimeFrame: '1h',
  customRange: [Date.now() - inMs['3d'], Date.now()],
  searchStr: '',
  query: defaultQuery,
  isQueryShown: false,
  isHistoryShown: false,
  activeQueryRef: '',
  queriesStatus: {} as Record<string, QueryData>
}

export class SearchPage extends React.Component<
  {
    logGroupName: string
    region: string
  },
  typeof initialState
> {
  state = initialState

  async startQuery(existingQueryRef?: string) {
    let range =
      this.state.activeTimeFrame === 'custom'
        ? this.state.customRange
        : relativeRange(this.state.activeTimeFrame)

    const queryRef = existingQueryRef || Date.now().toString()
    const queryCommand = this.state.query.replace(
      /\$SEARCH_INPUT/g,
      this.state.searchStr
    )

    this.setState({
      activeQueryRef: queryRef,
      queriesStatus: {
        ...this.state.queriesStatus,
        [queryRef]: {
          ...this.state.queriesStatus[queryRef],
          activeTimeFrame: this.state.activeTimeFrame,
          customRange: this.state.customRange,
          searchStr: this.state.searchStr,
          query: this.state.query,
          isRunning: true,
          status: 'Started',
          resultsWithoutMatches: [],
          resultsWithMatches: []
        }
      }
    })

    try {
      const { queryId } = await startQuery({
        ref: queryRef,
        startTime: Math.round(range[0] / 1000),
        endTime: Math.round(range[1] / 1000),
        logGroupName: this.props.logGroupName,
        region: this.props.region,
        query: queryCommand
      })

      this.setState({
        queriesStatus: {
          ...this.state.queriesStatus,
          [queryRef]: {
            ...this.state.queriesStatus[queryRef],
            queryId
          }
        }
      })

      this.getQueryResults(queryRef)
    } catch (error) {
      this.setState({
        activeQueryRef: queryRef,
        queriesStatus: {
          ...this.state.queriesStatus,
          [queryRef]: {
            ...this.state.queriesStatus[queryRef],
            isRunning: false,
            status: 'Error',
            error
          }
        }
      })
    }
  }

  async getQueryResults(queryRef) {
    this.setState({
      queriesStatus: {
        ...this.state.queriesStatus,
        [queryRef]: {
          ...this.state.queriesStatus[queryRef],
          isRunning: true
        }
      }
    })

    const queryId = this.state.queriesStatus[queryRef].queryId
    const res = await getQueryResults({ queryId, ref: queryRef })

    this.setState({
      queriesStatus: {
        ...this.state.queriesStatus,
        [queryRef]: {
          ...this.state.queriesStatus[queryRef],
          isRunning:
            res.status !== 'Complete' &&
            res.status !== 'Failed' &&
            res.status !== 'Cancelled'
              ? true
              : false,
          status: res.status,
          stats: res.statistics,
          resultsWithoutMatches: res.results,
          resultsWithMatches: prepareMessagesArr(
            res.results,
            true,
            this.state.searchStr
          )
        }
      }
    })

    if (res.status === 'Running' || res.status === 'Scheduled') {
      setTimeout(() => this.getQueryResults(queryRef), 1000)
    }
  }

  async stopQuery() {
    for (const queryRef of Object.keys(this.state.queriesStatus)) {
      if (
        this.state.queriesStatus[queryRef] &&
        this.state.queriesStatus[queryRef].queryId &&
        this.state.queriesStatus[queryRef].status !== 'Complete' &&
        this.state.queriesStatus[queryRef].status !== 'Failed' &&
        this.state.queriesStatus[queryRef].status !== 'Cancelled'
      ) {
        try {
          await stopQuery({
            queryId: this.state.queriesStatus[queryRef].queryId
          })
          this.setState({
            queriesStatus: {
              ...this.state.queriesStatus,
              [queryRef]: {
                ...this.state.queriesStatus[queryRef],
                isRunning: false,
                status: 'Stop'
              }
            }
          })
        } catch (err) {
          // ignored stop error
          // since the button will show if query is running
        }
      }
    }
  }

  onSearchInputChange(e) {
    const activeQuery =
      this.state.queriesStatus[this.state.activeQueryRef] || ({} as QueryData)

    this.setState({
      searchStr: e.target.value
    })

    if (
      activeQuery.resultsWithoutMatches &&
      activeQuery.resultsWithoutMatches.length
    ) {
      this.setState({
        queriesStatus: {
          ...this.state.queriesStatus,
          [this.state.activeQueryRef]: {
            ...activeQuery,
            resultsWithMatches: prepareMessagesArr(
              activeQuery.resultsWithoutMatches,
              true,
              e.target.value
            )
          }
        }
      })
    }
  }

  onTimeFrameChange = timeframe => {
    this.setState({
      activeTimeFrame: timeframe
    })
  }

  render() {
    const activeQuery =
      this.state.queriesStatus[this.state.activeQueryRef] || ({} as QueryData)

    const isTheSameQuery =
      activeQuery.searchStr &&
      activeQuery.searchStr === this.state.searchStr &&
      activeQuery.query === this.state.query &&
      activeQuery.activeTimeFrame === this.state.activeTimeFrame &&
      activeQuery.customRange === this.state.customRange

    return (
      <div className="search-page">
        <h2>Search</h2>
        <Search
          value={this.state.searchStr}
          onSearch={() => {
            if (this.state.searchStr) {
              if (isTheSameQuery) {
                this.startQuery(this.state.activeQueryRef)
              } else {
                this.startQuery()
              }
            }
          }}
          onChange={this.onSearchInputChange.bind(this)}
          loading={activeQuery.isRunning && isTheSameQuery}
          enterButton={isTheSameQuery ? 'Refresh' : 'Search'}
          addonAfter={
            activeQuery.isRunning ? (
              <Button type="danger" onClick={this.stopQuery.bind(this)}>
                Stop
              </Button>
            ) : null
          }
        />

        <div className="search-options">
          <div className="left belowinput">
            <TimeFrameLink
              timeframe="5m"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="15m"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="30m"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="1h"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="6h"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="12h"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="1d"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="7d"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="30d"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
            <span className="separator">|</span>
            <TimeFrameLink
              timeframe="custom"
              active={this.state.activeTimeFrame}
              onTimeFrameChange={this.onTimeFrameChange}
            />
          </div>
          <div className="right belowinput">
            <span
              className={
                this.state.isQueryShown ? 'whitelink active' : 'whitelink'
              }
              onClick={() =>
                this.setState({
                  isQueryShown: !this.state.isQueryShown,
                  isHistoryShown: false
                })
              }
            >
              query
            </span>
            {Object.keys(this.state.queriesStatus).length
              ? [
                  <span className="separator">|</span>,
                  <span
                    className={
                      this.state.isHistoryShown
                        ? 'whitelink active'
                        : 'whitelink'
                    }
                    onClick={() =>
                      this.setState({
                        isHistoryShown: !this.state.isHistoryShown,
                        isQueryShown: false
                      })
                    }
                  >
                    history ({Object.keys(this.state.queriesStatus).length})
                  </span>
                ]
              : null}
          </div>
        </div>
        {this.state.activeTimeFrame === 'custom' && (
          <RangePicker
            size="small"
            style={{ marginBottom: 10 }}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            placeholder={['Start Time', 'End Time']}
            value={[
              moment(this.state.customRange[0]),
              moment(this.state.customRange[1])
            ]}
            ranges={{
              'This Week': [moment().startOf('week'), moment().endOf('week')],
              'This Month': [
                moment().startOf('month'),
                moment().endOf('month')
              ],
              'This Year': [moment().startOf('year'), moment().endOf('year')]
            }}
            onChange={val => {
              this.setState({
                customRange: [
                  parseInt(val[0].format('x')),
                  parseInt(val[1].format('x'))
                ]
              })
            }}
          />
        )}

        {this.state.isQueryShown && (
          <div className="search-query">
            <TextArea
              value={this.state.query}
              rows={4}
              onChange={e => this.setState({ query: e.target.value })}
            />
            <div className="links">
              {this.state.query !== defaultQuery && [
                <span
                  className="reset whitelink"
                  onClick={() => this.setState({ query: defaultQuery })}
                >
                  reset
                </span>,
                <span className="separator">|</span>
              ]}
              <a
                href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html"
                className="whitelink"
                target="_blank"
              >
                more info
              </a>
            </div>
          </div>
        )}

        {this.state.isHistoryShown && (
          <SearchHistory
            queriesStatus={this.state.queriesStatus}
            active={this.state.activeQueryRef}
            onRowClick={queryRef => {
              const choosenQuery = this.state.queriesStatus[queryRef]
              this.setState({
                activeQueryRef: queryRef,
                searchStr: choosenQuery.searchStr,
                activeTimeFrame: choosenQuery.activeTimeFrame,
                customRange: choosenQuery.customRange,
                query: choosenQuery.query,
                queriesStatus: {
                  ...this.state.queriesStatus,
                  [queryRef]: {
                    ...this.state.queriesStatus[queryRef],
                    resultsWithMatches: prepareMessagesArr(
                      choosenQuery.resultsWithoutMatches,
                      true,
                      choosenQuery.searchStr
                    )
                  }
                }
              })
            }}
          />
        )}

        <FetchingStatus activeQuery={activeQuery} />

        {activeQuery.resultsWithMatches &&
        activeQuery.resultsWithMatches.length ? (
          <div className="results">
            <Collapse key="collapse" bordered={false}>
              {activeQuery.resultsWithMatches.map(message => {
                return (
                  <Panel
                    key={this.state.activeQueryRef + message.key}
                    className={
                      message.searchMatches === 0 ? 'blurforsearch' : ''
                    }
                    header={
                      <div className="logevent-header">
                        <RelativeTime
                          className="relative-time"
                          time={message.timestamp}
                        />
                        <span className="abs-time">
                          {moment(message.timestamp).format('lll')}
                        </span>
                        <span className="logevent-shortmessage">
                          {message.searchMatches > 0 && (
                            <span className="event-tag matches">
                              matches: {message.searchMatches}
                            </span>
                          )}
                          {message.shortMessageMatched &&
                          message.shortMessageMatched.length
                            ? message.shortMessageMatched.map(tag => (
                                <span className="event-tag">{tag}</span>
                              ))
                            : message.messageShort}
                        </span>
                      </div>
                    }
                  >
                    {message.messagesLong.map((m: string, i: number) => (
                      <LogEvent
                        key={i}
                        message={m}
                        search={this.state.searchStr}
                      />
                    ))}
                  </Panel>
                )
              })}
            </Collapse>
          </div>
        ) : null // No data found for this time range
        }
      </div>
    )
  }
}

function TimeFrameLink({ timeframe, active, onTimeFrameChange }) {
  return (
    <span
      className={`whitelink ${active === timeframe ? 'active' : ''}`}
      onClick={() => onTimeFrameChange(timeframe)}
    >
      {timeframe}
    </span>
  )
}

function relativeRange(timeframe: string) {
  return [Date.now() - inMs[timeframe], Date.now()]
}

function SearchHistory({ queriesStatus, onRowClick, active }) {
  const columns = [
    {
      title: 'Search',
      dataIndex: 'searchStr',
      key: 'searchStr',
      width: '34%',
      render: searchStr => (
        <span className="search-str">
          <Icon type="right" />
          {searchStr}
        </span>
      )
    },
    {
      title: 'Timeframe',
      dataIndex: 'timeframe',
      key: 'timeframe',
      render: timeframe => <span>Timeframe: {timeframe}</span>,
      width: '22%'
    },
    {
      title: 'Results',
      dataIndex: 'results',
      key: 'results',
      align: 'right' as any,
      render: results => <span>Results: {results}</span>,
      width: '22%'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'right' as any,
      key: 'status',
      width: '22%'
    }
  ]

  const data = Object.keys(queriesStatus)
    .reverse()
    .map(queryRef => {
      return {
        key: queryRef,
        searchStr: queriesStatus[queryRef].searchStr,
        results: queriesStatus[queryRef].resultsWithMatches.length,
        status: queriesStatus[queryRef].status,
        timeframe: queriesStatus[queryRef].activeTimeFrame,
        ellipsis: true
      }
    })
  return (
    <Table
      size="small"
      columns={columns}
      dataSource={data}
      pagination={false}
      showHeader={false}
      scroll={{
        y: 150,
        x: false
      }}
      onRowClick={row => {
        onRowClick(row.key)
      }}
      rowClassName={row => (row.key === active ? 'active' : '')}
    />
  )
}

function FetchingStatus({ activeQuery }: { activeQuery: QueryData }) {
  return (
    <div className="fetching">
      {activeQuery &&
        (activeQuery.status === 'Running' ||
          activeQuery.status === 'Started') && (
          <span style={{ marginRight: 5 }}>Fetching data...</span>
        )}

      {activeQuery && activeQuery.stats && (
        <span>
          <b>{activeQuery.stats.recordsMatched}</b> record
          {activeQuery.stats.recordsMatched === 1 ? '' : 's'} matched |{' '}
          <b>{activeQuery.stats.recordsScanned}</b> record
          {activeQuery.stats.recordsScanned === 1 ? '' : 's'} (
          <b>{formatBytes(activeQuery.stats.bytesScanned)}</b>) scanned
        </span>
      )}

      {activeQuery && activeQuery.status === 'Error' && (
        <div style={{ marginTop: 10 }}>
          {activeQuery.error || 'error running query'}{' '}
        </div>
      )}
    </div>
  )
}
