// todo: remove for production
import { DynamoDB } from 'aws-sdk'

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
  scannedCount: number
  lastEvaluatedKey?: any
}> {
  const dynamo = new DynamoDB.DocumentClient({
    credentials: {
      accessKeyId: 'AKIAIBCVFIWOOPCMOASQ',
      secretAccessKey: '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'
    },
    region: 'eu-west-1'
  })

  const res = await dynamo
    .scan({
      TableName: 'eventstore-trainingtube',
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
    })
    .promise()

  let columns = {}
  res.Items.forEach(item => {
    // loop trough all items and get column header
    Object.keys(item).forEach(itemKey => {
      // calculate size of the string
      let size = String(item[itemKey]).length
      if (columns[itemKey] === undefined) {
        columns[itemKey] = 0
      }
      columns[itemKey] += size
    })
  })
  Object.keys(columns).forEach(column => {
    // set column recommended width
    const avg = Math.round(columns[column] / res.Count)
    columns[column] = column.length > avg ? column.length : avg
  })

  return {
    items: res.Items,
    count: res.Count,
    columns,
    scannedCount: res.ScannedCount,
    lastEvaluatedKey: res.LastEvaluatedKey
  }
}
