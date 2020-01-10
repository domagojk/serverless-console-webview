import './logsPage.css'
import React, { useState } from 'react'
import { Tabs, Icon, Tooltip } from 'antd'
import { TabWrapper } from './TabWrapper'
import { SearchPage } from './SearchPage'

const { TabPane } = Tabs

export function LogsPage() {
  const [mounted, addToMounted] = useState([
    document.vscodeData.tabs[0].page || 'logs'
  ])
  const [activePage, setActivePage] = useState(
    document.vscodeData.tabs[0].page || 'logs'
  )
  const [activeTab, setActiveTab] = useState(document.vscodeData.tabs[0].title)
  const [refreshVal, setRefreshVal] = useState(
    document.vscodeData.autoRefreshInterval
  )

  return (
    <div>
      <div className="sidebar">
        <div
          className={
            activePage === 'logs' ? 'sidebar-item active' : 'sidebar-item'
          }
          onClick={() => {
            setActivePage('logs')
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
          animated={false}
          onChange={key => {
            setActiveTab(key)
          }}
        >
          {document.vscodeData.tabs.map((tab: any) => (
            <TabPane tab={tab.title} key={tab.title}>
              {mounted.includes('search') && (
                <div
                  style={{
                    display: activePage === 'search' ? 'block' : 'none'
                  }}
                >
                  <SearchPage logGroupName={tab.logs} region={tab.region} />
                </div>
              )}

              {mounted.includes('logs') && (
                <div
                  style={{
                    display: activePage === 'logs' ? 'block' : 'none'
                  }}
                >
                  <TabWrapper
                    tab={tab}
                    isActive={activePage === 'logs' && activeTab === tab.title}
                    autoRefreshInterval={refreshVal}
                    onAutoRefreshChange={autoRefreshInterval => {
                      document.vscodeData.autoRefreshInterval = autoRefreshInterval
                      setRefreshVal(autoRefreshInterval)
                    }}
                  />
                </div>
              )}
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
