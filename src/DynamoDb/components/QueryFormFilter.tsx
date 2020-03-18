import './queryFormFilter.css'
import React from 'react'
import { Icon, Menu, AutoComplete, Input } from 'antd'

export function QueryFormFilter({
  queryFilters,
  columns,
  onFilterAdd,
  onFilterRemove
}) {
  return (
    <div className="query-filter">
      {queryFilters.map((filter, index) => (
        <div className="query-filter-item" key={filter.id}>
          <AutoComplete
            style={{ width: 150, marginRight: 5 }}
            dataSource={columns.map(c => c.key)}
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
              onFilterRemove(filter.id)
            }}
          />
        </div>
      ))}
      <span className="item-add-remove add-field-icon" onClick={onFilterAdd}>
        <Icon type="plus-circle" /> Add field
      </span>
    </div>
  )
}
