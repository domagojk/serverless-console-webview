import './logsPage.css'
import React from 'react'
import { Tabs } from 'antd'
import { TabWrapper } from './TabWrapper'

const { TabPane } = Tabs

export function LogsPage() {
  return (
    <Tabs animated={false}>
      {document.vscodeData.tabs.map((tab: any) => (
        <TabPane tab={tab.title} key={tab.title}>
          <TabWrapper tab={tab} />
        </TabPane>
      ))}
    </Tabs>
  )
}
