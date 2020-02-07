import './dynamoDb.css'
import React from 'react'
import { Icon, Collapse } from 'antd'
import { Items } from './Items'

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
        </div>
      </div>
    )
  }
}
