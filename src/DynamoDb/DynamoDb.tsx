import 'react-base-table/styles.css'
import './dynamoDb.css'
import './clipboardColumns.css'
import hotkeys from 'hotkeys-js'
import React from 'react'
import copy from 'copy-to-clipboard'
import BaseTable, { AutoResizer } from 'react-base-table'
import {
  dynamoDbFetchItems,
  dynamoDbTableDesc,
  editItem,
  deleteItem,
  createItem,
  execute,
  discardChange,
  openChange,
  dynamodbOptions,
} from '../asyncData/dynamoDb'
import { Icon, Button, Tooltip, Menu, Checkbox } from 'antd'
import { RelativeTime } from '../LogsPage/RelativeTime'
import { QueryFormHeader } from './components/QueryFormHeader'
import { QueryFormFilter } from './components/QueryFormFilter'
import { getColumns, Column } from './getColumns'
import { autoDetectDataType } from './autoDetectDataType'
import { getDomOffset } from './getDomOffset'
import { sortFunction } from './sortFunction'
import { stringifyItems } from './stringifyItems'

type QueryType = 'scan' | 'query'

export interface QueryFilter {
  id: number
  comparison: string
  comparisonLocked?: boolean
  fieldName?: string
  dataType?: string
  autoDetectedDataType?: string
  value?: string
  valueSecond?: string
  fieldNamePlaceholder?: string
  keyCondition?: boolean
}

interface Change {
  action: 'create' | 'update' | 'delete'
  id: string
  compositKey: string
  timestamp: number
  newData?: any
  status?: 'inProgress' | 'error'
  updatedData?: any
  command?: any
  error?: string
  index: string
  queryType: string
  json: any
}

interface Index {
  id?: string
  name?: string
  hashRangeKeys?: string[]
}

interface Item {
  id: string
  index: string
  hashKey: string
  sortKey: string
  data: any[]
}

type State = {
  isFooterExpanded: boolean
  isLoading: boolean
  reloadInProgress: boolean

  indexes: Index[]

  selectedQueryType: QueryType
  selectedIndex: number
  selectedQueryFilters: QueryFilter[]

  interrupted: boolean

  fetchedChanges: Change[]
  fetchedQueryFilters: QueryFilter[]
  fetchedIndex: number
  fetchedQueryType: QueryType
  fetchedCount: number
  fetchedScannedCount: number
  fetchedTimestamp: number
  fetchedLastEvaluatedKey: any
  fetchedItems: Item[]
  fetchedItemsWithChanges: Item[]

  itemsStringified: any[]

  columns: Column[]
  hiddenColumns: string[]
  sortBy: {
    key?: string
    order?: string
  }

  selectedRows: string[]
  frozenData: any

  contextMenu: {
    top?: number
    left?: number
    slsConsoleKey: string
    rowData?: any
    rowIndex?: any
    column?: any
    targetElement?: any
  }
  error: string
  changeHoverRows: any[]

  clipboard: {
    top?: number
    left?: number
    rowIndex?: number
    cellIndex?: number
  }

  tableName: string
  attributesSchema: Record<string, string>
  hashKey: string
  sortKey: string
}

const isMac = navigator?.platform?.toUpperCase()?.indexOf('MAC') >= 0

export class DynamoDb extends React.Component<any, State> {
  state = {
    isFooterExpanded: false,
    isLoading: false,
    reloadInProgress: false,

    indexes: [] as Index[],

    selectedQueryType: 'scan' as QueryType,
    selectedIndex: 0,
    selectedQueryFilters: [
      {
        id: Math.random(),
        comparison: '=',
      },
    ] as QueryFilter[],

    interrupted: false,

    fetchedChanges: [] as Change[],
    fetchedQueryFilters: [] as QueryFilter[],
    fetchedIndex: 0,
    fetchedQueryType: null as QueryType,
    fetchedCount: 0,
    fetchedScannedCount: 0,
    fetchedTimestamp: 0,
    fetchedLastEvaluatedKey: null,
    fetchedItems: [] as Item[],
    fetchedItemsWithChanges: [] as Item[],

    itemsStringified: [] as any[],

    columns: [] as Column[],
    hiddenColumns: [] as string[],
    sortBy: {} as {
      key?: string
      order?: string
    },

    selectedRows: [] as string[],
    frozenData: [],

    contextMenu: {
      top: 0,
      left: 0,
      slsConsoleKey: null,
    } as {
      top?: number
      left?: number
      slsConsoleKey: string
      rowData?: any
      rowIndex?: any
      column?: any
      targetElement?: any
    },
    error: '',
    changeHoverRows: [],

    clipboard: {} as {
      top?: number
      left?: number
      rowIndex?: number
      cellIndex?: number
    },

    tableName: '',
    attributesSchema: {} as Record<string, string>,
    hashKey: '',
    sortKey: null as string,
  }
  contextMenuRef: React.RefObject<any>
  _firstInputRef: any

