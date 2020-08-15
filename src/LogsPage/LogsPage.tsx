import './logsPage.css'
import React, { useState } from 'react'
import { Tabs, Icon, Tooltip } from 'antd'
import { TabWrapper } from './TabWrapper'
import { SearchPage } from './SearchPage'
import { viewstateChanged } from '../asyncData/asyncData'
import { CoffeeIcon } from '../AddServicePage/CoffeeIcon'

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
                      document.vscodeData.autoRefreshInterval = autoRefreshInterval
                      setRefreshVal(autoRefreshInterval)
                    }}
                  />
                </div>
              )}
            </TabPane>
          ))}
          <div style={{ position: 'absolute', top: 12, right: 0 }}>
            <Tooltip title="Buy me a coffee?" placement="bottomLeft">
              <a href="https://www.buymeacoffee.com/y39DWQf">
                <Icon style={{ width: 19 }} component={CoffeeIcon} />
              </a>
            </Tooltip>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
