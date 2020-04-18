import { vscode, subscriptions } from './asyncData'
import { QueryFilter } from '../DynamoDb/DynamoDb'

export function listDynamoDbTables({
  region,
  awsProfile,
}: {
  region: string
  awsProfile: string
}): Promise<{
  tableNames?: string[]
  error?: string
}> {
  return new Promise((resolve) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'listDynamoDbTables',
      messageId,
      payload: {
        region,
        awsProfile,
      },
    })

    subscriptions[messageId] = (message: any) => {
      if (message.error) {
        resolve({
          tableNames: [],
          error: message.error,
        })
      } else {
        resolve({
          tableNames: message.tableNames,
        })
      }
    }
  })
}

export function dynamoDbTableDesc(): Promise<{
  tableName: string
  hashKey: string
  sortKey: string
  indexes: {
    id: string
    name: string
    hashRangeKeys: string[]
  }[]
  attributesSchema: Record<string, string>
}> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'describeTable',
      messageId,
      payload: {},
    })

    subscriptions[messageId] = (res: {
      error?: any
      indexes: { keys: string[]; id: string }[]
      descOutput: any
    }) => {
      if (res.error) {
        reject(res.error)
      } else {
        const hashKey = res.descOutput.KeySchema.find(
          (key) => key.KeyType === 'HASH'
        )
        const rangeKey = res.descOutput.KeySchema.find(
          (key) => key.KeyType === 'RANGE'
        )

        resolve({
          tableName: res.descOutput.TableName,
          hashKey: hashKey.AttributeName,
          sortKey: rangeKey
            ? rangeKey.AttributeName && rangeKey.AttributeName
            : null,
          indexes: res.indexes.map(({ id, keys }) => {
            const [indexHashKey, indexRangeKey] = keys

            const namePrefix =
              id === 'default'
                ? `[Table] ${res.descOutput.TableName}`
                : `[Index] ${id}`

            return {
              id,
              name: indexRangeKey
                ? `${namePrefix}: ${indexHashKey}, ${indexRangeKey}`
                : `${namePrefix}: ${indexHashKey}`,
              hashRangeKeys: keys,
            }
          }),
          attributesSchema: res.descOutput.AttributeDefinitions.reduce(
            (acc, curr) => {
              return {
                ...acc,
                [curr.AttributeName]: curr.AttributeType,
              }
            },
            {}
          ),
        })
      }
    }
  })
}

export async function dynamoDbFetchItems({
  lastEvaluatedKey,
  limit = 100,
  queryType = 'scan',
  filters,
  index,
  lastFetchResult,
  onlyRefreshCurrentItems,
}: {
  lastEvaluatedKey?: any
  limit?: number
  index?: string
  queryType?: 'scan' | 'query'
  filters?: QueryFilter[]
  lastFetchResult?: any
  onlyRefreshCurrentItems?: boolean
}): Promise<{
  items: any[]
  changedItems: any[]
  count: number
  widthPerColumn: Record<string, number>
  countPerColumn: Record<string, number>
  scannedCount: number
  lastEvaluatedKey?: any
  changes: any[]
  timeFetched: number
}> {
  const res: {
    Count: number
    LastEvaluatedKey: any
    ScannedCount: number
    Items: any[]
    changedItems: any[]
    changes: any[]
    timeFetched: number
  } = await new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'fetchItems',
      messageId,
      payload: {
        lastEvaluatedKey,
        index,
        queryType,
        filters: filters.map((filter) => {
          if (filter.dataType) {
            return filter
          } else {
            return {
              ...filter,
              dataType: filter.autoDetectedDataType,
            }
          }
        }),
        limit,
        lastFetchResult,
        onlyRefreshCurrentItems,
      },
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
  let widthPerColumn = {}
  res.changedItems.forEach((item) => {
    // loop trough all items and get column header
    Object.keys(item.data).forEach((itemKey) => {
      // calculate size of the string
      let size = String(item.data[itemKey]).length
      if (widthPerColumn[itemKey] === undefined) {
        countPerColumn[itemKey] = 0
        widthPerColumn[itemKey] = 0
      }
      widthPerColumn[itemKey] += size
      countPerColumn[itemKey] += 1
    })
  })
  Object.keys(widthPerColumn).forEach((column) => {
    // set column recommended width
    const avg = Math.round(widthPerColumn[column] / countPerColumn[column])
    widthPerColumn[column] = column.length > avg ? column.length : avg
  })

  return {
    items: res.Items,
    changedItems: res.changedItems,
    count: res.Count,
    scannedCount: res.ScannedCount,
    lastEvaluatedKey: res.LastEvaluatedKey,
    widthPerColumn,
    countPerColumn,
    changes: res.changes || [],
    timeFetched: res.timeFetched,
  }
}

export function editItem(payload: {
  content: any
  index: string
  queryType: string
  hashKey: string
  sortKey?: string
  selectColumn?: string
  columns?: string[]
}) {
  vscode.postMessage({
    command: 'editItem',
    payload,
  })
}

export function deleteItem(payload: {
  tableName: string
  queryType: string
  index: string
  hashKey: string
  sortKey: string
}) {
  vscode.postMessage({
    command: 'deleteItem',
    payload,
  })
}

export function createItem(prepopulatedItem?: any) {
  vscode.postMessage({
    command: 'createItem',
    payload: {
      prepopulatedItem,
    },
  })
}

export function execute() {
  vscode.postMessage({
    command: 'execute',
  })
}

export function discardChange(id) {
  vscode.postMessage({
    command: 'discardChange',
    payload: {
      id,
    },
  })
}

export function openChange(id) {
  vscode.postMessage({
    command: 'openChange',
    payload: {
      id,
    },
  })
}

export function showLicenseDialog() {
  vscode.postMessage({
    command: 'showLicenseDialog',
    payload: {},
  })
}

export function dynamodbOptions(columns): Promise<any> {
  return new Promise((resolve, reject) => {
    const messageId = Math.random()
    vscode.postMessage({
      command: 'dynamodbOptions',
      messageId,
      payload: {
        columns,
      },
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
