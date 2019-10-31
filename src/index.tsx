import 'antd/dist/antd.css'
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { LogStreamList } from './LogStreamList'
import { Tabs } from 'antd'

const { TabPane } = Tabs

ReactDOM.render(
  <Tabs
    animated={false}
    tabBarExtraContent={
      <span
        className="spanlink"
        style={{ marginRight: 10 }}
        onClick={console.log}
      >
        Add stage
      </span>
    }
  >
    <TabPane tab="dev" key="dev">
      <LogStreamList />
    </TabPane>
    <TabPane tab="prod" key="prod">
      <LogStreamList />
    </TabPane>
  </Tabs>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
