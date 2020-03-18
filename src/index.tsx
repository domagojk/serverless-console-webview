import 'antd/dist/antd.css'
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { LogsPage } from './LogsPage/LogsPage'
import { CreateServicePage } from './CreateServicePage/CreateServicePage'
import { DynamoDb } from './DynamoDb/DynamoDb'

declare global {
  interface Window {
    devData: any
  }
  interface Document {
    vscodeData: any
  }
}

ReactDOM.render(
  document.vscodeData.page === 'createService' ? (
    <CreateServicePage />
  ) : document.vscodeData.page === 'dynamoDb' ? (
    <DynamoDb />
  ) : (
    <LogsPage />
  ),
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
