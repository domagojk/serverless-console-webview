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

export function getLambdaOverview({
  fnName,
  region
}: {
  fnName: string
  region?: string
}): Promise<{ overviewProps: any; error?: string }> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLambdaOverview',
      messageId,
      payload: {
        fnName,
        region
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

export function getLogStreams({
  logGroupName,
  nextToken,
  limit,
  region
}: {
  logGroupName: string
  nextToken?: string
  limit?: number
  region?: string
}): Promise<{
  logStreams: any[]
  error?: string
  nextToken?: string
  timestamp: number
}> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'getLogStreams',
      messageId,
      payload: {
        nextToken,
        limit,
        logGroupName,
        region
      }
    })

    subscriptions[messageId] = (message: any) => {
      if (message.ignore) {
        resolve({
          logStreams: [],
          nextToken,
          timestamp: Date.now()
        })
      } else if (message.error) {
        resolve({
          logStreams: [],
          error: message.error,
          timestamp: Date.now()
        })
      } else {
        resolve({
          nextToken: message.nextToken,
          logStreams: message.logStreams,
          timestamp: Date.now()
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
        region: params.region
      }
    })

    subscriptions[messageId] = (message: any) => {
      if (message.ignore) {
        reject({ ignore: true })
      } else {
        resolve({
          nextBackwardToken: message.nextBackwardToken,
          nextForwardToken: message.nextForwardToken,
          logEvents: message.logEvents
        })
      }
    }
  })
}

export function listCloudFormationStacks({
  region,
  awsProfile
}: {
  region: string
  awsProfile: string
}): Promise<{
  stacks?: string[]
  error?: string
}> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'listCloudFormationStacks',
      messageId,
      payload: {
        region,
        awsProfile
      }
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          stacks: [],
          error: message.error
        })
      } else {
        resolve({
          stacks: message.stacks
        })
      }
    }
  })
}

export function describeLogGroups({
  region,
  awsProfile
}: {
  region: string
  awsProfile: string
}): Promise<{
  logGroups?: string[]
  error?: string
}> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'describeLogGroups',
      messageId,
      payload: {
        region,
        awsProfile
      }
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          logGroups: [],
          error: message.error
        })
      } else {
        resolve({
          logGroups: message.logGroups
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
      payload
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        reject({
          message: message.error
        })
      } else {
        resolve()
      }
    }
  })
}

export function setAutoRefresh(enabled: boolean): Promise<number> {
  return new Promise(resolve => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'setAutoRefresh',
      messageId,
      payload: {
        enabled
      }
    })

    subscriptions[messageId] = (message: any) => {
      resolve(message.autoRefreshInterval)
    }
  })
}
