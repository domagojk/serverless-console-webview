import React from 'react'
import { getLogStreams } from './cwData'
import { Collapse } from 'antd'
import moment from 'moment'
import { LogStream } from './LogStream'

const { Panel } = Collapse

export class LogStreamList extends React.Component {
  state: {
    refreshInProgress: boolean
    lastRefreshed: number
    loaded: boolean
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
    const logStreams = await getLogStreams('')
    this.setState({
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

    const logStreams = await getLogStreams('')

    this.setState({
      refreshInProgress: false,
      logStreams
    })
  }

  render() {
    return (
      <div className="log-section">
        <header>
          <h2>Logs</h2>
          {this.state.refreshInProgress ? (
            'loading...'
          ) : (
            <span className="options">
              <span className="spanlink" onClick={this.onRefresh.bind(this)}>
                Refresh
              </span>
              {this.state.lastRefreshed !== 0 && (
                <LastRefreshed time={this.state.lastRefreshed} />
              )}
            </span>
          )}
        </header>
        {this.state.loaded ? (
          <Collapse className="logstreamslist">
            {this.state.logStreams.map(logStream => (
              <Panel
                header={
                  <div className="logstream">
                    <span className="relative-time">
                      {moment(logStream.lastEventTimestamp).fromNow()}
                    </span>
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
            ))}
          </Collapse>
        ) : (
          <div>loading</div>
        )}
      </div>
    )
  }
}

class LastRefreshed extends React.Component<{ time: number }> {
  componentDidMount() {
    setInterval(
      () =>
        this.setState({
          interval: Date.now()
        }),
      10000
    )
  }
  render() {
    return (
      <div className="last-refreshed">
        last updated {moment(this.props.time).fromNow()}
      </div>
    )
  }
}
