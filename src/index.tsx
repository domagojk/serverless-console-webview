import 'antd/dist/antd.css'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import { Collapse } from 'antd'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import moment from 'moment'
import { getLogStreams, getLogEvents } from './cwData'

const { Panel } = Collapse

class LogMessage extends React.Component<{ message: string }> {
  state = {
    loaded: false
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loaded: true
      })
    }, 0)
  }

  renderWithJson(content: string) {
    const splitted = extractJSON(content)

    if (splitted) {
      return (
        <div className="logevent-longmessage">
          <div>{splitted[0]}</div>
          <SyntaxHighlighter
            className="syntax-highlighter"
            language="json"
            style={docco}
          >
            {splitted[1]}
          </SyntaxHighlighter>
          <div>{splitted[2]}</div>
        </div>
      )
    }
    return <div className="logevent-longmessage">{content}</div>
  }

  render() {
    return this.state.loaded ? (
      this.renderWithJson(this.props.message)
    ) : (
      <div>loading</div>
    )
  }
}

class Log extends React.Component<{ logStream: string; logGroup: string }> {
  state: {
    loaded: boolean
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
        messageShort: log.message.slice(0, 100),
        messageLong: log.message
      }))
    })
  }

  render() {
    return this.state.loaded ? (
      [
        <div className="retry-message" key="retryold">
          No older events found at the moment.{' '}
          <span className="retry-link">Retry</span>
        </div>,
        <Collapse key="collapse" bordered={false}>
          {this.state.messages.map(message => (
            <Panel
              key={message.time}
              header={
                <div className="logevent-header">
                  <span className="logevent-time">
                    <div>
                      <span className="relative-time">
                        {moment(message.time).fromNow()}
                      </span>
                      <span className="abs-time">
                        {moment(message.time).format('LLL')}
                      </span>
                    </div>
                  </span>
                  <span className="logevent-shortmessage">
                    {message.messageShort}
                  </span>
                </div>
              }
            >
              <LogMessage message={message.messageLong} />
            </Panel>
          ))}
        </Collapse>,
        <div className="retry-message" key="retrynew">
          No newer events found at the moment.{' '}
          <span className="retry-link">Retry</span>
        </div>
      ]
    ) : (
      <div>loading</div>
    )
  }
}

class LogStreams extends React.Component {
  state: {
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
    logStreams: [],
    loaded: false
  }

  async componentDidMount() {
    const logStreams = await getLogStreams('')
    this.setState({
      loaded: true,
      logStreams
    })
  }

  render() {
    return this.state.loaded ? (
      <Collapse className="logstreamslist">
        {this.state.logStreams.map(logStream => (
          <Panel
            header={
              <div>
                <span className="relative-time">
                  {moment(logStream.lastEventTimestamp).fromNow()}
                </span>
                <span className="abs-time">
                  {moment(logStream.lastEventTimestamp).format('LLL')}
                </span>
              </div>
            }
            key={logStream.arn}
          >
            <Log logGroup="" logStream={logStream.logStreamName} />
          </Panel>
        ))}
      </Collapse>
    ) : (
      <div>loading</div>
    )
  }
}

ReactDOM.render(<LogStreams />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

function extractJSON(str: string) {
  const match = str.match(/{[\s\S]*}/)

  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      const splitted = str.split(match[0])

      return [splitted[0], JSON.stringify(parsed, null, 2), splitted[1]]
    } catch (err) {
      return false
    }
  }

  return false
}
