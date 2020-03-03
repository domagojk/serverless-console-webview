// import { DynamoDB } from 'aws-sdk'
import { vscode, subscriptions } from './asyncData'

export function dynamoDbTableDesc(): any {
  /*
  const dynamo = new DynamoDB({
    credentials: {
      accessKeyId: '',
      secretAccessKey: ''
    },
    region: 'us-east-1'
  })

  const res = await dynamo
    .describeTable({
      TableName: 'eventstore'
    })
    .promise()

  return res.Table
  */

  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'describeTable',
      messageId,
      payload: {}
    })

    subscriptions[messageId] = (res: any) => {
      if (res.error) {
        reject(res.error)
      } else {
        resolve(res)
      }
    }
  })
}

export async function dynamoDbScan({
  lastEvaluatedKey,
  limit = 100
}: {
  lastEvaluatedKey?: any
  limit?: number
}): Promise<{
  items: any[]
  count: number
  columns: Record<string, number>
  countPerColumn: Record<string, number>
  scannedCount: number
  lastEvaluatedKey?: any
}> {
  /*
  const dynamo = new DynamoDB.DocumentClient({
    credentials: {
      accessKeyId: '',
      secretAccessKey: ''
    },
    region: ''
  })

  const res = await dynamo
    .scan({
      TableName: '',
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
    })
    .promise()
  */

  const res: any = await new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'scan',
      messageId,
      payload: {
        lastEvaluatedKey,
        limit
      }
    })

    subscriptions[messageId] = (res: any) => {
      if (res.error) {
        reject(res.error)
      } else {
        resolve(res)
      }
    }
  })

  let countPerColumn = {}
  let columns = {}
  res.Items.forEach(item => {
    // loop trough all items and get column header
    Object.keys(item).forEach(itemKey => {
      // calculate size of the string
      let size = String(item[itemKey]).length
      if (columns[itemKey] === undefined) {
        countPerColumn[itemKey] = 0
        columns[itemKey] = 0
      }
      columns[itemKey] += size
      countPerColumn[itemKey] += 1
    })
  })
  Object.keys(columns).forEach(column => {
    // set column recommended width
    const avg = Math.round(columns[column] / countPerColumn[column])
    columns[column] = column.length > avg ? column.length : avg
  })

  return {
    items: res.Items,
    count: res.Count,
    columns,
    scannedCount: res.ScannedCount,
    countPerColumn,
    lastEvaluatedKey: res.LastEvaluatedKey
  }
}

export function editItem(payload: {
  content: any
  tableName?: string
  hashKey?: string
  sortKey?: string
  selectColumn?: string
  columns?: string[]
  newData?: any
}) {
  vscode.postMessage({
    command: 'editItem',
    payload
  })
}

export function deleteItem(payload: {
  tableName: string
  hashKey: string
  sortKey: string
}) {
  vscode.postMessage({
    command: 'deleteItem',
    payload
  })
}

export function createItem() {
  vscode.postMessage({
    command: 'createItem'
  })
}
