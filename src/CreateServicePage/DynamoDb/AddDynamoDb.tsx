import React from 'react'
import { Button, Select, Input } from 'antd'
import './addDynamoDb.css'
import {
  startTrial,
  buyLicense,
  addService,
  enterLicense,
} from '../../asyncData/asyncData'
import { RegionSelect } from '../RegionSelect'
import { listDynamoDbTables } from '../../asyncData/dynamoDb'

type Props = {
  awsProfile: string
  region: string
}
type State = {
  awsProfile: string
  region: string
  startedTrial: boolean
  tableNames: string[]
  table: string
  loading: boolean
  error?: string
  license: {
    invalid: boolean
    inTrial: boolean
  }
  resultMessage?: string
}

export class AddDynamoDb extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      loading: false,
      error: null,
      table: null,
      region: props.region,
      awsProfile: props.awsProfile,
      tableNames: [],
      startedTrial: false,
      license: document.vscodeData?.license,
    }
  }

  onFreeTrialSelected = async () => {
    const res = await startTrial()
    document.vscodeData.license = res.license

    this.setState({
      startedTrial: true,
      license: document.vscodeData?.license,
    })
  }

  async fetchTableNames() {
    // loading, error
    this.setState({
      error: null,
      loading: true,
    })
    const res = await listDynamoDbTables({
      region: this.state.region,
      awsProfile: this.state.awsProfile,
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
      prevState.region !== this.state.region
    ) {
      this.fetchTableNames()
    }
  }

  render() {
    return (
      <div>
        {this.state.startedTrial && (
          <div style={{ padding: '20px 10px 10px 10px' }}>
            Serverless Console PRO trial period has started.
          </div>
        )}
        {this.state.license?.invalid ? (
          this.state.license.inTrial ? (
            <div className="pro-feature">
              <span>Your Serverless Console PRO trial period has expired</span>
              <Button onClick={() => buyLicense()}>Buy Now</Button>
              <Button className="secondary" onClick={() => enterLicense()}>
                Enter License Key
              </Button>
            </div>
          ) : (
            <div className="pro-feature">
              <span>Activating this feature requires a Pro license</span>
              <Button onClick={this.onFreeTrialSelected}>
                Start a Free Trial
              </Button>
              <Button className="secondary" onClick={() => buyLicense()}>
                Buy a License
              </Button>
            </div>
          )
        ) : (
          <div>
            <table className="form-table">
              <tr>
                <td className="td-left">AWS Profile</td>
                <td>
                  {document.vscodeData.profiles &&
                  document.vscodeData.profiles.length &&
                  document.vscodeData.profiles.includes(
                    this.props.awsProfile
                  ) ? (
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
              <tr>
                <td className="td-left">Region</td>
                <td>
                  <RegionSelect
                    region={this.state.region}
                    setRegion={(region) => this.setState({ region })}
                  />
                </td>
              </tr>
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
                          children.toLowerCase().indexOf(input.toLowerCase()) >=
                          0
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
                  await addService({
                    source: 'dynamodb',
                    tableName: this.state.table,
                    awsProfile: this.state.awsProfile,
                    region: this.state.region,
                  })
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
        )}
      </div>
    )
  }
}
