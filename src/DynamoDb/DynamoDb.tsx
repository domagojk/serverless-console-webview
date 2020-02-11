import './dynamoDb.css'
import React from 'react'
import { Icon, Collapse } from 'antd'
import { Items } from './Items'

export class DynamoDb extends React.Component {
  render() {

    return (
      <div className="dynamodb-page">
        <div className="main-wrapper">
          <div className="query-form">
            <Collapse>
              <Collapse.Panel
                header={
                  <div>
                    <span
                      style={{
                        fontWeight: 'bold',
                        marginRight: 30
                      }}
                    >
                      scan
                    </span>
                    <span>trainingtube-eventstore</span>
                  </div>
                }
                key="1"
              >
                <p>asas</p>
              </Collapse.Panel>
            </Collapse>
          </div>
          <Items />
        </div>
      </div>
    )
  }
}
