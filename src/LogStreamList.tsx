import React from 'react'
import { getLogStreams } from './cwData'
import { Collapse } from 'antd'
import moment from 'moment'
import { LogStream } from './LogStream'
import { RelativeTime } from './RelativeTime'

const { Panel } = Collapse

export class LogStreamList extends React.Component<{ tab: any }> {
  state: {
    refreshInProgress: boolean
    loadMoreInProgress?: boolean
    lastRefreshed: number
    loaded: boolean
    error?: string
    currentToken?: string
    nextToken?: string
    logStreams: {
      creationTime: number
      firstEventTimestamp: number
      lastEventTimestamp: number
      lastIngestionTime: number
      storedBytes: number
      logStreamName: string
      uploadSequenceToken: string
      arn: string
    }[]
  } = {
    refreshInProgress: false,
    lastRefreshed: 0,
    logStreams: [],
    loaded: false
  }

  async componentDidMount() {
    const { logStreams, nextToken, error } = await getLogStreams(
      this.props.tab.logs
    )

    this.setState({
      error,
      loaded: true,
      lastRefreshed: Date.now(),
      logStreams,
      nextToken
    })
  }

  async onLoadMore() {
    this.setState({
      loadMoreInProgress: true
    })

    const { logStreams, nextToken, error } = await getLogStreams(
      this.props.tab.logs,
      this.state.nextToken
    )

    const oldStreams = this.state.logStreams.filter(
      logStream => !logStreams.find(l => l.arn === logStream.arn)
    )

    this.setState({
      error,
      loadMoreInProgress: false,
      logStreams: [...oldStreams, ...logStreams],
      nextToken
    })
  }

  async onRefresh() {
    this.setState({
      refreshInProgress: true,
      lastRefreshed: Date.now()
    })

    const { logStreams, error } = await getLogStreams(this.props.tab.logs)

    const oldStreams = this.state.logStreams.filter(
      logStream => !logStreams.find(l => l.arn === logStream.arn)
    )

    this.setState({
      error,
      refreshInProgress: false,
      logStreams: [...oldStreams, ...logStreams]
    })
  }

  render() {
    return (
      <div className="log-section">
        <header>
          <h2>
            Logs{' '}
            <span className="foreground-color small-message">
              {this.props.tab.logs}
            </span>
          </h2>
          {this.state.refreshInProgress ? (
            'loading...'
          ) : (
            <span className="options">
              <span className="spanlink" onClick={this.onRefresh.bind(this)}>
                Refresh
              </span>
              {this.state.lastRefreshed !== 0 && (
                <div className="last-refreshed">
                  last updated <RelativeTime time={this.state.lastRefreshed} />
                </div>
              )}
            </span>
          )}
        </header>

        {this.state.loaded ? (
          <div>
            <Collapse className="logstreamslist">
              {this.state.error ? (
                <div className="foreground-color">{this.state.error}</div>
              ) : (
                this.state.logStreams
                  .sort((a, b) => b.lastEventTimestamp - a.lastEventTimestamp)
                  .map(logStream => (
                    <Panel
                      header={
                        <div className="logstream">
                          <RelativeTime
                            className="relative-time"
                            time={logStream.lastEventTimestamp}
                          />
                          <span className="abs-time">
                            {moment(logStream.lastEventTimestamp).format('lll')}
                          </span>
                        </div>
                      }
                      key={logStream.arn}
                    >
                      <LogStream
                        logGroup=""
                        logStream={logStream.logStreamName}
                        onRetry={console.log}
                      />
                    </Panel>
                  ))
              )}
            </Collapse>
            {this.state.nextToken && (
              <div className=" loadmore">
                {this.state.loadMoreInProgress ? (
                  <span>loading...</span>
                ) : (
                  <span
                    className="spanlink"
                    onClick={this.onLoadMore.bind(this)}
                  >
                    Load more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>loading</div>
        )}
      </div>
    )
  }
}
