export type Column = {
  key: string
  dataKey: string
  title: string
  resizable: boolean
  sortable: boolean
  width: number
}

export function getColumns({
  currentColumns,
  indexHashRangeKeys,
  countPerColumn,
  widthPerColumn,
  hashKey,
  sortKey,
}: {
  countPerColumn: Record<string, number>
  widthPerColumn: Record<string, number>
  indexHashRangeKeys: string[]
  currentColumns: Column[]
  hashKey: string
  sortKey: string
}): Column[] {
  const initialColumnNames = Array.from(
    new Set([hashKey, sortKey, ...indexHashRangeKeys].filter((v) => !!v))
  )

  let columnNames =
    currentColumns.length === 0
      ? initialColumnNames
      : currentColumns.map((c) => c.key)

  Object.keys(countPerColumn)
    .sort((a, b) => {
      if (countPerColumn[a] === undefined || countPerColumn[b] === undefined) {
        return 0
      }
      return countPerColumn[b] - countPerColumn[a]
    })
    .forEach((column) => {
      if (!columnNames.includes(column)) {
        // push new column if not found in previous query
        // can not just use params.columns because the order of columns
        // is not preserved in that case
        columnNames.push(column)
      }
    })

  return columnNames
    .filter((column) => countPerColumn[column] !== undefined)
    .map((column) => {
      const prevColumn = currentColumns.find((c) => c.key === column)
      if (prevColumn) {
        return prevColumn
      }
      const appPx = widthPerColumn[column]
        ? Math.round(widthPerColumn[column] * 9.5)
        : 0

      return {
        key: column,
        dataKey: column,
        title: column,
        resizable: true,
        sortable: true,
        width: appPx < 70 ? 70 : appPx > 300 ? 300 : appPx,
      }
    })
}
