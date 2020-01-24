import './dynamoDb.css'
import React from 'react'
import { Tabs, Icon, Badge, Button } from 'antd'
import { Items } from './Items'

const { TabPane } = Tabs

export class DynamoDb extends React.Component {
  state = {
    execLogShown: true
  }

  render() {
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
                <Items />
              </TabPane>
            ))}
          </Tabs>
        </div>

        <div
          className="log-table-wrapper"
          style={{ left: this.state.execLogShown ? 15 : 'auto' }}
        >
          {this.state.execLogShown && (
            <div className="table-wrapper">
              <table className="log-table">
                <tr>
                  <td>1 minute ago</td>
                  <td>
                    <span className="operation add">ADD</span>
                  </td>
                  <td>primary key</td>
                  <td className="icons">
                    <Icon type="delete" />
                    <Icon type="code" />
                  </td>
                </tr>

                <tr>
                  <td>2 minutes ago</td>
                  <td>
                    <span className="operation edit">EDIT</span>
                  </td>
                  <td>primary key</td>

                  <td className="icons">
                    <Icon type="delete" />
                    <Icon type="code" />
                  </td>
                </tr>

                <tr>
                  <td>3 minutes ago</td>
                  <td>
                    <span className="operation delete">DELETE</span>
                  </td>
                  <td>primary key</td>

                  <td className="icons">
                    <Icon type="delete" />
                    <Icon type="code" />
                  </td>
                </tr>
              </table>
            </div>
          )}

          <div className="exec-footer">
            <Badge
              count={5}
              title="Staged changes"
              style={{
                boxShadow: 'none',
                backgroundColor: 'rgb(0, 122, 204)'
              }}
            >
              <Icon
                onClick={() => {
                  this.setState({
                    execLogShown: !this.state.execLogShown
                  })
                }}
                type="ordered-list"
                style={{
                  fontSize: 20,
                  opacity: this.state.execLogShown ? 1 : 0.6
                }}
              />
            </Badge>

            <Button type="primary" size="small">
              Run
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
