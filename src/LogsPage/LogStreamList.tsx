import React from 'react'
import { LogStreamData } from '../asyncData'
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
  onLoadMore: () => any
}

export class LogStreamList extends React.Component<Props> {
  render() {
    return (
      <div className="log-section">
        <header>
          <h2>Logs</h2>
        </header>

        {this.props.loaded ? (
          <div>
            <Collapse className="logstreamslist">
              {this.props.error ? (
                <div className="foreground-color">{this.props.error}</div>
              ) : (
                this.props.logStreams
                  .sort((a, b) => b.sortByTimestamp - a.sortByTimestamp)
                  .map(logStream => (
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
                        logGroup={this.props.tab.logs}
                        logStream={logStream.logStreamName}
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
          <div>loading</div>
        )}
      </div>
    )
  }
}
