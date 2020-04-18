export function stringifyItems(
  unstringified: {
    id: string
    data: any
  }[]
) {
  if (unstringified.length === 0) {
    return []
  }

  return [
    ...unstringified.map((item) => {
      const stringified = Object.keys(item.data).reduce((acc, curr) => {
        return {
          ...acc,
          [curr]:
            typeof item.data[curr] === 'object'
              ? JSON.stringify(item.data[curr], null, 2)
              : item.data[curr],
        }
      }, {})

      return {
        ...stringified,
        _slsConsoleKey: item.id,
      }
    }),
    {
      _slsConsoleKey: 'loadMore',
    },
  ]
}
