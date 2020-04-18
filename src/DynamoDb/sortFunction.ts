type SortBy = {
  key?: string
  order?: string
}

export const sortFunction = (sortBy: SortBy) => (a, b) => {
  const key = sortBy?.key
  if (!key) {
    return 0
  }
  if (typeof a[key] === 'string' && typeof b[key] === 'string') {
    if (sortBy.order === 'asc') {
      return a[key].localeCompare(b[key])
    } else {
      return b[key].localeCompare(a[key])
    }
  } else {
    if (sortBy.order === 'asc') {
      return a[key] - b[key]
    } else {
      return b[key] - a[key]
    }
  }
}

