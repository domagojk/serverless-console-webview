import './queryFormHeader.css'
import React from 'react'
import { Icon, Menu, Radio, Dropdown } from 'antd'

export function QueryFormHeader({
  queryType,
  indexes,
  selectedIndex,
  onQueryTypeChange,
  onIndexChange,
}: {
  queryType: any
  indexes: any
  selectedIndex: any
  onQueryTypeChange: any
  onIndexChange: any
}) {
  return (
    <div className="query-form">
      <div>
        <Radio.Group
          value={queryType}
          className="scan-query-group"
          size="small"
          onChange={(e) => onQueryTypeChange(e.target.value)}
        >
          <Radio.Button value="scan">Scan</Radio.Button>
          <Radio.Button value="query">Query</Radio.Button>
        </Radio.Group>

        {indexes.length ? (
          <Dropdown
            className="index-dropdown"
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
      </div>
    </div>
  )
}
