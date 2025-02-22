import './queryFormHeader.css'
import React from 'react'
import { Icon, Menu, Radio, Dropdown, Tooltip, Modal } from 'antd'
import { CoffeeIcon } from '../../AddServicePage/CoffeeIcon'
import { CloudUiIcon } from '../../AddServicePage/CloudUiIcon'

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
      <div
        style={{
          marginRight: 10,
        }}
      >
        <Tooltip title="AWS Console Alternative" placement="bottomLeft">
          <Icon
            onClick={() => {
              Modal.info({
                className: 'cloud-ui-modal',
                title: 'Standalone Desktop Alternative to the AWS Console',
                content: (
                  <div>
                    <p>
                      <strong>CloudUI</strong> is an{' '}
                      <strong>advanced version</strong> of this extension.
                    </p>
                    <p>
                      An alternative to the AWS Console with{' '}
                      <strong>a powerful</strong>,{' '}
                      <strong>user-friendly</strong> interface for the most used
                      services:
                    </p>
                    <ul>
                      <li>Custom Dashboards</li>
                      <li>Logs</li>
                      <li>DynamoDB Client</li>
                      <li>SQL Client</li>
                      <li>S3 Manager</li>
                      <li>EC2 Manager</li>
                    </ul>
                    <p>
                      Get early access:{' '}
                      <a href="https://www.cloud-ui.com/">Cloud-UI.com</a>.
                    </p>
                    <img
                      src="https://www.cloud-ui.com/hero.png"
                      alt="CloudUI"
                    />
                  </div>
                ),
                maskClosable: true,
                width: 500,
              })
            }}
            style={{ width: 24, height: 24, cursor: 'pointer' }}
            component={CloudUiIcon}
          />
        </Tooltip>
      </div>
    </div>
  )
}
