import React from 'react'
import { getLogEvents } from './cwData'
import { Collapse } from 'antd'
import moment from 'moment'
import { LogEvent } from './LogEvent'

const { Panel } = Collapse

export class LogStream extends React.Component<{
  logStream: string
  logGroup: string
  onRetry: any
  loadingNew?: boolean
  loadingOld?: boolean
}> {
  state: {
    loaded: boolean
    loadingNew?: boolean
    loadingOld?: boolean
    messages: {
      time: string
      messageShort: string
      messageLong: string
    }[]
  } = {
    loaded: false,
    messages: []
  }

  async componentDidMount() {
    const logEvents = await getLogEvents({
      logGroup: this.props.logGroup,
      logStream: this.props.logStream
    })

    this.setState({
      loaded: true,
      messages: logEvents.map((log, i) => ({
        time: log.timestamp + i,
        messageShort: log.message.slice(0, 500),
        messageLong: log.message
      }))
    })
  }

  async onRetryNew() {
    this.setState({
      loadingNew: true
    })
    const logEvents = await getLogEvents({
      logGroup: this.props.logGroup,
      logStream: this.props.logStream
    })
    console.log(logEvents)
    this.setState({
      loadingNew: false
    })
  }

  async onRetryOld() {
    this.setState({
      loadingOld: true
    })
    const logEvents = await getLogEvents({
      logGroup: this.props.logGroup,
      logStream: this.props.logStream
    })
    console.log(logEvents)
    this.setState({
      loadingOld: false
    })
  }

  render() {
    return this.state.loaded ? (
      [
        <div className="retry-message retry-message-old" key="retryold">
          {this.state.loadingOld ? (
            'loading older events...'
          ) : (
            <span>
              No older events found at the moment.
              <span
                className="spanlink retry-link"
                onClick={this.onRetryOld.bind(this)}
              >
                Retry
              </span>
            </span>
          )}
        </div>,
        <Collapse key="collapse" bordered={false}>
          {this.state.messages.map(message => (
            <Panel
              key={message.time}
              header={
                <div className="logevent-header">
                  <span className="relative-time">
                    {moment(message.time).fromNow()}
                  </span>
                  <span className="abs-time">
                    {moment(message.time).format('lll')}
                  </span>
                  <span className="logevent-shortmessage">
                    {message.messageShort}
                  </span>
                </div>
              }
            >
              <LogEvent message={message.messageLong} />
            </Panel>
          ))}
        </Collapse>,
        <div className="retry-message retry-message-new" key="retrynew">
          {this.state.loadingNew ? (
            'loading new events...'
          ) : (
            <span>
              No newer events found at the moment.
              <span
                className="spanlink retry-link"
                onClick={this.onRetryNew.bind(this)}
              >
                Retry
              </span>
            </span>
          )}
        </div>
      ]
    ) : (
      <div className="retry-message">loading new events...</div>
    )
  }
}
