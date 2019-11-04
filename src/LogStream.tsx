import React from 'react'
import { getLogEvents } from './cwData'
import { Collapse } from 'antd'
import moment from 'moment'
import { LogEvent } from './LogEvent'
import { RelativeTime } from './RelativeTime'

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
    nextBackwardToken?: string
    nextForwardToken?: string
    messages: {
      timestamp: number
      key: string
      messageShort: string
      messageLong: string
    }[]
  } = {
    loaded: false,
    messages: []
  }

  async componentDidMount() {
    const {
      logEvents,
      nextBackwardToken,
      nextForwardToken
    } = await getLogEvents({
      logGroup: this.props.logGroup,
      logStream: this.props.logStream
    })

    this.setState({
      loaded: true,
      nextBackwardToken,
      nextForwardToken,
      messages: prepareMessagesArr(
        logEvents.map((log, i) => ({
          timestamp: log.timestamp,
          messageShort: log.message.slice(0, 500),
          messageLong: log.message
        }))
      )
    })
  }

  async onRetryNew() {
    this.setState({
      loadingNew: true
    })
    const { logEvents, nextForwardToken } = await getLogEvents({
      logGroup: this.props.logGroup,
      logStream: this.props.logStream,
      nextToken: this.state.nextForwardToken
    })

    this.setState({
      loadingNew: false,
      messages: prepareMessagesArr([
        ...this.state.messages,
        ...logEvents.map((log, i) => ({
          timestamp: log.timestamp,
          messageShort: log.message.slice(0, 500),
          messageLong: log.message
        }))
      ]),
      nextForwardToken
    })
  }

  async onRetryOld() {
    this.setState({
      loadingOld: true
    })
    const { logEvents, nextBackwardToken } = await getLogEvents({
      logGroup: this.props.logGroup,
      logStream: this.props.logStream,
      nextToken: this.state.nextBackwardToken
    })

    this.setState({
      loadingOld: false,
      messages: prepareMessagesArr([
        ...logEvents.map((log, i) => ({
          timestamp: log.timestamp,
          messageShort: log.message.slice(0, 500),
          messageLong: log.message
        })),
        ...this.state.messages
      ]),
      nextBackwardToken
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
          {this.state.messages.map(message => {
            let shortMessageMatched: string[] = []
            if (message.messageShort.startsWith('REPORT RequestId:')) {
              const matchDuration = message.messageShort.match(
                /Duration: (.*?) ms/
              )
              const matchMaxMemory = message.messageShort.match(
                /Max Memory Used: (.*?) MB/
              )
              const matchInitDur = message.messageShort.match(
                /Init Duration: (.*?) ms/
              )

              if (matchInitDur) {
                shortMessageMatched.push(`init: ${matchInitDur[1]} ms`)
              }
              if (matchDuration) {
                shortMessageMatched.push(`${matchDuration[1]} ms`)
              }
              if (matchMaxMemory) {
                shortMessageMatched.push(`${matchMaxMemory[1]} MB`)
              }
              
            }
            return (
              <Panel
                key={message.key}
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
                      {shortMessageMatched.length
                        ? shortMessageMatched.map(tag => (
                            <span className="event-tag">{tag}</span>
                          ))
                        : message.messageShort}
                    </span>
                  </div>
                }
              >
                <LogEvent message={message.messageLong} />
              </Panel>
            )
          })}
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

function prepareMessagesArr(
  messages: {
    timestamp: number
    key?: string
    messageShort: string
    messageLong: string
  }[]
): {
  timestamp: number
  key: string
  messageShort: string
  messageLong: string
}[] {
  return (
    messages
      //.sort((a, b) => b.timestamp - a.timestamp)
      .map((message, i) => {
        return {
          ...message,
          key: `${i}-${message.timestamp}`
        }
      })
  )
}
