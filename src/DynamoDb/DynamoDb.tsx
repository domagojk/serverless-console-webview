import 'react-base-table/styles.css'
import './dynamoDb.css'
import React from 'react'
import BaseTable, { AutoResizer } from 'react-base-table'
import {
  dynamoDbFetchItems,
  dynamoDbTableDesc,
  editItem,
  deleteItem,
  createItem
} from '../asyncData/dynamoDb'
import { postComponentMounted } from '../asyncData/asyncData'
import {
  Icon,
  Button,
  AutoComplete,
  Input,
  Dropdown,
  Menu,
  Radio,
  Tooltip
} from 'antd'
import { RelativeTime } from '../LogsPage/RelativeTime'
import { ContextMenu } from './components/ContextMenu'
import { QueryFormHeader } from './components/QueryFormHeader'
import { QueryFormFilter } from './components/QueryFormFilter'

export class DynamoDb extends React.Component {
  state = {
    queryFilterVisible: true,
    queryFilters: [
      {
        id: Math.random()
      }
    ],
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
      slcConsoleKey: null
    },
    error: '',
    isFooterExpanded: false,
    commandHoverRows: [],
    lastSelected: null,
    sortBy: {},

    tableName: '',
    hashKey: '',
    sortKey: '',
    indexes: [] as {
      id: string
      name: string
      hashRangeKeys: string[]
    }[],

    selectedIndex: 0
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
      indexes: tableDesc.indexes
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
            slcConsoleKey: null
          }
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
            const appPx = Math.round(res.columns[column] * 8.5)

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
          {this.state.contextMenu?.slcConsoleKey !== null && (
            <ContextMenu
              ref={this.contextMenuRef}
              onBlur={() => {
                this.setState({
                  contextMenu: {
                    slcConsoleKey: null
                  }
                })
              }}
              onEdit={() => {
                const slcConsoleKey = this.state.contextMenu.slcConsoleKey

                editItem({
                  queryType: this.state.queryType,
                  index: this.state.indexes[this.state.selectedIndex].id,
                  content: this.state.originalItems[slcConsoleKey],
                  columns: this.state.columns.map(c => c.key)
                })
                this.contextMenuRef.current?.blur()
              }}
              onDelete={() => {
                const slcConsoleKey = this.state.contextMenu.slcConsoleKey

                deleteItem({
                  hashKey: this.state.originalItems[slcConsoleKey][
                    this.state.hashKey
                  ],
                  sortKey:
                    this.state.sortKey !== undefined
                      ? this.state.originalItems[slcConsoleKey][
                          this.state.sortKey
                        ]
                      : null,
                  tableName: this.state.tableName
                })
                this.contextMenuRef.current?.blur()
              }}
              style={{
                top: this.state.contextMenu.top,
                left: this.state.contextMenu.left
              }}
            />
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
              queryFilters={this.state.queryFilters}
              columns={this.state.columns}
              onFilterAdd={() => {
                this.setState({
                  queryFilters: [
                    ...this.state.queryFilters,
                    {
                      id: Math.random()
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
                        this.state.contextMenu?.slcConsoleKey ===
                        rowData._slsConsoleKey
                      ) {
                        classes += ' context-menu-hover'
                      }
                      return classes
                    }}
                    cellProps={({ column, rowData }) => ({
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
                      }
                    })}
                    rowEventHandlers={{
                      onContextMenu: ({ event, rowData }) => {
                        event.preventDefault()
                        if (rowData._slsConsoleKey === 'loadMore') {
                          return
                        }
                        const maxWidth = window.innerWidth - 140
                        const maxHeight = window.innerHeight - 180

                        this.setState(
                          {
                            contextMenu: {
                              slcConsoleKey: rowData._slsConsoleKey,
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
                      },
                      onClick: ({ rowIndex, rowKey, rowData, event }) => {
                        console.log(
                          rowIndex,
                          rowKey,
                          rowData,
                          event.screenX,
                          event.screenY,
                          event.metaKey,
                          event.shiftKey
                        )

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
                            <Tooltip
                              mouseEnterDelay={0.5}
                              title={`${this.state.scannedCount} items scanned`}
                            >
                              <span className="fetched-message">
                                Fetched {this.state.count} items
                              </span>
                            </Tooltip>

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
