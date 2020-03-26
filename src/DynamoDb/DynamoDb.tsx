import 'react-base-table/styles.css'
import './dynamoDb.css'
import './clipboardColumns.css'
import React from 'react'
import copy from 'copy-to-clipboard'
import BaseTable, { AutoResizer } from 'react-base-table'
import {
  dynamoDbFetchItems,
  dynamoDbTableDesc,
  editItem,
  deleteItem,
  createItem,
  execute
} from '../asyncData/dynamoDb'
import { postComponentMounted } from '../asyncData/asyncData'
import { Icon, Button, Tooltip, Menu } from 'antd'
import { RelativeTime } from '../LogsPage/RelativeTime'
import { QueryFormHeader } from './components/QueryFormHeader'
import { QueryFormFilter } from './components/QueryFormFilter'

export type QueryFilter = {
  id: number
  comparison: string
  fieldName?: string
  dataType?: string
  autoDetectedDataType?: string
  value?: string
  valueSecond?: string
  fieldNamePlaceholder?: string
  keyCondition?: boolean
}

export class DynamoDb extends React.Component {
  state = {
    queryFilterVisible: true,
    queryFilters: [
      {
        id: Math.random(),
        comparison: '='
      }
    ] as QueryFilter[],
    commands: [] as {
      action: 'create' | 'update' | 'delete'
      id: string
      compositKey: string
      timestamp: number
      newData?: any
      icon?: string
    }[],
    isLoading: false,
    queryType: 'scan' as 'scan' | 'query',
    count: 0,
    scannedCount: 0,
    lastEvaluatedKey: null,
    columns: [],
    originalItems: [],
    items: [],
    contextMenu: {
      top: 0,
      left: 0,
      slsConsoleKey: null
    },
    error: '',
    isFooterExpanded: false,
    commandHoverRows: [],
    lastSelected: null,
    sortBy: {},

    frozenData: [],

    clipboard: {} as {
      top: number
      left: number
      data: string
      rowIndex: number
      cellIndex: number
    },

    tableName: '',
    hashKey: '',
    sortKey: '',
    indexes: [] as {
      id: string
      name: string
      hashRangeKeys: string[]
    }[],
    attributesSchema: {} as Record<string, string>,

    selectedIndex: -1
  }
  contextMenuRef: React.RefObject<any>

  constructor(props) {
    super(props)
    this.contextMenuRef = React.createRef()
  }

  async componentDidMount() {
    const tableDesc = await dynamoDbTableDesc()

    this.setState({
      tableName: tableDesc.tableName,
      hashKey: tableDesc.hashKey,
      sortKey: tableDesc.sortKey,
      indexes: tableDesc.indexes,
      attributesSchema: tableDesc.attributesSchema,
      selectedIndex: 0
    })

    await this.fetchItems()

    window.addEventListener('message', event => {
      if (event?.data?.type === 'defineDynamoDbCommands') {
        this.setState({
          commands: event.data.payload.map(command => {
            return {
              ...command,
              icon:
                command.action === 'create'
                  ? 'plus-circle'
                  : command.action === 'update'
                  ? 'edit'
                  : command.action === 'delete'
                  ? 'close-circle'
                  : ''
            }
          })
        })
      }
    })

    postComponentMounted()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !this.state.isFooterExpanded &&
      this.state.commands.length !== 0 &&
      prevState.commands.length !== this.state.commands.length
    ) {
      this.setState({
        isFooterExpanded: true
      })
    }
    if (
      this.state.isFooterExpanded &&
      prevState.commands.length !== 0 &&
      this.state.commands.length === 0
    ) {
      this.setState({
        isFooterExpanded: false,
        commandHoverRows: []
      })
    }

