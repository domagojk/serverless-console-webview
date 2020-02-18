// todo: remove for production
import { DynamoDB } from 'aws-sdk'
import { vscode } from './asyncData'

export async function dynamoDbTableDesc() {
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
  const dynamo = new DynamoDB.DocumentClient({
    credentials: {
      accessKeyId: '',
      secretAccessKey: ''
    },
    region: 'us-east-1'
  })

  const res = await dynamo
    .scan({
      TableName: 'eventstore',
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
    })
    .promise()

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

export function openJSON(payload: {
  content: any
  tableName?: string,
  hashKey?: string,
  sortKey?: string
  selectColumn?: string
  columns?: string[]
}) {
  vscode.postMessage({
    command: 'openJSON',
    payload
  })
}
