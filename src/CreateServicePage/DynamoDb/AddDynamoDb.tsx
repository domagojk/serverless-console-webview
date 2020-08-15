import React from 'react'
import { Button, Select, Input } from 'antd'
import './addDynamoDb.css'
import { addService } from '../../asyncData/asyncData'
import { RegionSelect } from '../RegionSelect'
import { listDynamoDbTables } from '../../asyncData/dynamoDb'

type Props = {
  awsProfile: string
  region: string
}
type State = {
  connection: string
  endpoint: string
  awsProfile: string
  region: string
  startedTrial: boolean
  tableNames: string[]
  table: string
  loading: boolean
  error?: string
  resultMessage?: string
}

export class AddDynamoDb extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      connection: 'remote',
      endpoint: 'http://localhost:8000',
      loading: false,
      error: null,
      table: null,
      region: props.region,
      awsProfile: props.awsProfile,
      tableNames: [],
      startedTrial: false,
    }
  }

  async fetchTableNames() {
    // loading, error
    this.setState({
      error: null,
      loading: true,
    })
    const res = await listDynamoDbTables({
      region: this.state.connection === 'local' ? 'local' : this.state.region,
      awsProfile: this.state.awsProfile,
      endpoint: this.state.endpoint
    })

    this.setState({
      table: res.tableNames[0],
      error: res.error,
      loading: false,
      tableNames: res.tableNames,
    })
  }

  componentDidMount() {
    this.fetchTableNames()
  }

  async componentDidUpdate(prevProps, prevState: State) {
    if (
      prevState.awsProfile !== this.state.awsProfile ||
      prevState.region !== this.state.region ||
      prevState.table !== this.state.table
    ) {
      this.setState({
        resultMessage: null,
      })
    }

    if (
      prevState.awsProfile !== this.state.awsProfile ||
      prevState.region !== this.state.region ||
      prevState.endpoint !== this.state.endpoint ||
      prevState.connection !== this.state.connection
    ) {
      this.fetchTableNames()
    }
  }

  render() {
    return (
      <div>
        <table className="form-table">
          <tr>
            <td className="td-left">Connection</td>
            <td>
              <Select
                showSearch={false}
                style={{ width: '100%' }}
                value={this.state.connection}
                onChange={(connection) => this.setState({ connection })}
              >
                <Select.Option key="remote" value="remote">
                  Remote
                </Select.Option>
                <Select.Option key="local" value="local">
                  Local
                </Select.Option>
              </Select>
            </td>
          </tr>
          {this.state.connection === 'local' && (
            <tr>
              <td className="td-left">Endpoint</td>
              <td>
                <Input
                  value={this.state.endpoint}
                  onChange={(e) => this.setState({ endpoint: e.target.value })}
                />
              </td>
            </tr>
          )}
          {this.state.connection === 'remote' && (
            <tr>
              <td className="td-left">AWS Profile</td>
              <td>
                {document.vscodeData.profiles &&
                document.vscodeData.profiles.length &&
                document.vscodeData.profiles.includes(this.props.awsProfile) ? (
                  <Select
                    value={this.state.awsProfile}
                    style={{ width: '100%' }}
                    onChange={(awsProfile) => this.setState({ awsProfile })}
                  >
                    {document.vscodeData.profiles.map((profile) => (
                      <Select.Option value={profile}>{profile}</Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={this.state.awsProfile}
                    onChange={(e) =>
                      this.setState({ awsProfile: e.target.value })
                    }
                  />
                )}
              </td>
            </tr>
          )}
          {this.state.connection === 'remote' && (
            <tr>
              <td className="td-left">Region</td>
              <td>
                <RegionSelect
                  region={this.state.region}
                  setRegion={(region) => this.setState({ region })}
                />
              </td>
            </tr>
          )}
          <tr>
            <td className="td-left">Table Name</td>
            <td>
              {this.state.loading ? (
                <div>loading...</div>
              ) : this.state.error ? (
                <div>{this.state.error}</div>
              ) : this.state.tableNames.length === 0 ? (
                <div>No table found</div>
              ) : (
                <Select
                  showSearch
                  placeholder="Select DynamoDB Table"
                  style={{ width: '100%' }}
                  value={this.state.table}
                  onChange={(table) => this.setState({ table })}
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const children: any = option.props.children
                    return (
                      children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    )
                  }}
                >
                  {this.state.tableNames.map((table) => (
                    <Select.Option key={table} value={table}>
                      {table}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </td>
          </tr>
        </table>
        <Button
          loading={false}
          className="submit-button"
          onClick={async () => {
            if (!this.state.table) {
              return this.setState({
                resultMessage: 'Table name is missing',
              })
            }
            if (!this.state.awsProfile) {
              return this.setState({
                resultMessage: 'AWS profile is missing',
              })
            }
            if (!this.state.region) {
              return this.setState({
                resultMessage: 'Region is missing',
              })
            }

            try {
              if (this.state.connection === 'remote') {
                await addService({
                  source: 'dynamodb',
                  tableName: this.state.table,
                  awsProfile: this.state.awsProfile,
                  region: this.state.region,
                })
              } else {
                await addService({
                  source: 'dynamodb',
                  tableName: this.state.table,
                  endpoint: this.state.endpoint,
                  region: 'local',
                })
              }
              this.setState({
                resultMessage: 'Service successfully added',
              })
            } catch (err) {
              this.setState({
                resultMessage: err.message,
              })
            }
          }}
        >
          Add Service
        </Button>

        {this.state.resultMessage && (
          <div style={{ padding: 10 }}>{this.state.resultMessage}</div>
        )}
      </div>
    )
  }
}
