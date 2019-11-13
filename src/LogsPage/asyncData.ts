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

let vscode = {
  postMessage: console.log
}

try {
  // @ts-ignore
  vscode = acquireVsCodeApi()
} catch (err) {}

let subscriptions: Record<string, any> = {}

window.addEventListener('message', event => {
  const message = event.data

  if (subscriptions[message.messageId]) {
    subscriptions[message.messageId](message.payload)
    delete subscriptions[message.messageId]
  }
})

export function getLambdaOverview(
  fnName: string
): Promise<{ overviewProps: any; error?: string }> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLambdaOverview',
      messageId,
      payload: {
        fnName
      }
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          overviewProps: {},
          error: message.error
        })
      } else {
        resolve({
          overviewProps: message
        })
      }
    }
  })
}

export function getLogStreams(
  logGroupName: string,
  nextToken?: string
): Promise<{ logStreams: any[]; error?: string; nextToken?: string }> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogStreams',
      messageId,
      payload: {
        nextToken,
        logGroupName
      }
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          logStreams: [],
          error: message.error
        })
      } else {
        resolve({
          nextToken: message.nextToken,
          logStreams: message.logStreams
        })
      }
    }
  })
}

export function getLogEvents(params: {
  logStream: string
  logGroup: string
  nextToken?: string
}): Promise<{
  logEvents: {
    ingestionTime: string
    message: string
    timestamp: number
  }[]
  nextForwardToken: string
  nextBackwardToken: string
}> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogEvents',
      messageId,
      payload: {
        nextToken: params.nextToken,
        logGroup: params.logGroup,
        logStream: params.logStream
      }
    })

    subscriptions[messageId] = (message: any) => {
      resolve({
        nextBackwardToken: message.nextBackwardToken,
        nextForwardToken: message.nextForwardToken,
        logEvents: message.logEvents
      })
    }
  })
}