  constructor(props) {
    super(props)
    this.contextMenuRef = React.createRef()
  }

  async componentDidMount() {
    const tableDesc = await dynamoDbTableDesc()

    this.setState({
      tableName: tableDesc.tableName,
      indexes: tableDesc.indexes,
      attributesSchema: tableDesc.attributesSchema,
      hashKey: tableDesc.hashKey,
      sortKey: tableDesc.sortKey,
      selectedIndex: 0,
    })

    await this.fetchItems({
      filters: this.state.selectedQueryFilters,
      index: 0,
      queryType: 'scan',
      lastFetchResult: null,
      lastEvaluatedKey: null,
    })

    window.addEventListener('message', async (event) => {
      if (event?.data?.type === 'changesUpdated') {
        this.fetchItems({
          filters: this.state.fetchedQueryFilters,
          onlyRefreshCurrentItems: true,
          index: this.state.fetchedIndex,
          queryType: this.state.fetchedQueryType,
          lastEvaluatedKey: null,
          lastFetchResult: {
            Count: this.state.fetchedCount,
            Items: this.state.fetchedItems,
            LastEvaluatedKey: this.state.fetchedLastEvaluatedKey,
            ScannedCount: this.state.fetchedScannedCount,
            timeFetched: this.state.fetchedTimestamp,
          },
        })
      }
    })

    const shortcut = isMac ? 'command+f' : 'ctrl+f'
    hotkeys(shortcut, () => {
      this._firstInputRef?.focus()
      return false
    })
  }

  componentDidUpdate(prevProps, prevState: State) {
    // close footer if changes goes to 0
    if (
      this.state.isFooterExpanded &&
      prevState.fetchedChanges.length !== 0 &&
      this.state.fetchedChanges.length === 0
    ) {
      this.setState({
        isFooterExpanded: false,
        changeHoverRows: [],
      })
    }

    // if filter or query type is changed
    // autofill fields from index
    if (
      prevState.selectedIndex !== this.state.selectedIndex ||
      prevState.selectedQueryType !== this.state.selectedQueryType
    ) {
      const currentIndex = this.state.indexes[this.state.selectedIndex]

      const hashType = this.state.attributesSchema[
        currentIndex.hashRangeKeys[0]
      ]
      const rangeType = this.state.attributesSchema[
        currentIndex.hashRangeKeys[1]
      ]

      if (this.state.selectedQueryType === 'query') {
        this.setState({
          selectedQueryFilters: [
            {
              id: Math.random(),
              fieldName: currentIndex.hashRangeKeys[0],
              comparison: '=',
              comparisonLocked: true,
              keyCondition: true,
              dataType: hashType === 'L' || hashType === 'M' ? 'B' : hashType,
            },
            currentIndex.hashRangeKeys[1] && {
              id: Math.random(),
              fieldName: currentIndex.hashRangeKeys[1],
              comparison: '=',
              keyCondition: true,
              dataType:
                rangeType === 'L' || rangeType === 'M' ? 'B' : rangeType,
            },
          ].filter((val) => val !== undefined),
        })
      } else {
        this.setState({
          selectedQueryFilters: [
            {
              id: Math.random(),
              comparison: '=',
            },
          ],
        })
      }
    }

    // if no items, but there is loadmore
    if (
      this.state.interrupted === false &&
      prevState.isLoading === true &&
      this.state.isLoading === false &&
      this.state.fetchedItemsWithChanges.length === 0 &&
      this.state.fetchedLastEvaluatedKey
    ) {
      this.fetchItems({
        filters: this.state.fetchedQueryFilters,
        index: this.state.fetchedIndex,
        queryType: this.state.fetchedQueryType,
        lastEvaluatedKey: this.state.fetchedLastEvaluatedKey,
        lastFetchResult: {
          Count: this.state.fetchedCount,
          Items: this.state.fetchedItems,
          LastEvaluatedKey: this.state.fetchedLastEvaluatedKey,
          ScannedCount: this.state.fetchedScannedCount,
          timeFetched: this.state.fetchedTimestamp,
        },
      })
    }
  }

