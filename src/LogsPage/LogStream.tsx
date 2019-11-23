import React from 'react'
import { getLogEvents } from './asyncData'
import { Collapse, Checkbox, Input } from 'antd'
import moment from 'moment'
import { LogEvent } from './LogEvent'
import { RelativeTime } from './RelativeTime'

const { Panel } = Collapse

export class LogStream extends React.Component<{
  logStream: string
  logGroup: string
  loadingNew?: boolean
  loadingOld?: boolean
}> {
  state: {
    loaded: boolean
    search: string
    groupPerRequest: boolean
    loadingNew?: boolean
    loadingOld?: boolean
    nextBackwardToken?: string
    nextForwardToken?: string
    messages: {
      timestamp: number
      messageShort: string
      messageLong: string
    }[]
    preparedMessages: {
      timestamp: number
      key: string
      messageShort: string
      messageLong: string
      messagesLong?: string[]
      requestId?: string
      searchMatches: number
      shortMessageMatched?: string[]
    }[]
  } = {
    search: '',
    groupPerRequest: document.vscodeData.groupPerRequest,
    loaded: false,
    preparedMessages: [],
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
      messages: logEvents.map((log, i) => ({
        timestamp: log.timestamp,
        messageShort: log.message.slice(0, 500),
        messageLong: log.message
      })),
      preparedMessages: prepareMessagesArr(
        logEvents.map((log, i) => ({
          timestamp: log.timestamp,
          messageShort: log.message.slice(0, 500),
          messageLong: log.message
        })),
        this.state.groupPerRequest,
        this.state.search
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
      messages: [
        ...this.state.messages,
        ...logEvents.map((log, i) => ({
          timestamp: log.timestamp,
          messageShort: log.message.slice(0, 500),
          messageLong: log.message
        }))
      ],
      preparedMessages: prepareMessagesArr(
        [
          ...this.state.messages,
          ...logEvents.map((log, i) => ({
            timestamp: log.timestamp,
            messageShort: log.message.slice(0, 500),
            messageLong: log.message
          }))
        ],
        this.state.groupPerRequest,
        this.state.search
      ),
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
      messages: [
        ...logEvents.map((log, i) => ({
          timestamp: log.timestamp,
          messageShort: log.message.slice(0, 500),
          messageLong: log.message
        })),
        ...this.state.messages
      ],
      preparedMessages: prepareMessagesArr(
        [
          ...logEvents.map((log, i) => ({
            timestamp: log.timestamp,
            messageShort: log.message.slice(0, 500),
            messageLong: log.message
          })),
          ...this.state.messages
        ],
        this.state.groupPerRequest,
        this.state.search
      ),
      nextBackwardToken
    })
  }

  render() {
    return this.state.loaded ? (
      [
        <div className="logstream-options" key="options">
          <Input.Search
            onChange={e => {
              this.setState({
                search: e.target.value,
                preparedMessages: prepareMessagesArr(
                  this.state.messages,
                  this.state.groupPerRequest,
                  e.target.value
                )
              })
            }}
            value={this.state.search}
            placeholder="search"
            allowClear={true}
            size="small"
          />
          <Checkbox
            checked={this.state.groupPerRequest}
            onChange={e => {
              this.setState({
                groupPerRequest: e.target.checked,
                preparedMessages: prepareMessagesArr(
                  this.state.messages,
                  e.target.checked,
                  this.state.search
                )
              })
            }}
          >
            Group per request
          </Checkbox>
        </div>,
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
          {this.state.preparedMessages.map(message => {
            return (
              <Panel
                key={message.key}
                className={message.searchMatches === 0 ? 'blurforsearch' : ''}
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
                      {message.searchMatches > 0 && <span className="event-tag matches">matches: {message.searchMatches}</span>}
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
                  <LogEvent key={i} message={m} search={this.state.search} />
                ))}
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

function extractJSON(str: string) {
  const match = str.match(/{[\s\S]*}/)

  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      const splitted = str.split(match[0])

      return `${splitted[0]}
      ${JSON.stringify(parsed, null, 2)}
      ${splitted[1]}`
    } catch (err) {
      return str
    }
  }

  return str
}

function prepareMessagesArr(
  messages: {
    timestamp: number
    key?: string
    messageShort: string
    messageLong: string
  }[],
  group: boolean,
  search: string
): {
  index: number
  timestamp: number
  key: string
  messageShort: string
  requestId: string
  searchMatches: number
  messageLong: string
  messagesLong?: string[]
  shortMessageMatched?: string[]
}[] {
  let requestIds: string[] = []

  const messagesUngrouped = messages.map((message, i) => {
    let requestId = ''

    const matchStarReqId = message.messageLong.match(
      /START RequestId: ([a-zA-z0-9\-]*)/
    )
    const matchReportReqId = message.messageLong.match(
      /REPORT RequestId: ([a-zA-z0-9\-]*)/
    )

    for (let searchReqId of requestIds) {
      if (message.messageShort.includes(searchReqId)) {
        requestId = searchReqId
        break
      }
    }

    if (matchStarReqId) {
      requestIds.push(matchStarReqId[1])
      requestId = matchStarReqId[1]
    }

    let shortMessageMatched: string[] = []

    if (matchReportReqId) {
      requestId = matchReportReqId[1]

      const matchDuration = message.messageShort.match(/Duration: (.*?) ms/)
      const matchMaxMemory = message.messageShort.match(
        /Max Memory Used: (.*?) MB/
      )
      const matchInitDur = message.messageShort.match(/Init Duration: (.*?) ms/)

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

    let searchMatches = -1
    if (search) {
      const searchStr = search.replace(/\s\s+/g, ' ').toLowerCase()
      const forSearch = extractJSON(message.messageLong)
        .replace(/\s\s+/g, ' ')
        .toLowerCase()

      const matches = forSearch.match(new RegExp(searchStr, 'g'))
      searchMatches = matches ? matches.length : 0
    }

    const key = `${i}-${message.timestamp}`

    return {
      ...message,
      requestId: requestId || key,
      messagesLong: [message.messageLong],
      shortMessageMatched,
      searchMatches,
      index: i,
      key
    }
  })

  if (!group) {
    return messagesUngrouped
  }

  const groupedMessages = messagesUngrouped.reduce((acc, curr) => {
    if (acc[curr.requestId]) {
      acc[curr.requestId].push(curr)
    } else {
      acc[curr.requestId] = [curr]
    }
    return acc
  }, {} as any)

  let groupedMessagesFlatted: any[] = []
  Object.keys(groupedMessages).forEach(reqId => {
    const grouped = groupedMessages[reqId]
    let shortMessageMatched
    const withShortMessageMatched = grouped.find(
      m => m.shortMessageMatched.length
    )

    if (withShortMessageMatched) {
      shortMessageMatched = withShortMessageMatched.shortMessageMatched
    }

    groupedMessagesFlatted.push({
      timestamp: grouped[0].timestamp,
      key: grouped[0].key,
      index: grouped[0].index,
      shortMessageMatched,
      searchMatches: grouped.reduce((acc, curr) => acc + curr.searchMatches, 0),
      messageShort: grouped[0].messageShort,
      messagesLong: grouped.map((m: any) => m.messageLong)
    })
  })

  return groupedMessagesFlatted.sort((a, b) => a.index - b.index)
}
