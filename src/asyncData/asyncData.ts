import moment from 'moment'

export type LogStreamData = {
  creationTime: number
  firstEventTimestamp: number
  lastEventTimestamp: number
  lastIngestionTime: number
  sortByTimestamp: number
  storedBytes: number
  logStreamName: string
  uploadSequenceToken: string
  arn: string
}

export let vscode = {
  postMessage: console.log,
}

try {
  // @ts-ignore
  vscode = acquireVsCodeApi()
} catch (err) {}

export let subscriptions: Record<string, any> = {}

window.addEventListener('message', (event) => {
  const message = event.data

  if (subscriptions[message.messageId]) {
    subscriptions[message.messageId](message.payload)
    delete subscriptions[message.messageId]
  }
})

export function getLambdaOverview({
  fnName,
  region,
  awsProfile,
}: {
  fnName: string
  region?: string
  awsProfile?: string
}): Promise<{ overviewProps: any; error?: string }> {
  return new Promise((resolve) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLambdaOverview',
      messageId,
      payload: {
        fnName,
        region,
        awsProfile,
      },
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          overviewProps: {},
          error: message.error,
        })
      } else {
        resolve({
          overviewProps: message,
        })
      }
    }
  })
}

export function getLogStreams({
  logGroupName,
  nextToken,
  limit,
  region,
  awsProfile,
}: {
  logGroupName: string
  nextToken?: string
  limit?: number
  region?: string
  awsProfile?: string
}): Promise<{
  logStreams: any[]
  error?: string
  nextToken?: string
  timestamp: number
}> {
  return new Promise((resolve) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogStreams',
      messageId,
      payload: {
        nextToken,
        limit,
        logGroupName,
        region,
        awsProfile,
      },
    })

    subscriptions[messageId] = (message: any) => {
      if (message.ignore) {
        resolve({
          logStreams: [],
          nextToken,
          timestamp: Date.now(),
        })
      } else if (message.error) {
        resolve({
          logStreams: [],
          error: message.error,
          timestamp: Date.now(),
        })
      } else {
        resolve({
          nextToken: message.nextToken,
          logStreams: message.logStreams,
          timestamp: Date.now(),
        })
      }
    }
  })
}

export function getLogEvents(params: {
  logStream: string
  logGroup: string
  nextToken?: string
  region?: string
  awsProfile?: string
}): Promise<{
  logEvents: {
    ingestionTime: string
    message: string
    timestamp: number
  }[]
  nextForwardToken: string
  nextBackwardToken: string
}> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogEvents',
      messageId,
      payload: {
        nextToken: params.nextToken,
        logGroup: params.logGroup,
        logStream: params.logStream,
        region: params.region,
        awsProfile: params.awsProfile,
      },
    })

    subscriptions[messageId] = (message: any) => {
      if (message.ignore) {
        reject({ ignore: true })
      } else if (message.error) {
        reject(message.error)
      } else {
        resolve({
          nextBackwardToken: message.nextBackwardToken,
          nextForwardToken: message.nextForwardToken,
          logEvents: message.logEvents,
        })
      }
    }
  })
}

export function listCloudFormationStacks({
  region,
  awsProfile,
}: {
  region: string
  awsProfile: string
}): Promise<{
  stacks?: string[]
  error?: string
}> {
  return new Promise((resolve) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'listCloudFormationStacks',
      messageId,
      payload: {
        region,
        awsProfile,
      },
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          stacks: [],
          error: message.error,
        })
      } else {
        resolve({
          stacks: message.stacks,
        })
      }
    }
  })
}

export function describeLogGroups({
  region,
  awsProfile,
}: {
  region: string
  awsProfile: string
}): Promise<{
  logGroups?: string[]
  error?: string
}> {
  return new Promise((resolve) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'describeLogGroups',
      messageId,
      payload: {
        region,
        awsProfile,
      },
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          logGroups: [],
          error: message.error,
        })
      } else {
        resolve({
          logGroups: message.logGroups,
        })
      }
    }
  })
}

export function addService(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'addService',
      messageId,
      payload,
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject({
          message: message.error,
        })
      } else {
        resolve()
      }
    }
  })
}

export function setAutoRefresh(enabled: boolean): Promise<number> {
  return new Promise((resolve) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'setAutoRefresh',
      messageId,
      payload: {
        enabled,
      },
    })

    subscriptions[messageId] = (message: any) => {
      resolve(message.autoRefreshInterval)
    }
  })
}

export function startQuery(payload: {
  ref: string
  startTime: number
  endTime: number
  query: string
  logGroupName: string
  region: string
  awsProfile?: string
}): Promise<{ queryId: string }> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'startQuery',
      messageId,
      payload,
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject(message.error)
      } else {
        resolve(message)
      }
    }
  })
}

export function stopQuery(payload: {
  queryId: string
  region: string
  awsProfile: string
}): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'stopQuery',
      messageId,
      payload,
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject(message.error)
      } else {
        resolve(message)
      }
    }
  })
}

export function getQueryResults(payload: {
  queryId: string
  region: string
  awsProfile: string
  ref: string
}): Promise<{
  status:
    | 'Scheduled'
    | 'Running'
    | 'Complete'
    | 'Failed'
    | 'Cancelled'
    | 'Error'
  statistics?: {
    bytesScanned: number
    recordsMatched: number
    recordsScanned: number
  }
  results: {
    timestamp: number
    messageShort: string
    messageLong: string
  }[]
}> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getQueryResults',
      messageId,
      payload,
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject({
          status: 'Error',
          message: message.error,
          results: [],
        })
      } else {
        resolve({
          ...message,
          results: message.results
            .map((r) =>
              r.reduce((acc, curr) => {
                acc[curr.field] = curr.value
                return acc
              }, {})
            )
            .map((log) => {
              var utcOffsetInMs = new Date().getTimezoneOffset() * 60000

              return {
                timestamp:
                  moment(log['@timestamp']).toDate().getTime() - utcOffsetInMs,
                messageShort: log['@message'].slice(0, 500),
                messageLong: log['@message'],
                logStream: log['@logStream'],
              }
            }),
        })
      }
    }
  })
}

export function startTrial(): Promise<{ license: any }> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'startTrial',
      messageId,
      payload: {},
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject(message.error)
      } else {
        resolve(message)
      }
    }
  })
}

export function buyLicense() {
  vscode.postMessage({
    command: 'buyLicense',
    payload: {},
  })
}

export function enterLicense() {
  vscode.postMessage({
    command: 'enterLicense',
    payload: {},
  })
}

export function viewstateChanged(params: { page: string; tab: string }) {
  vscode.postMessage({
    command: 'viewstateChanged',
    payload: params,
  })
}

export function settingsChanged(params: Record<string, any>) {
  vscode.postMessage({
    command: 'settingsChanged',
    payload: params,
  })
}

export function showLogsOptions(): Promise<any> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'showLogsOptions',
      messageId,
      payload: {},
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject(message.error)
      } else {
        resolve(message)
      }
    }
  })
}
