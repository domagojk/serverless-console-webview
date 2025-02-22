import './logsPage.css'
import React, { useState } from 'react'
import { Tabs, Icon, Tooltip, Modal } from 'antd'
import { TabWrapper } from './TabWrapper'
import { SearchPage } from './SearchPage'
import { viewstateChanged } from '../asyncData/asyncData'
import { CloudUiIcon } from '../AddServicePage/CloudUiIcon'

const { TabPane } = Tabs

export function LogsPage() {
  const [mounted, addToMounted] = useState([
    document.vscodeData.viewState?.page || 'logs',
  ])
  const [activePage, setActivePage] = useState(
    document.vscodeData.viewState?.page || 'logs'
  )
  const [activeTab, setActiveTab] = useState(
    document.vscodeData.viewState?.tab || document.vscodeData.tabs[0].title
  )
  const [refreshVal, setRefreshVal] = useState(
    document.vscodeData.autoRefreshInterval
  )

  return (
    <div className="logs-page">
      <div className="sidebar">
        <div
          className={
            activePage === 'logs' ? 'sidebar-item active' : 'sidebar-item'
          }
          onClick={() => {
            setActivePage('logs')
            viewstateChanged({
              page: 'logs',
              tab: activeTab,
            })
            addToMounted(
              mounted.includes('logs') ? mounted : [...mounted, 'logs']
            )
          }}
        >
          <Tooltip
            placement="right"
            title="Last Logs"
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <Icon type="unordered-list" />
          </Tooltip>
        </div>
        <div
          className={
            activePage === 'search' ? 'sidebar-item active' : 'sidebar-item'
          }
          onClick={() => {
            setActivePage('search')
            viewstateChanged({
              page: 'search',
              tab: activeTab,
            })
            addToMounted(
              mounted.includes('search') ? mounted : [...mounted, 'search']
            )
          }}
        >
          <Tooltip
            placement="right"
            title="Search Logs"
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <Icon type="file-search" />
          </Tooltip>
        </div>
      </div>
      <div className="main-wrapper">
        <Tabs
          activeKey={activeTab}
          animated={false}
          onChange={(key) => {
            setActiveTab(key)
            viewstateChanged({
              page: activePage,
              tab: key,
            })
          }}
        >
          {document.vscodeData.tabs.map((tab: any) => (
            <TabPane tab={tab.title} key={tab.title}>
              {mounted.includes('search') && (
                <div
                  style={{
                    display: activePage === 'search' ? 'block' : 'none',
                  }}
                >
                  <SearchPage
                    logGroupName={tab.logs}
                    region={tab.region}
                    awsProfile={tab.awsProfile}
                  />
                </div>
              )}

              {mounted.includes('logs') && (
                <div
                  style={{
                    display: activePage === 'logs' ? 'block' : 'none',
                  }}
                >
                  <TabWrapper
                    tab={tab}
                    isActive={activePage === 'logs' && activeTab === tab.title}
                    autoRefreshInterval={refreshVal}
                    onAutoRefreshChange={(autoRefreshInterval) => {
                      document.vscodeData.autoRefreshInterval =
                        autoRefreshInterval
                      setRefreshVal(autoRefreshInterval)
                    }}
                  />
                </div>
              )}
            </TabPane>
          ))}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 0,
              textAlign: 'right',
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
                          <strong>user-friendly</strong> interface for the most
                          used services:
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
        </Tabs>
      </div>
    </div>
  )
}
