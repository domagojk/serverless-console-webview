import React from 'react'
import BaseTable, { AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'
import './items.css'
import {
  dynamoDbScan,
  dynamoDbTableDesc,
  openJSON
} from '../asyncData/dynamoDb'
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
import { faExternalLinkAlt, faKey } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { RelativeTime } from '../LogsPage/RelativeTime'

library.add(faExternalLinkAlt, faKey)

export class Items extends React.Component {
  state = {
    queryFilterVisible: true,
    queryFilters: [
      {
        id: Math.random()
      }
    ],
    commands: [] as {
      type: 'add' | 'edit' | 'delete'
      id: string
      timestamp: number
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
    tableName: '',
    hashKey: '',
    sortKey: '',
    isFooterExpanded: false,
    defaultColumns: [],
    selectedRows: [],
    lastSelected: null,
    activeQueryIndex: 0,
    sortBy: {}
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
        isFooterExpanded: false
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

          return {
            ...query,
            isLoading: false,
            count: query.count + res.count,
            scannedCount: query.scannedCount + res.scannedCount,
            originalItems: [...query.originalItems, ...res.items],
            items: [...query.items, ...res.items].map((item, index) => {
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
            }),
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
  }

  onColumnSort = sortBy => {
    console.log(sortBy)

    /*this.setState({
      data: this.state.data.reverse(),
      sortBy
    })*/
  }

  render() {
    const query = this.state.queries[this.state.activeQueryIndex]

    return (
      <>
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
                rowClassName={({ rowIndex }) => {
                  return this.state.selectedRows.includes(rowIndex)
                    ? 'selected'
                    : ''
                }}
                cellProps={({ column, rowData }) => ({
                  onDoubleClick: e => {
                    openJSON({
                      content: query.originalItems[rowData._slsConsoleKey],
                      selectColumn: column.dataKey,
                      columns: query.columns.map(c => c.key),
                      hashKey: this.state.hashKey,
                      sortKey: this.state.sortKey,
                      tableName: this.state.tableName
                    })
                  }
                })}
                rowEventHandlers={{
                  onContextMenu: () => {
                    console.log('right click')
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
                footerRenderer={
                  <div>
                    {this.state.isFooterExpanded && (
                      <div className="log-table-wrapper">
                        <div className="table-wrapper">
                          <table className="log-table">
                            <tbody>
                              {this.state.commands.reverse().map(command => (
                                <tr key={command.id}>
                                  <td className="operation">
                                    <span className={command.type}>
                                      <Icon type="plus-circle" />
                                      {command.type.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="timestamp">
                                    <RelativeTime time={command.timestamp} />
                                  </td>
                                  <td className="primary-key">{command.id}</td>
                                  <td className="icons">
                                    <Tooltip
                                      title="Command details"
                                      placement="left"
                                    >
                                      <Icon type="select" />
                                    </Tooltip>

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
                            this.setState({
                              commands: [
                                ...this.state.commands,
                                {
                                  id: Math.random(),
                                  type: 'add',
                                  timestamp: Date.now()
                                }
                              ]
                            })
                          }}
                        />
                        <Icon type="reload" />
                        <Icon type="setting" />
                      </div>
                      <div className="footer-center">
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
                            commands in queue
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
