import './logsPage.css'
import React, { useState } from 'react'
import { Tabs } from 'antd'
import { TabWrapper } from './TabWrapper'

const { TabPane } = Tabs

export function LogsPage() {
  const [active, setActive] = useState(document.vscodeData.tabs[0].title)
  const [refreshVal, setRefreshVal] = useState(
    document.vscodeData.autoRefreshInterval
  )

  return (
    <Tabs
      animated={false}
      onChange={key => {
        setActive(key)
      }}
    >
      {document.vscodeData.tabs.map((tab: any) => (
        <TabPane tab={tab.title} key={tab.title}>
          <TabWrapper
            tab={tab}
            isActive={active === tab.title}
            autoRefreshInterval={refreshVal}
            onAutoRefreshChange={autoRefreshInterval => {
              document.vscodeData.autoRefreshInterval = autoRefreshInterval
              setRefreshVal(autoRefreshInterval)
            }}
          />
        </TabPane>
      ))}
    </Tabs>
  )
}