    if (
      prevState.selectedIndex !== this.state.selectedIndex ||
      prevState.queryType !== this.state.queryType
    ) {
      const currentIndex = this.state.indexes[this.state.selectedIndex]

      const hashType = this.state.attributesSchema[
        currentIndex.hashRangeKeys[0]
      ]
      const rangeType = this.state.attributesSchema[
        currentIndex.hashRangeKeys[1]
      ]

      if (this.state.queryType === 'query') {
        this.setState({
          queryFilters: [
            {
              id: Math.random(),
              fieldName: currentIndex.hashRangeKeys[0],
              comparison: '=',
              keyCondition: true,
              dataType: hashType === 'L' || hashType === 'M' ? 'B' : hashType
            },
            {
              id: Math.random(),
              fieldName: currentIndex.hashRangeKeys[1],
              comparison: '=',
              keyCondition: true,
              dataType: rangeType === 'L' || rangeType === 'M' ? 'B' : rangeType
            }
          ]
        })
      } else {
        this.setState({
          queryFilters: [
            {
              id: Math.random(),
              comparison: '='
            }
          ]
        })
      }
    }
  }

  async cleanResults() {
    return new Promise(resolve =>
      this.setState(
        {
          isLoading: false,
          error: '',
          count: 0,
          scannedCount: 0,
          lastEvaluatedKey: null,
          columns: [],
          originalItems: [],
          items: [],
          contextMenu: {
            top: 0,
            left: 0,
            slsConsoleKey: null
          },
          frozenData: []
        },
        resolve
      )
    )
  }

  async fetchItems() {
    this.setState({
      isLoading: true
    })

    try {
      const res = await dynamoDbFetchItems({
        lastEvaluatedKey: this.state.lastEvaluatedKey,
        queryType: this.state.queryType,
        filters: this.state.queryFilters,
        index: this.state.indexes[this.state.selectedIndex].id
      })

      const index = this.state.indexes[this.state.selectedIndex]

      let columnNames =
        this.state.columns.length === 0
          ? index.hashRangeKeys
          : this.state.columns.map(c => c.key)

      Object.keys(res.countPerColumn)
        .sort((a, b) => {
          return res.countPerColumn[b] - res.countPerColumn[a]
        })
        .forEach(column => {
          if (!columnNames.includes(column)) {
            // push new column if not found in previous query
            // can not just use res.columns because the order of columns
            // is not preserved in that case
            columnNames.push(column)
          }
        })

      const currentItems = this.state.items.filter(
        item => item._slsConsoleKey !== 'loadMore'
      )

      const newItems = [...currentItems, ...res.items].map((item, index) => {
        const stringified = Object.keys(item).reduce((acc, curr) => {
          return {
            ...acc,
            [curr]:
              typeof item[curr] === 'object'
                ? JSON.stringify(item[curr], null, 2)
                : item[curr]
          }
        }, {})

        return {
          ...stringified,
          _slsConsoleKey: index
        }
      })

      this.setState({
        isLoading: false,
        count: this.state.count + res.count,
        scannedCount: this.state.scannedCount + res.scannedCount,
        originalItems: [...this.state.originalItems, ...res.items],
        items: [
          ...newItems,
          {
            _slsConsoleKey: 'loadMore'
          }
        ],
        columns: [
          ...columnNames.map(column => {
            const prevColumn = this.state.columns.find(c => c.key === column)
            if (prevColumn) {
              return prevColumn
            }
            const appPx = res.columns[column]
              ? Math.round(res.columns[column] * 8.5)
              : 0

            return {
              key: column,
              dataKey: column,
              title: column,
              resizable: true,
              sortable: true,
              width: appPx < 70 ? 70 : appPx > 400 ? 400 : appPx
            }
          })
        ],
        lastEvaluatedKey: res.lastEvaluatedKey
      })
    } catch (err) {
      console.log(err)
      await this.cleanResults()
      this.setState({
        error: err
      })
    }
  }

  onColumnSort = sortBy => {
    console.log(sortBy)

    /*this.setState({
      data: this.state.data.reverse(),
      sortBy
    })*/
  }

  getCompositKey = rowData => {
    return !this.state.sortKey
      ? rowData[this.state.hashKey]
      : `${rowData[this.state.hashKey]}-${rowData[this.state.sortKey]}`
  }

  render() {
    return (
      <div className="dynamodb-page">
        <div className="main-wrapper">
          {this.state.clipboard?.top && (
            <div
              className="clipboard-info"
              style={{
                top: this.state.clipboard.top,
                left: this.state.clipboard.left
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
                    slsConsoleKey: null
                  }
                })
              }}
              style={{
                top: this.state.contextMenu.top,
                left: this.state.contextMenu.left
              }}
            >
              <Menu
                style={{
                  width: 135
                }}
                mode="inline"
              >
                <Menu.Item
                  key="edit"
                  onClick={() => {
                    const slsConsoleKey = this.state.contextMenu.slsConsoleKey

                    editItem({
                      queryType: this.state.queryType,
                      index: this.state.indexes[this.state.selectedIndex].id,
                      content: this.state.originalItems[slsConsoleKey],
                      columns: this.state.columns.map(c => c.key)
                    })
                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="edit" /> Edit{' '}
                  <span className="shortcut">or double click</span>
                </Menu.Item>
                <Menu.Item key="Copy">
                  <Icon type="copy" /> Copy Column{' '}
                  <span className="shortcut">or cmd + Click</span>
                </Menu.Item>
                <Menu.Item key="Copy-row">
                  <Icon type="copy" /> Copy Row
                </Menu.Item>
                <Menu.Item
                  key="sticky"
                  onClick={() => {
                    const slsConsoleKey = this.state.contextMenu.slsConsoleKey
                    if (
                      this.state.frozenData[0]?._slsConsoleKey === slsConsoleKey
                    ) {
                      this.setState({
                        frozenData: []
                      })
                    } else {
                      this.setState({
                        frozenData: [this.state.originalItems[slsConsoleKey]]
                      })
                    }

                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="pushpin" />{' '}
                  {this.state.contextMenu.slsConsoleKey ===
                  this.state.frozenData[0]?._slsConsoleKey
                    ? 'Remove Sticky Row'
                    : 'Make Row Sticky'}
                </Menu.Item>
                <Menu.Item key="duplicate">
                  <Icon type="copy" /> Duplicate Row
                </Menu.Item>

                <Menu.Item
                  key="delete"
                  onClick={() => {
                    const slsConsoleKey = this.state.contextMenu.slsConsoleKey

                    deleteItem({
                      hashKey: this.state.originalItems[slsConsoleKey][
                        this.state.hashKey
                      ],
                      sortKey:
                        this.state.sortKey !== undefined
                          ? this.state.originalItems[slsConsoleKey][
                              this.state.sortKey
                            ]
                          : null,
                      tableName: this.state.tableName
                    })
                    this.contextMenuRef.current?.blur()
                  }}
                >
                  <Icon type="delete" /> Delete Item
                </Menu.Item>
              </Menu>
            </div>
          )}
          <QueryFormHeader
            queryType={this.state.queryType}
            indexes={this.state.indexes}
            selectedIndex={this.state.selectedIndex}
            onQueryTypeChange={queryType => {
              this.setState({
                queryType
              })
            }}
            onIndexChange={selectedIndex => {
              this.setState({
                selectedIndex
              })
            }}
            queryFilterVisible={this.state.queryFilterVisible}
            onQueryFilterClick={() => {
              this.setState({
                queryFilterVisible: !this.state.queryFilterVisible
              })
            }}
            onSearch={async () => {
              await this.cleanResults()
              await this.fetchItems()
            }}
          />
          {this.state.queryFilterVisible && (
            <QueryFormFilter
              attributesSchema={this.state.attributesSchema}
              queryFilters={this.state.queryFilters}
              columns={this.state.columns}
              onFilterAdd={() => {
                this.setState({
                  queryFilters: [
                    ...this.state.queryFilters,
                    {
                      id: Math.random(),
                      comparison: '='
                    }
                  ]
                })
              }}
              onFilterRemove={filterId => {
                this.setState({
                  queryFilters: this.state.queryFilters.filter(
                    f => f.id !== filterId
                  )
                })
              }}
              onChange={(changedFilter: QueryFilter) => {
                this.setState({
                  queryFilters: this.state.queryFilters.map(filter => {
                    if (filter.id === changedFilter.id) {
                      if (!changedFilter.dataType) {
                        return {
                          ...changedFilter,
                          autoDetectedDataType: autoDetectDataType({
                            value: changedFilter.value,
                            fieldName: changedFilter.fieldName,
                            attributesSchema: this.state.attributesSchema
                          })
                        }
                      } else {
                        return changedFilter
                      }
                    } else {
                      return filter
                    }
                  })
                })
              }}
            />
          )}

          <div className="table-wrapper">
            {this.state.error ? (
              <div>{this.state.error}</div>
            ) : (
              <AutoResizer>
                {({ width, height }) => (
                  <BaseTable
                    fixed
                    frozenData={this.state.frozenData}
                    data={this.state.items}
                    columns={this.state.columns}
                    rowKey="_slsConsoleKey"
                    width={width}
                    height={height}
                    headerHeight={35}
                    rowHeight={35}
                    footerHeight={this.state.isFooterExpanded ? 240 : 40}
                    sortBy={this.state.sortBy}
                    onColumnSort={this.onColumnSort}
                    rowClassName={({ rowIndex, rowData }) => {
                      let classes = ''
                      const compositKey = this.getCompositKey(rowData)
                      const command = this.state.commands.find(
                        c => c.compositKey === compositKey
                      )

                      if (this.state.clipboard?.rowIndex === rowIndex) {
                        classes +=
                          ' clipboard-' + this.state.clipboard?.cellIndex
                      }

                      if (this.state.commandHoverRows.includes(compositKey)) {
                        classes += ' command-hover'
                      }
                      if (command && command.action === 'update') {
                        classes += ' updated-item'
                      }
                      if (command && command.action === 'delete') {
                        classes += ' deleted-item'
                      }
                      if (
                        this.state.contextMenu?.slsConsoleKey ===
                        rowData._slsConsoleKey
                      ) {
                        classes += ' context-menu-hover'
                      }
                      return classes
                    }}
                    cellProps={({ column, rowData, rowIndex }) => ({
                      onDoubleClick: e => {
                        const compositKey = this.getCompositKey(rowData)
                        const command = this.state.commands.find(
                          c => c.compositKey === compositKey
                        )

                        editItem({
                          queryType: this.state.queryType,
                          index: this.state.indexes[this.state.selectedIndex]
                            .id,
                          content: this.state.originalItems[
                            rowData._slsConsoleKey
                          ],
                          selectColumn: column.dataKey,
                          columns: this.state.columns.map(c => c.key),
                          newData: command?.newData
                        })
                      },
                      onClick: e => {
                        if (!e.metaKey) {
                          return false
                        }

                        const originalItemProp = this.state.originalItems[
                          rowData._slsConsoleKey
                        ]?.[column.key]

                        if (
                          rowData[column.key] === undefined ||
                          !originalItemProp
                        ) {
                          return false
                        }

                        const cellIndex =
                          this.state.columns.findIndex(
                            c => c.key === column.key
                          ) + 1

                        let targetNode =
                          e.target.getAttribute('role') === 'gridcell'
                            ? e.target
                            : e.target.parentElement

                        const coordinates = getOffset(targetNode.children[0])
                        const rightLimit = window.innerWidth - 150

                        copy(originalItemProp)

                        this.setState({
                          clipboard: {
                            confirmed: false,
                            rowIndex,
                            cellIndex,
                            top: coordinates.top - 22,
                            left:
                              coordinates.left < 0
                                ? 0
                                : coordinates.left > rightLimit
                                ? rightLimit
                                : coordinates.left
                          }
                        })

                        setTimeout(() => {
                          this.setState({
                            clipboard: {}
                          })
                        }, 500)
                      },
                      onContextMenu: event => {
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
                                event.pageX > maxWidth ? maxWidth : event.pageX
                            }
                          },
                          () => {
                            this.contextMenuRef.current?.focus()
                          }
                        )
                      }
                    })}
                    rowEventHandlers={{
                      onClick: ({ rowIndex, rowKey, rowData, event }) => {
                        /*this.setState({
                    selectedRows: this.state.selectedRows.includes(rowIndex)
                      ? this.state.selectedRows.filter(
                          index => index !== rowIndex
                        )
                      : [...this.state.selectedRows, rowIndex],
                    lastSelected: rowIndex
                  })*/
                      }
                    }}
                    rowRenderer={({ rowData, cells }) => {
                      if (rowData._slsConsoleKey === 'loadMore') {
                        return (
                          <div className="load-more">
                            <span className="fetched-message">
                              Fetched {this.state.count} items (
                              {this.state.scannedCount} scanned)
                            </span>

                            {this.state.isLoading ? (
                              <span className="loadmore">loading...</span>
                            ) : (
                              this.state.lastEvaluatedKey && (
                                <span
                                  className="spanlink loadmore"
                                  onClick={() => {
                                    this.fetchItems()
                                  }}
                                >
                                  Load more
                                </span>
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
                                  {this.state.commands.map(command => (
                                    <tr
                                      key={command.id}
                                      className="command-row"
                                      onMouseEnter={() => {
                                        this.setState({
                                          commandHoverRows: command.compositKey
                                        })
                                      }}
                                      onMouseLeave={() => {
                                        this.setState({
                                          commandHoverRows: []
                                        })
                                      }}
                                    >
                                      <td className="operation">
                                        <span className={command.action}>
                                          <Icon type={command.icon} />
                                          {command.action?.toUpperCase()}
                                        </span>
                                      </td>
                                      <td className="timestamp">
                                        <RelativeTime
                                          time={command.timestamp}
                                        />
                                      </td>
                                      <td className="primary-key">
                                        {command.compositKey}
                                      </td>
                                      <td className="icons">
                                        <Tooltip
                                          title="Discard command"
                                          placement="left"
                                        >
                                          <Icon
                                            type="delete"
                                            onClick={() => {
                                              this.setState({
                                                commands: this.state.commands.filter(
                                                  c => c.id !== command.id
                                                )
                                              })
                                            }}
                                          />
                                        </Tooltip>
                                      </td>
                                    </tr>
                                  ))}
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
                            <Icon type="reload" />
                            <Icon type="setting" />
                          </div>

                          <div className="footer-right">
                            {this.state.commands.length ? (
                              <span
                                className="queue-message"
                                onClick={() => {
                                  this.setState({
                                    isFooterExpanded: !this.state
                                      .isFooterExpanded
                                  })
                                }}
                              >
                                <span className="commands-num">
                                  {this.state.commands.length}
                                </span>
                                staged commands
                                <Icon
                                  type={
                                    this.state.isFooterExpanded ? 'down' : 'up'
                                  }
                                />
                              </span>
                            ) : null}

                            {this.state.isFooterExpanded ? (
                              <Button
                                type="primary"
                                size="small"
                                onClick={e => {
                                  e.currentTarget.blur()
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
                                  pointerEvents: 'none'
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

function getOffset(el) {
  var _x = 0
  var _y = 0
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft
    _y += el.offsetTop - el.scrollTop
    el = el.offsetParent
  }
  return { top: _y, left: _x }
}

function autoDetectDataType({ value, fieldName, attributesSchema }) {
  if (attributesSchema?.[fieldName]) {
    return attributesSchema?.[fieldName]
  }
  if (value === 'false' || value === 'true') {
    return 'BOOL'
  }
  if (!isNaN(value)) {
    return 'N'
  }
  return 'S'
}
