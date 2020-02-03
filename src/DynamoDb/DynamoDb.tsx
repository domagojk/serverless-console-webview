import './dynamoDb.css'
import React from 'react'
import { Tabs, Icon, Button } from 'antd'
import { Items } from './Items'

const { TabPane } = Tabs

export class DynamoDb extends React.Component {
  state = {
    execLogShown: false
  }

  render() {
    let classNames = ''
    if (this.state.execLogShown) {
      classNames += 'exec-log-shown '
    }

    return (
      <div className={`dynamodb-page ${classNames}`}>
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

        <div className="log-table-wrapper">
          {this.state.execLogShown && (
            <div className="table-wrapper">
              <table className="log-table">
                <tbody>
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
                </tbody>
              </table>
            </div>
          )}

          <div className="exec-footer">
            <span
              className="queue-message"
              onClick={() => {
                this.setState({
                  execLogShown: !this.state.execLogShown
                })
              }}
            >
              <b>4</b> commands in queue
            </span>

            <Button type="primary" size="small">
              Run
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
