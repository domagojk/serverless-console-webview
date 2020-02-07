import React from 'react'
import BaseTable, { AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'
import './items.css'
import { dynamoDbScan, dynamoDbTableDesc } from '../asyncData/dynamoDb'
import { Icon, Tooltip, Checkbox, Button } from 'antd'

export class Items extends React.Component {
  state = {
    queries: [
      {
        isLoading: false,
        type: 'scan',
        count: 0,
        scannedCount: 0,
        lastEvaluatedKey: null,
        columns: [],
        items: []
      }
    ],
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
              : query.columns
                  .map(c => c.key)
                  .filter(
                    key => key !== '__selection__' && key !== '__options__'
                  )

          Object.keys(res.columns).forEach(column => {
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
            items: [...query.items, ...res.items].map((item, index) => {
              return {
                ...item,
                _slsConsoleKey: index
              }
            }),
            columns: [
              {
                width: 40,
                flexShrink: 0,
                resizable: false,
                frozen: 'left',
                cellRenderer: () => <Checkbox />,
                key: '__selection__'
              },
              ...columnNames.map(column => {
                const appPx = res.columns[column] * 12

                return {
                  key: column,
                  dataKey: column,
                  title: column,
                  resizable: true,
                  sortable: true,
                  width: appPx < 70 ? 70 : appPx > 400 ? 400 : appPx
                }
              }),
              {
                width: 50,
                flexShrink: 0,
                resizable: false,
                frozen: 'right',
                cellRenderer: () => (
                  <div className="firstcell">
                    <Icon type="copy" />
                    <Icon type="edit" />
                  </div>
                ),
                key: '__options__'
              }
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
              footerHeight={40}
              sortBy={this.state.sortBy}
              onColumnSort={this.onColumnSort}
              rowClassName={({ rowIndex }) => {
                return this.state.selectedRows.includes(rowIndex)
                  ? 'selected'
                  : ''
              }}
              rowEventHandlers={{
                onClick: ({ rowIndex, rowKey, rowData, event }) => {
                  console.log(
                    rowIndex,
                    rowKey,
                    rowData,
                    event.screenX,
                    event.screenY
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
                <div className="footer-wrapper">
                  <div className="footer-left">
                    <Icon type="plus-circle" />
                    <Icon type="reload" />
                    <Icon type="setting" />
                  </div>
                  <div className="footer-center">
                    <span>
                      Fetched {query.count} items ({query.scannedCount} scanned)
                    </span>
                    {query.isLoading ? (
                      <span className="loadmore">loading...</span>
                    ) : (
                      <span
                        className="spanlink loadmore"
                        onClick={() => {
                          this.fetchItems()
                        }}
                      >
                        Load more
                      </span>
                    )}
                  </div>
                  <div className="footer-right">
                    <span className="queue-message">
                      <span className="commands-num">4</span> commands in queue
                    </span>

                    <Button type="primary" size="small">
                      Run
                    </Button>
                  </div>
                </div>
              }
            />
          )}
        </AutoResizer>
      </div>
    )
  }
}