  async cleanResults() {
    return new Promise((resolve) =>
      this.setState(
        {
          isLoading: false,

          fetchedQueryType: null,
          fetchedIndex: 0,
          fetchedQueryFilters: [],
          fetchedLastEvaluatedKey: null,
          fetchedItems: [],
          fetchedTimestamp: 0,
          fetchedCount: 0,
          fetchedScannedCount: 0,
          fetchedItemsWithChanges: [],

          error: '',
          contextMenu: {
            top: 0,
            left: 0,
            slsConsoleKey: null,
          },
          frozenData: [],
          interrupted: false,
          itemsStringified: [],
          columns: [],
          hiddenColumns: [],
          sortBy: {},
        },
        resolve
      )
    )
  }

  async fetchItems({
    onlyRefreshCurrentItems,
    filters,
    index,
    queryType,
    lastFetchResult,
    lastEvaluatedKey,
  }: {
    queryType: QueryType
    index: number
    filters: QueryFilter[]
    lastEvaluatedKey: any
    onlyRefreshCurrentItems?: boolean
    lastFetchResult: {
      Count: number
      LastEvaluatedKey: any
      ScannedCount: number
      Items: Item[]
      timeFetched: number
    }
  }) {
    try {
      if (onlyRefreshCurrentItems && !lastFetchResult) {
        return null
      }

      this.setState({
        isLoading: onlyRefreshCurrentItems ? false : true,
      })

      const currentIndex = this.state.indexes[index]

      const res = await dynamoDbFetchItems({
        lastEvaluatedKey,
        queryType,
        filters,
        index: currentIndex.id,
        lastFetchResult,
        onlyRefreshCurrentItems: onlyRefreshCurrentItems,
      })

      const columns = getColumns({
        currentColumns: this.state.columns,
        countPerColumn: res.countPerColumn,
        widthPerColumn: res.widthPerColumn,
        hashKey: this.state.hashKey,
        sortKey: this.state.sortKey,
        indexHashRangeKeys: currentIndex.hashRangeKeys,
      })

      const sortBy = index === this.state.fetchedIndex ? this.state.sortBy : {}

      const itemsStringified = stringifyItems(res.changedItems).sort(
        sortFunction(sortBy)
      )

      this.setState({
        fetchedQueryFilters: [...filters],
        fetchedIndex: index,
        fetchedQueryType: queryType,
        fetchedCount: res.count,
        fetchedScannedCount: res.scannedCount,
        fetchedLastEvaluatedKey: res.lastEvaluatedKey,
        fetchedItems: res.items,
        fetchedItemsWithChanges: res.changedItems,
        fetchedTimestamp: res.timeFetched,
        fetchedChanges: res.changes,

        isLoading: false,
        itemsStringified,
        sortBy,
        columns,
      })
    } catch (err) {
      await this.cleanResults()
      this.setState({
        error: err,
      })
    }
  }

  onColumnSort = (sortBy) => {
    this.setState({
      itemsStringified: this.state.itemsStringified.sort(sortFunction(sortBy)),
      sortBy,
    })
  }

  getRowClassName = ({ rowIndex, rowData }) => {
    let classes = ''
    const slsKey = rowData._slsConsoleKey

    if (slsKey === 'loadMore') {
      return ''
    }
    const changes = this.state.fetchedChanges
      .filter(
        (c) =>
          c.compositKey === slsKey &&
          c.index === this.state.indexes[this.state.fetchedIndex].id &&
          c.queryType === this.state.fetchedQueryType
      )
      .sort((a, b) => {
        // making delete a priority change
        if (a.action === 'delete') {
          return -1
        }
        if (b.action === 'delete') {
          return 1
        }
        return 0
      })

    const change = changes.length ? changes[0] : null

    if (this.state.clipboard?.rowIndex === rowIndex) {
      classes += ' clipboard-' + this.state.clipboard?.cellIndex
    }

    if (this.state.selectedRows.includes(slsKey)) {
      classes += ' selected-hover'
    }
    if (this.state.changeHoverRows.includes(slsKey)) {
      classes += ' change-hover'
    }
    if (change && change.action === 'update') {
      classes += ' updated-item'
    }
    if (change && change.action === 'delete') {
      classes += ' deleted-item'
    }
    return classes
  }

  onSearch = async () => {
    // todo disable search if searching, add stop button
    const selectedQueryFilters = this.state.selectedQueryFilters.filter(
      (filter) => !(!filter.fieldName && filter.value === undefined)
    )

    await new Promise((resolve) =>
      this.setState(
        {
          selectedQueryFilters:
            selectedQueryFilters.length === 0
              ? [
                  {
                    id: Math.random(),
                    comparison: '=',
                  },
                ]
              : selectedQueryFilters,
        },
        resolve
      )
    )

    await this.cleanResults()
    await this.fetchItems({
      filters: this.state.selectedQueryFilters,
      index: this.state.selectedIndex,
      queryType: this.state.selectedQueryType,
      lastFetchResult: null,
      lastEvaluatedKey: null,
    })
  }

