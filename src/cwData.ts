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

export function getLogStreams(logGroup: string) {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogStreams',
      messageId,
      payload: {
        logGroup
      }
    })

    subscriptions[messageId] = (message: any) => {
      resolve(message.logStreams)
    }
  })
}

export function getLogEvents(params: {
  logStream: string
  logGroup: string
}): Promise<
  {
    ingestionTime: string
    message: string
    timestamp: number
  }[]
> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogEvents',
      messageId,
      payload: {
        logGroup: params.logGroup,
        logStream: params.logStream
      }
    })

    subscriptions[messageId] = (message: any) => {
      resolve(message.logEvents)
    }
  })
}
