import 'antd/dist/antd.css'
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { LogStreamList } from './LogStreamList'
import { Tabs } from 'antd'

const { TabPane } = Tabs

declare global {
  interface Window {
    devData: any
  }
  interface Document {
    vscodeData: any
  }
}

ReactDOM.render(
  <Tabs animated={false}>
    {document.vscodeData.tabs.map((tab: any) => (
      <TabPane tab={tab.title} key={tab.title}>
        <LogStreamList tab={tab} />
      </TabPane>
    ))}
  </Tabs>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
