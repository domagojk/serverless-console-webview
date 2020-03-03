import React from 'react'
import BaseTable, { AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'
import './items.css'
import {
  dynamoDbScan,
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

export class Items extends React.Component {
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
    queries: [
      {
        isLoading: false,
        type: 'scan',
        count: 0,
        scannedCount: 0,
        lastEvaluatedKey: null,
        columns: [],
        originalItems: [],
        items: []
      }
    ],
    contextMenu: {
      top: 0,
      left: 0,
      slcConsoleKey: null
    },
    tableName: '',
    hashKey: '',
    sortKey: '',
    isFooterExpanded: false,
    defaultColumns: [],
    commandHoverRows: [],
    lastSelected: null,
    activeQueryIndex: 0,
    sortBy: {}
  }
  contextMenuRef: React.RefObject<any>

  constructor(props) {
    super(props)
    this.contextMenuRef = React.createRef()
  }

  async componentDidMount() {
    const tableDesc = await dynamoDbTableDesc()
    const hashKey = tableDesc.KeySchema.find(key => key.KeyType === 'HASH')
    const range = tableDesc.KeySchema.find(key => key.KeyType === 'RANGE')

    this.setState({
      tableName: tableDesc.TableName,
      hashKey: hashKey && hashKey.AttributeName ? hashKey.AttributeName : null,
      sortKey: range ? range.AttributeName && range.AttributeName : null,
      defaultColumns: [hashKey.AttributeName, range?.AttributeName].filter(
        val => !!val
      )
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

  async fetchItems() {
    const { queries, activeQueryIndex } = this.state

    this.setState({
      queries: queries.map((query, index) => {
        if (index === activeQueryIndex) {
          return {
            ...query,
            isLoading: true
          }
        } else {
          return query
        }
      })
    })

    const res = await dynamoDbScan({
      lastEvaluatedKey: queries[activeQueryIndex].lastEvaluatedKey
    })

    this.setState({
      queries: queries.map((query, index) => {
        if (index === activeQueryIndex) {
          let columnNames =
            query.columns.length === 0
              ? this.state.defaultColumns
              : query.columns.map(c => c.key)

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

          const currentItems = query.items.filter(
            item => item._slsConsoleKey !== 'loadMore'
          )

          const newItems = [...currentItems, ...res.items].map(
            (item, index) => {
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
            }
          )

          return {
            ...query,
            isLoading: false,
            count: query.count + res.count,
            scannedCount: query.scannedCount + res.scannedCount,
            originalItems: [...query.originalItems, ...res.items],
            items: [
              ...newItems,
              {
                _slsConsoleKey: 'loadMore'
              }
            ],
            columns: [
              ...columnNames.map(column => {
                const prevColumn = query.columns.find(c => c.key === column)
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
          }
        } else {
          return query
        }
      })
    })
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
    const query = this.state.queries[this.state.activeQueryIndex]

    return (
      <>
        {this.state.contextMenu?.slcConsoleKey !== null && (
          <div
            ref={this.contextMenuRef}
            className="context-menu"
            tabIndex={1}
            onBlur={() => {
              this.setState({
                contextMenu: {
                  slcConsoleKey: null
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
              <Menu.Item key="duplicate">
                <Icon type="copy" /> Duplicate
              </Menu.Item>
              <Menu.Item
                key="edit"
                onClick={() => {
                  const slcConsoleKey = this.state.contextMenu.slcConsoleKey

                  editItem({
                    content: query.originalItems[slcConsoleKey],
                    columns: query.columns.map(c => c.key),
                    hashKey: this.state.hashKey,
                    sortKey: this.state.sortKey,
                    tableName: this.state.tableName
                  })
                  this.contextMenuRef.current?.blur()
                }}
              >
                <Icon type="edit" /> Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                onClick={() => {
                  const slcConsoleKey = this.state.contextMenu.slcConsoleKey

                  deleteItem({
                    hashKey:
                      query.originalItems[slcConsoleKey][this.state.hashKey],
                    sortKey:
                      this.state.sortKey !== undefined
                        ? query.originalItems[slcConsoleKey][this.state.sortKey]
                        : null,
                    tableName: this.state.tableName
                  })
                  this.contextMenuRef.current?.blur()
                }}
              >
                <Icon type="delete" /> Delete
              </Menu.Item>
            </Menu>
          </div>
        )}
        <div className="query-form">
          <Radio.Group
            defaultValue="scan"
            className="scan-query-group"
            size="small"
          >
            <Radio.Button value="scan">Scan</Radio.Button>
            <Radio.Button value="query">Query</Radio.Button>
          </Radio.Group>

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.alipay.com/"
                  >
                    1st menu item
                  </a>
                </Menu.Item>
                <Menu.Item>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.taobao.com/"
                  >
                    2nd menu item
                  </a>
                </Menu.Item>
                <Menu.Item>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.tmall.com/"
                  >
                    3rd menu item
                  </a>
                </Menu.Item>
              </Menu>
            }
          >
            <span className="index-dropdown">
              [Table] eventstore: streamId, version
              <Icon type="down" />
            </span>
          </Dropdown>

          <div className="right">
            <div
              className={`iconwrapper ${
                this.state.queryFilterVisible ? 'filter-opened' : ''
              }`}
              onClick={() => {
                this.setState({
                  queryFilterVisible: !this.state.queryFilterVisible
                })
              }}
            >
              <Icon type="filter" />
              Filter
            </div>
            <Button type="primary" size="small">
              Search
            </Button>
          </div>
        </div>
        {this.state.queryFilterVisible && (
          <div className="query-filter">
            {this.state.queryFilters.map((filter, index) => (
              <div className="query-filter-item" key={filter.id}>
                <AutoComplete
                  style={{ width: 150, marginRight: 5 }}
                  dataSource={query.columns.map(c => c.key)}
                  placeholder="Field name"
                />
                <AutoComplete
                  style={{ width: 90, marginRight: 5 }}
                  dataSource={['Begins with', '=', '>', '<']}
                  value="Begins with"
                />
                <Input
                  style={{ width: 150, marginRight: 5 }}
                  placeholder="Field value"
                />
                <Icon
                  type="minus-circle"
                  className="item-remove item-add-remove"
                  onClick={() => {
                    this.setState({
                      queryFilters: this.state.queryFilters.filter(
                        f => f.id !== filter.id
                      )
                    })
                  }}
                />
              </div>
            ))}
            <span
              className="item-add-remove add-field-icon"
              onClick={() => {
                this.setState({
                  queryFilters: [
                    ...this.state.queryFilters,
                    {
                      id: Math.random()
                    }
                  ]
                })
              }}
            >
              <Icon type="plus-circle" /> Add field
            </span>
          </div>
        )}

        <div className="table-wrapper">
          <AutoResizer>
            {({ width, height }) => (
              <BaseTable
                fixed
                data={query.items}
                columns={query.columns}
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
                      content: query.originalItems[rowData._slsConsoleKey],
                      selectColumn: column.dataKey,
                      columns: query.columns.map(c => c.key),
                      hashKey: this.state.hashKey,
                      sortKey: this.state.sortKey,
                      tableName: this.state.tableName,
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
                            event.pageY > maxHeight ? maxHeight : event.pageY,
                          left: event.pageX > maxWidth ? maxWidth : event.pageX
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
                          title={`${query.scannedCount} items
                        scanned`}
                        >
                          <span className="fetched-message">
                            Fetched {query.count} items
                          </span>
                        </Tooltip>

                        {query.isLoading ? (
                          <span className="loadmore">loading...</span>
                        ) : (
                          query.lastEvaluatedKey && (
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
                                    <RelativeTime time={command.timestamp} />
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
                                isFooterExpanded: !this.state.isFooterExpanded
                              })
                            }}
                          >
                            <span className="commands-num">
                              {this.state.commands.length}
                            </span>
                            staged commands
                            <Icon
                              type={this.state.isFooterExpanded ? 'down' : 'up'}
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
        </div>
      </>
    )
  }
}
