// import { DynamoDB } from 'aws-sdk'
import { vscode, subscriptions } from './asyncData'

export function dynamoDbTableDesc(): Promise<{
  tableName: string
  hashKey: string
  sortKey: string
  indexes: {
    id: string
    name: string
    hashRangeKeys: string[]
  }[]
}> {
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
        const hashKey = res.KeySchema.find(key => key.KeyType === 'HASH')
        const rangeKey = res.KeySchema.find(key => key.KeyType === 'RANGE')

        resolve({
          tableName: res.TableName,
          hashKey: hashKey.AttributeName,
          sortKey: rangeKey
            ? rangeKey.AttributeName && rangeKey.AttributeName
            : null,

          indexes: [
            {
              id: 'default',
              name: rangeKey
                ? `[Table] ${res.TableName}: ${hashKey.AttributeName}, ${rangeKey.AttributeName}`
                : `[Table] ${res.TableName}: ${hashKey.AttributeName}`,
              hashRangeKeys: [
                hashKey.AttributeName,
                rangeKey?.AttributeName
              ].filter(val => !!val)
            },
            ...res.GlobalSecondaryIndexes.map(index => {
              const hashKey = index.KeySchema.find(
                key => key.KeyType === 'HASH'
              )
              const rangeKey = index.KeySchema.find(
                key => key.KeyType === 'RANGE'
              )

              return {
                id: index.IndexName,
                name: rangeKey
                  ? `[Index] ${index.IndexName}: ${hashKey.AttributeName}, ${rangeKey.AttributeName}`
                  : `[Index] ${index.IndexName}: ${hashKey.AttributeName}`,
                hashRangeKeys: [
                  hashKey.AttributeName,
                  rangeKey?.AttributeName
                ].filter(val => !!val)
              }
            })
          ]
        })
      }
    }
  })

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
}

export async function dynamoDbFetchItems({
  lastEvaluatedKey,
  limit = 100,
  queryType = 'scan',
  index
}: {
  lastEvaluatedKey?: any
  limit?: number
  index?: string
  queryType?: 'scan' | 'query'
}): Promise<{
  items: any[]
  count: number
  columns: Record<string, number>
  countPerColumn: Record<string, number>
  scannedCount: number
  lastEvaluatedKey?: any
}> {
  const res: any = await new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'fetchItems',
      messageId,
      payload: {
        lastEvaluatedKey,
        index,
        queryType,
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
}

export function editItem(payload: {
  content: any
  index: string
  queryType: string
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
