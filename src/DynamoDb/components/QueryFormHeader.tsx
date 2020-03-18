import './queryFormHeader.css'
import React from 'react'
import { Icon, Menu, Radio, Dropdown, Button } from 'antd'

export function QueryFormHeader({
  queryType,
  indexes,
  selectedIndex,
  onQueryTypeChange,
  onIndexChange,
  queryFilterVisible,
  onQueryFilterClick,
  onSearch
}) {
  return (
    <div className="query-form">
      <Radio.Group
        value={queryType}
        className="scan-query-group"
        size="small"
        onChange={e => onQueryTypeChange(e.target.value)}
      >
        <Radio.Button value="scan">Scan</Radio.Button>
        <Radio.Button value="query">Query</Radio.Button>
      </Radio.Group>

      {indexes.length ? (
        <Dropdown
          overlay={
            <Menu>
              {indexes.map((index, i) => (
                <Menu.Item key={index.name} onClick={() => onIndexChange(i)}>
                  <span>{index.name}</span>
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <span className="index-dropdown">
            {indexes[selectedIndex].name}
            <Icon type="down" />
          </span>
        </Dropdown>
      ) : null}

      <div className="right">
        <div
          className={`iconwrapper ${queryFilterVisible ? 'filter-opened' : ''}`}
          onClick={onQueryFilterClick}
        >
          <Icon type="filter" />
          Filter
        </div>
        <Button type="primary" size="small" onClick={onSearch}>
          Search
        </Button>
      </div>
    </div>
  )
}
