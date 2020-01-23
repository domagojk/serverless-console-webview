import './dynamoDb.css'
import React from 'react'
import { Tabs } from 'antd'

const { TabPane } = Tabs

export function DynamoDb() {
  return (
    <div className="dynamodb-page">
      <div className="main-wrapper">
        <Tabs animated={false}>
          {[
            {
              title: 'items'
            },
            {
              title: 'overview'
            }
          ].map((tab: any) => (
            <TabPane tab={tab.title} key={tab.title}>
              <div>aaa</div>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