  copyToClipboard({ rowData, rowIndex, column, targetElement }) {
    const originalItemProp = this.state.itemsStringified.find(
      (item) => item._slsConsoleKey === rowData._slsConsoleKey
    )[column]

    if (rowData[column] === undefined || originalItemProp === undefined) {
      return false
    }

    const cellIndex = this.state.columns.findIndex((c) => c.key === column) + 1

    let targetNode =
      targetElement.getAttribute('role') === 'gridcell'
        ? targetElement
        : targetElement.parentElement

    const coordinates = getDomOffset(targetNode.children[0])
    const rightLimit = window.innerWidth - 150

    copy(originalItemProp)

    this.setState({
      clipboard: {
        rowIndex,
        cellIndex,
        top: coordinates.top - 22,
        left:
          coordinates.left < 0
            ? 0
            : coordinates.left > rightLimit
            ? rightLimit
            : coordinates.left,
      },
    })

    setTimeout(() => {
      this.setState({
        clipboard: {},
      })
    }, 500)
  }

  render() {
    const selectedS = this.state.selectedRows.length > 1 ? 's' : ''

    return (
      <div className="dynamodb-page">
        <div className="main-wrapper">
          {this.state.clipboard?.top && (
            <div
              className="clipboard-info"
              style={{
                top: this.state.clipboard.top,
                left: this.state.clipboard.left,
              }}
            >
              <Icon type="copy" /> copied to clipboard
            </div>
          )}
          {this.state.contextMenu?.slsConsoleKey !== null && (
            <div
              ref={this.contextMenuRef}
              className="context-menu"
              tabIndex={1}
              onBlur={() => {
                this.setState({
                  contextMenu: {
                    slsConsoleKey: null,
                  },
                  selectedRows: [],
                })
              }}
              style={{
                top: this.state.contextMenu.top,
                left: this.state.contextMenu.left,
              }}
            >
              <Menu
                style={{
                  width: 135,
                }}
                mode="inline"
              >
                <Menu.Item
                  key="edit"
                  onClick={() => {
                    const slsConsoleKey = this.state.contextMenu.slsConsoleKey
                    const item = this.state.fetchedItemsWithChanges.find(
                      (item) => item.id === slsConsoleKey
                    )
                    const originalItem = this.state.fetchedItems.find(
                      (item) => item.id === slsConsoleKey
                    )

                    editItem({
                      queryType: this.state.fetchedQueryType,
                      index: this.state.indexes[this.state.fetchedIndex].id,
                      content: item.data,
                      originalContent: originalItem.data,
                      columns: this.state.columns.map((c) => c.key),
                      hashKey: item.hashKey,
                      sortKey: item.sortKey,
                    })
                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="edit" /> Edit{' '}
                  <span className="shortcut">double click</span>
                </Menu.Item>

                <Menu.Item
                  key="duplicate"
                  onClick={() => {
                    const slsConsoleKey = this.state.contextMenu.slsConsoleKey
                    const item = this.state.fetchedItemsWithChanges.find(
                      (item) => item.id === slsConsoleKey
                    )
                    createItem(item.data)
                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="file-add" /> Duplicate Row
                </Menu.Item>

                <Menu.Item
                  key="delete"
                  onClick={() => {
                    for (const slsConsoleKey of this.state.selectedRows) {
                      //const slsConsoleKey = this.state.contextMenu.slsConsoleKey
                      const item = this.state.fetchedItemsWithChanges.find(
                        (item) => item.id === slsConsoleKey
                      )

                      const originalItem = this.state.fetchedItems.find(
                        (item) => item.id === slsConsoleKey
                      )

                      deleteItem({
                        queryType: this.state.fetchedQueryType,
                        originalContent: originalItem.data,
                        index: item.index,
                        hashKey: item.hashKey,
                        sortKey: item.sortKey,
                        tableName: this.state.tableName,
                      })
                    }
                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="delete" /> Delete Item{selectedS}
                </Menu.Item>

                <hr style={{ opacity: 0.3 }} />

                {this.state.contextMenu?.rowData[
                  this.state.contextMenu?.column?.key
                ] && (
                  <Menu.Item
                    key="Copy"
                    onClick={() => {
                      this.copyToClipboard({
                        rowData: this.state.contextMenu.rowData,
                        rowIndex: this.state.contextMenu.rowIndex,
                        targetElement: this.state.contextMenu.targetElement,
                        column: this.state.contextMenu.column?.key,
                      })
                      this.contextMenuRef.current?.blur()
                    }}
                  >
                    <Icon type="copy" /> Copy Column{' '}
                    <span className="shortcut">
                      {isMac ? 'Cmd' : 'Ctrl'} + Click
                    </span>
                  </Menu.Item>
                )}

                <Menu.Item
                  key="Copy-row"
                  onClick={() => {
                    const item = this.state.fetchedItemsWithChanges.find(
                      (item) => item.id === this.state.contextMenu.slsConsoleKey
                    )
                    copy(JSON.stringify(item.data, null, 2))
                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="copy" /> Copy Row
                </Menu.Item>

                <hr style={{ opacity: 0.3 }} />
                <Menu.Item
                  key="pin"
                  onClick={() => {
                    const slsConsoleKey = this.state.contextMenu.slsConsoleKey
                    if (
                      this.state.frozenData.find(
                        (item) => item._slsConsoleKey === slsConsoleKey
                      )
                    ) {
                      this.setState({
                        frozenData: this.state.frozenData.filter(
                          (item) => item._slsConsoleKey !== slsConsoleKey
                        ),
                      })
                    } else {
                      this.setState({
                        frozenData: [
                          ...this.state.frozenData,
                          ...this.state.itemsStringified.filter(
                            (item) =>
                              // is not already pinned
                              !this.state.frozenData
                                .map((i) => i._slsConsoleKey)
                                .includes(item._slsConsoleKey) &&
                              // is selected
                              this.state.selectedRows.includes(
                                item._slsConsoleKey
                              )
                          ),
                        ],
                      })
                    }

                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="pushpin" />{' '}
                  {this.state.frozenData
                    .map((i) => i._slsConsoleKey)
                    .includes(this.state.contextMenu.slsConsoleKey)
                    ? 'Unpin Row'
                    : `Pin Row${selectedS}`}
                </Menu.Item>

                {this.state.fetchedChanges.find(
                  (c) =>
                    c.compositKey === this.state.contextMenu.slsConsoleKey &&
                    c.index ===
                      this.state.indexes[this.state.fetchedIndex].id &&
                    c.queryType === this.state.fetchedQueryType
                ) && [
                  <hr style={{ opacity: 0.3 }} />,
                  this.state.selectedRows.length === 1 && (
                    <Menu.Item
                      key="open-change"
                      onClick={async () => {
                        const change = this.state.fetchedChanges.find(
                          (c) =>
                            c.compositKey === this.state.selectedRows[0] &&
                            c.index ===
                              this.state.indexes[this.state.fetchedIndex].id &&
                            c.queryType === this.state.fetchedQueryType
                        )

                        if (change) {
                          openChange(change.id)
                        }
                      }}
                    >
                      <Icon type="select" /> Open Change
                    </Menu.Item>
                  ),
                  <Menu.Item
                    key="discard-change"
                    onClick={async () => {
                      for (const slsConsoleKey of this.state.selectedRows) {
                        const changes = this.state.fetchedChanges.filter(
                          (c) =>
                            c.compositKey === slsConsoleKey &&
                            c.index ===
                              this.state.indexes[this.state.fetchedIndex].id &&
                            c.queryType === this.state.fetchedQueryType
                        )

                        this.contextMenuRef.current?.blur()

                        for (const change of changes) {
                          await discardChange(change.id)
                        }
                      }
                    }}
                  >
                    <Icon type="close" /> Discard Change{selectedS}
                  </Menu.Item>,
                ]}
              </Menu>
            </div>
          )}
          <QueryFormHeader
            queryType={this.state.selectedQueryType}
            indexes={this.state.indexes}
            selectedIndex={this.state.selectedIndex}
            onQueryTypeChange={(queryType) => {
              this.setState({
                selectedQueryType: queryType,
              })
            }}
            onIndexChange={(selectedIndex) => {
              this.setState({
                selectedIndex,
              })
            }}
          />
          <QueryFormFilter
            attributesSchema={this.state.attributesSchema}
            queryFilters={this.state.selectedQueryFilters}
            columns={this.state.columns}
            onFilterAdd={() => {
              this.setState({
                selectedQueryFilters: [
                  ...this.state.selectedQueryFilters,
                  {
                    id: Math.random(),
                    comparison: '=',
                  },
                ],
              })
            }}
            onFilterRemove={(filterId) => {
              const newFilters = this.state.selectedQueryFilters.filter(
                (f) => f.id !== filterId
              )
              this.setState({
                selectedQueryFilters: newFilters.length
                  ? newFilters
                  : [
                      {
                        id: Math.random(),
                        comparison: '=',
                      },
                    ],
              })
            }}
            onRef={(input) => {
              this._firstInputRef = input
            }}
            searchButtonLabel={
              this.state.isLoading
                ? 'Fetching...'
                : this.state.selectedQueryType ===
                    this.state.fetchedQueryType &&
                  this.state.selectedIndex === this.state.fetchedIndex &&
                  areArrayFieldsEqual(
                    this.state.selectedQueryFilters,
                    this.state.fetchedQueryFilters,
                    ['fieldName', 'comparison', 'value', 'valueSecond']
                  )
                ? 'Refresh'
                : 'Search'
            }
            onEnter={this.onSearch}
            onChange={(changedFilter: QueryFilter) => {
              this.setState({
                selectedQueryFilters: this.state.selectedQueryFilters.map(
                  (filter) => {
                    if (filter.id === changedFilter.id) {
                      if (!changedFilter.dataType) {
                        return {
                          ...changedFilter,
                          autoDetectedDataType: autoDetectDataType({
                            value: changedFilter.value,
                            fieldName: changedFilter.fieldName,
                            attributesSchema: this.state.attributesSchema,
                          }),
                        }
                      } else {
                        return changedFilter
                      }
                    } else {
                      return filter
                    }
                  }
                ),
              })
            }}
          />

          <div className="table-wrapper">
            {this.state.error ? (
              <div>{this.state.error}</div>
            ) : (
              <AutoResizer>
                {({ width, height }) => (
                  <BaseTable
                    fixed
                    frozenData={this.state.frozenData}
                    data={this.state.itemsStringified}
                    columns={[
                      {
                        width: 22,
                        flexShrink: 0,
                        resizable: false,
                        frozen: 'left',
                        key: '__selection__',
                        headerRenderer: () => {
                          return this.state.fetchedItems.length === 0 ? null : (
                            <Checkbox
                              className="header-checkbox"
                              onChange={(e) => {
                                this.setState({
                                  selectedRows: e.target.checked
                                    ? this.state.itemsStringified.map(
                                        (i) => i._slsConsoleKey
                                      )
                                    : [],
                                })
                              }}
                            />
                          )
                        },
                        cellRenderer: ({ rowData, rowIndex }) => {
                          if (rowIndex < 0) {
                            return (
                              <Tooltip title="Unpin row" placement="right">
                                <Icon
                                  style={{ paddingLeft: 2 }}
                                  type="pushpin"
                                  onClick={() => {
                                    this.setState({
                                      frozenData: this.state.frozenData.filter(
                                        (item) =>
                                          item._slsConsoleKey !==
                                          rowData._slsConsoleKey
                                      ),
                                    })
                                  }}
                                />
                              </Tooltip>
                            )
                          }
                          const isChecked = this.state.selectedRows.includes(
                            rowData._slsConsoleKey
                          )
                          return (
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) => {
                                this.setState({
                                  selectedRows: !e.target.checked
                                    ? this.state.selectedRows.filter(
                                        (id) => id !== rowData._slsConsoleKey
                                      )
                                    : [
                                        ...this.state.selectedRows,
                                        rowData._slsConsoleKey,
                                      ],
                                })
                              }}
                            />
                          )
                        },
                      },
                      ...this.state.columns.filter(
                        (c) => !this.state.hiddenColumns?.includes(c.key)
                      ),
                    ]}
                    rowKey="_slsConsoleKey"
                    width={width}
                    height={height}
                    headerHeight={35}
                    rowHeight={35}
                    footerHeight={this.state.isFooterExpanded ? 240 : 40}
                    sortBy={this.state.sortBy}
                    onColumnSort={this.onColumnSort}
                    rowClassName={this.getRowClassName}
                    cellProps={({ column, rowData, rowIndex }) => ({
                      onDoubleClick: (e) => {
                        if (column.key === '__selection__') {
                          return null
                        }
                        const item = this.state.fetchedItemsWithChanges.find(
                          (item) => item.id === rowData._slsConsoleKey
                        )
                        const originalItem = this.state.fetchedItems.find(
                          (item) => item.id === rowData._slsConsoleKey
                        )

                        editItem({
                          queryType: this.state.fetchedQueryType,
                          index: this.state.indexes[this.state.fetchedIndex].id,
                          content: item.data,
                          originalContent: originalItem.data,
                          selectColumn: column.dataKey,
                          columns: this.state.columns.map((c) => c.key),
                          hashKey: item.hashKey,
                          sortKey: item.sortKey,
                        })
                      },
                      onClick: (e) => {
                        if (!e.metaKey) {
                          return false
                        }
                        this.copyToClipboard({
                          rowData,
                          rowIndex,
                          targetElement: e.target,
                          column: column.key,
                        })
                      },
                      onContextMenu: (event) => {
                        event.preventDefault()
                        if (rowData._slsConsoleKey === 'loadMore') {
                          return
                        }
                        const maxWidth = window.innerWidth - 140
                        const maxHeight = window.innerHeight - 180

                        this.setState(
                          {
                            contextMenu: {
                              slsConsoleKey: rowData._slsConsoleKey,
                              top:
                                event.pageY > maxHeight
                                  ? maxHeight
                                  : event.pageY,
                              left:
                                event.pageX > maxWidth ? maxWidth : event.pageX,
                              rowData,
                              rowIndex,
                              column,
                              targetElement: event.target,
                            },
                            selectedRows: [
                              ...this.state.selectedRows,
                              rowData._slsConsoleKey,
                            ],
                          },
                          () => {
                            this.contextMenuRef.current?.focus()
                          }
                        )
                      },
                    })}
                    emptyRenderer={() => {
                      return (
                        <div className="load-more">
                          <span className="fetched-message">
                            Fetched {this.state.fetchedCount} items (
                            {this.state.fetchedScannedCount} scanned)
                          </span>
                          {this.state.isLoading && (
                            <span className="loadmore">loading...</span>
                          )}
                          {this.state.interrupted === false &&
                            this.state.fetchedLastEvaluatedKey && (
                              <span
                                className="spanlink"
                                onClick={() => {
                                  this.setState({
                                    interrupted: true,
                                  })
                                }}
                              >
                                Stop
                              </span>
                            )}
                        </div>
                      )
                    }}
                    rowRenderer={({ rowData, cells, columns }) => {
                      if (rowData._slsConsoleKey === 'loadMore') {
                        if (
                          columns.length === 1 &&
                          columns[0].key === '__selection__'
                        ) {
                          // helper table for selections with only one cell
                          return null
                        }
                        return (
                          <div className="load-more">
                            <span className="fetched-message">
                              Fetched {this.state.fetchedCount} items (
                              {this.state.fetchedScannedCount} scanned)
                            </span>

                            {this.state.isLoading ? (
                              <span className="loadmore">loading...</span>
                            ) : (
                              this.state.fetchedLastEvaluatedKey && (
                                <>
                                  {this.state.sortBy.key && (
                                    <span
                                      className="spanlink"
                                      onClick={() => {
                                        this.setState({
                                          itemsStringified: stringifyItems(
                                            this.state.fetchedItemsWithChanges
                                          ),
                                          sortBy: {},
                                        })
                                      }}
                                    >
                                      Remove Sort
                                      <Tooltip
                                        title="If sorting is not removed, new items are merged with old ones, rather than appended at the end."
                                        placement="top"
                                      >
                                        <Icon type="info-circle" />
                                      </Tooltip>
                                    </span>
                                  )}
                                  <span
                                    className="spanlink"
                                    onClick={() => {
                                      this.fetchItems({
                                        filters: this.state.fetchedQueryFilters,
                                        index: this.state.fetchedIndex,
                                        queryType: this.state.fetchedQueryType,
                                        lastEvaluatedKey: this.state
                                          .fetchedLastEvaluatedKey,
                                        lastFetchResult: {
                                          Count: this.state.fetchedCount,
                                          Items: this.state.fetchedItems,
                                          LastEvaluatedKey: this.state
                                            .fetchedLastEvaluatedKey,
                                          ScannedCount: this.state
                                            .fetchedScannedCount,
                                          timeFetched: this.state
                                            .fetchedTimestamp,
                                        },
                                      })
                                    }}
                                  >
                                    Load more
                                  </span>
                                </>
                              )
                            )}
                          </div>
                        )
                      }
                      return cells
                    }}
                    footerRenderer={
                      <div className="footer">
                        {this.state.isFooterExpanded && (
                          <div className="log-table-wrapper">
                            <div className="table-wrapper">
                              <table className="log-table">
                                <tbody>
                                  {this.state.fetchedChanges.map(
                                    (change, index) => (
                                      <tr
                                        key={`${change.id}-${index}`}
                                        className={
                                          change.status === 'error'
                                            ? 'change-row error'
                                            : 'change-row'
                                        }
                                        onMouseEnter={() => {
                                          this.setState({
                                            changeHoverRows: [
                                              change.compositKey,
                                            ],
                                          })
                                        }}
                                        onMouseLeave={() => {
                                          this.setState({
                                            changeHoverRows: [],
                                          })
                                        }}
                                        onClick={() => {
                                          openChange(change.id)
                                        }}
                                      >
                                        <td className="operation">
                                          <span className={change.action}>
                                            {change.status === 'inProgress' ? (
                                              <Icon type="loading" />
                                            ) : (
                                              <Icon
                                                type={
                                                  change.action === 'update'
                                                    ? 'edit'
                                                    : change.action === 'create'
                                                    ? 'plus-circle'
                                                    : 'close-circle'
                                                }
                                                className="change-icon"
                                              />
                                            )}
                                            {change.status === 'error'
                                              ? 'ERROR'
                                              : change.action?.toUpperCase()}
                                          </span>
                                        </td>
                                        <td className="timestamp">
                                          <RelativeTime
                                            time={change.timestamp}
                                          />
                                        </td>
                                        <td className="primary-key">
                                          {change.compositKey}
                                        </td>
                                        <td className="icons">
                                          <Tooltip
                                            title="Discard change"
                                            placement="left"
                                          >
                                            <Icon
                                              type="close"
                                              onClick={(e) => {
                                                discardChange(change.id)
                                                e.stopPropagation() // parent tr onClick handler is not triggered
                                              }}
                                            />
                                          </Tooltip>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        <div className="footer-wrapper">
                          <div className="footer-left">
                            <Icon
                              type="plus-circle"
                              onClick={() => {
                                createItem()
                              }}
                            />
                            <Icon
                              type={
                                this.state.reloadInProgress ? 'loading' : 'sync'
                              }
                              onClick={async () => {
                                this.setState({
                                  fetchedCount: 0,
                                  fetchedLastEvaluatedKey: null,
                                  fetchedScannedCount: 0,
                                  fetchedItems: [],
                                  fetchedTimestamp: 0,
                                  reloadInProgress: true,
                                })
                                await this.fetchItems({
                                  filters: this.state.fetchedQueryFilters,
                                  index: this.state.fetchedIndex,
                                  queryType: this.state.fetchedQueryType,
                                  lastFetchResult: null,
                                  lastEvaluatedKey: null,
                                })
                                this.setState({
                                  reloadInProgress: false,
                                })
                              }}
                            />
                            <Icon
                              onClick={async () => {
                                const res = await dynamodbOptions(
                                  this.state.columns.map((column) => {
                                    return {
                                      label: column.key,
                                      picked: !this.state.hiddenColumns.includes(
                                        column.key
                                      ),
                                    }
                                  })
                                )

                                this.setState({
                                  hiddenColumns: res.hiddenColumns,
                                })
                              }}
                              type="setting"
                            />
                          </div>

                          <div className="footer-right">
                            {this.state.fetchedChanges.length ? (
                              <span
                                className="queue-message"
                                onClick={() => {
                                  this.setState({
                                    isFooterExpanded: !this.state
                                      .isFooterExpanded,
                                  })
                                }}
                              >
                                <span className="changes-num">
                                  {this.state.fetchedChanges.length}
                                </span>
                                staged changes
                                <Icon
                                  type={
                                    this.state.isFooterExpanded ? 'down' : 'up'
                                  }
                                />
                              </span>
                            ) : null}

                            {this.state.fetchedChanges.length ? (
                              <Button
                                disabled={
                                  this.state.fetchedChanges.findIndex(
                                    (f) => f.status === 'inProgress'
                                  ) !== -1
                                }
                                type="primary"
                                size="small"
                                onClick={(e) => {
                                  e.currentTarget.blur()
                                  this.setState({
                                    isFooterExpanded: true,
                                  })
                                  execute()
                                }}
                              >
                                Execute
                              </Button>
                            ) : (
                              <Button
                                type="primary"
                                size="small"
                                style={{
                                  opacity: 0.2,
                                  cursor: 'default',
                                  pointerEvents: 'none',
                                }}
                              >
                                Execute
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                  />
                )}
              </AutoResizer>
            )}
          </div>
        </div>
      </div>
    )
  }
}

function areArrayFieldsEqual(arr1: any, arr2: any, fields: string[]) {
  return (
    arr1
      ?.map((arrVal) =>
        fields.reduce((acc, field) => {
          return `${acc}-${arrVal[field] || ''}`
        }, '')
      )
      .toString() ===
    arr2
      ?.map((arrVal) =>
        fields.reduce((acc, field) => {
          return `${acc}-${arrVal[field] || ''}`
        }, '')
      )
      .toString()
  )
}
