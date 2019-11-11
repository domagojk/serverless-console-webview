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

export function getLogStreams(
  logGroupName: string
): Promise<{ logStreams: any[]; error?: string }> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogStreams',
      messageId,
      payload: {
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
          logStreams: message.logStreams,
          error: message.error
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
