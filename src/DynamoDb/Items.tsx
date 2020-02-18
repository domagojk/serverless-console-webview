import React from 'react'
import BaseTable, { AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'
import './items.css'
import {
  dynamoDbScan,
  dynamoDbTableDesc,
  openJSON
} from '../asyncData/dynamoDb'
import { Icon, Checkbox, Button } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faKey } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(faExternalLinkAlt, faKey)

export class Items extends React.Component {
  state = {
    queryFormVisible: false,
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
        <div
          className="query-form"
          onClick={() => {
            this.setState({ queryFormVisible: !this.state.queryFormVisible })
          }}
        >
          <Icon type="right" />
          <span
            style={{
              fontWeight: 'bold',
              marginRight: 30,
              marginLeft: 5
            }}
          >
            scan
          </span>
          <span>[Table] eventstore: streamId, version</span>
        </div>
        {this.state.queryFormVisible && (
          <div className="query-form-options">aasas</div>
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
                              <tr>
                                <td className="operation">
                                  <span className="add">
                                    <Icon type="plus-circle" /> ADD
                                  </span>
                                </td>
                                <td className="timestamp">1 minute ago</td>
                                <td className="primary-key">primary key</td>
                                <td className="icons">
                                  <Icon type="info-circle" />
                                  <Icon type="close" />
                                </td>
                              </tr>

                              <tr>
                                <td className="operation">
                                  <span className="edit">
                                    <Icon type="edit" /> EDIT
                                  </span>
                                </td>
                                <td className="timestamp">2 minutes ago</td>
                                <td className="primary-key">primary key</td>

                                <td className="icons">
                                  <Icon type="info-circle" />
                                  <Icon type="close" />
                                </td>
                              </tr>

                              <tr>
                                <td className="operation">
                                  <span className="delete">
                                    <Icon type="close-circle" /> DELETE
                                  </span>
                                </td>
                                <td className="timestamp">3 minutes ago</td>
                                <td className="primary-key">primary key</td>

                                <td className="icons">
                                  <Icon type="info-circle" />
                                  <Icon type="close" />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <div className="footer-wrapper">
                      <div className="footer-left">
                        <Icon type="plus-circle" />
                        <Icon type="reload" />
                        <Icon type="setting" />
                      </div>
                      <div className="footer-center">
                        <span>
                          Fetched {query.count} items ({query.scannedCount}{' '}
                          scanned)
                        </span>
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
                        <span
                          className="queue-message"
                          onClick={() => {
                            this.setState({
                              isFooterExpanded: !this.state.isFooterExpanded
                            })
                          }}
                        >
                          <span className="commands-num">4</span> commands in
                          queue
                        </span>

                        <Button type="primary" size="small">
                          Run
                        </Button>
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
