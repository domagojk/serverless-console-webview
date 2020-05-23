import React from 'react'
import { LogStreamData } from '../asyncData/asyncData'
import { Collapse } from 'antd'
import moment from 'moment'
import { LogStream } from './LogStream'
import { RelativeTime } from './RelativeTime'

const { Panel } = Collapse

type Props = {
  tab: any
  loaded: boolean
  error: string
  logStreams: LogStreamData[]
  nextToken: string
  loadMoreInProgress: boolean
  autoRefreshInterval: number
  onLoadMore: () => any
}

export class LogStreamList extends React.Component<Props> {
  state = {
    openedStreams: [],
    searchString: '',
  }

  render() {
    return (
      <div className="log-section">
        <header>
          <h2>Logs</h2>
        </header>

        {this.props.loaded ? (
          <div>
            <Collapse
              className="logstreamslist"
              onChange={(openedStreams) => this.setState({ openedStreams })}
            >
              {this.props.error ? (
                <div className="foreground-color">{this.props.error}</div>
              ) : (
                this.props.logStreams
                  .sort((a, b) => b.sortByTimestamp - a.sortByTimestamp)
                  .map((logStream, index) => (
                    <Panel
                      header={
                        <div className="logstream">
                          <RelativeTime
                            className="relative-time"
                            time={logStream.sortByTimestamp}
                          />
                          <span className="abs-time">
                            {moment(logStream.sortByTimestamp).format('lll')}
                          </span>
                        </div>
                      }
                      key={logStream.arn}
                    >
                      <LogStream
                        isFirstLogStream={index === 0}
                        isExpanded={this.state.openedStreams.includes(
                          logStream.arn
                        )}
                        logGroup={this.props.tab.logs}
                        region={this.props.tab.region}
                        awsProfile={this.props.tab.awsProfile}
                        logStream={logStream.logStreamName}
                        search={this.state.searchString}
                        onSearchValChange={(search) => {
                          this.setState({
                            searchString: search,
                          })
                        }}
                        autoRefreshInterval={this.props.autoRefreshInterval}
                      />
                    </Panel>
                  ))
              )}
            </Collapse>
            {this.props.nextToken && (
              <div className=" loadmore">
                {this.props.loadMoreInProgress ? (
                  <span>loading...</span>
                ) : (
                  <span className="spanlink" onClick={this.props.onLoadMore}>
                    Load more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>loading...</div>
        )}
      </div>
    )
  }
}
