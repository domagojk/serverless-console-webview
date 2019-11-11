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
    lastRefreshed: number
    loaded: boolean
    error?: string
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
    const { logStreams, error } = await getLogStreams(this.props.tab.logs)
    this.setState({
      error,
      loaded: true,
      lastRefreshed: Date.now(),
      logStreams
    })
  }

  async onRefresh() {
    this.setState({
      refreshInProgress: true,
      lastRefreshed: Date.now()
    })

    const { logStreams, error } = await getLogStreams(this.props.tab.logs)

    this.setState({
      error,
      refreshInProgress: false,
      logStreams
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
        ) : (
          <div>loading</div>
        )}
      </div>
    )
  }
}
