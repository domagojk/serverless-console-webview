import React from 'react'
import BaseTable, { AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'
import './items.css'
import { dynamoDbScan } from '../asyncData/dynamoDb'

export class Items extends React.Component {
  state = {
    queries: [
      {
        type: 'scan',
        count: 0,
        scannedCount: 0,
        lastEvaluatedKey: null,
        columns: [],
        items: []
      }
    ],
    activeQueryIndex: 0,
    sortBy: {}
  }

  async fetchItems() {
    const { queries, activeQueryIndex } = this.state

    const res = await dynamoDbScan({
      lastEvaluatedKey: queries[activeQueryIndex].lastEvaluatedKey
    })

    this.setState({
      queries: queries.map((query, index) => {
        if (index !== activeQueryIndex) {
          return query
        } else {
          return {
            ...query,
            count: query.count + res.count,
            scannedCount: query.scannedCount + res.scannedCount,
            items: [...query.items, ...res.items].map((item, index) => {
              return {
                ...item,
                _slsConsoleKey: index
              }
            }),
            // todo columns
            columns: Object.keys(res.columns).map(column => {
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
            lastEvaluatedKey: res.lastEvaluatedKey
          }
        }
      })
    })
  }

  componentDidMount() {
    this.fetchItems()
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
              headerHeight={45}
              rowHeight={40}
              footerHeight={40}
              sortBy={this.state.sortBy}
              onColumnSort={this.onColumnSort}
              footerRenderer={
                <div>
                  <span onClick={() => {}}>Load more</span>
                </div>
              }
            />
          )}
        </AutoResizer>
      </div>
    )
  }
}
