import React, { useState, useEffect } from 'react'
import { listCloudFormationStacks } from '../../asyncData/asyncData'
import { Select, Input } from 'antd'
import { RegionSelect } from '../RegionSelect'
const { Option } = Select

export function ListCloudFormationStacks(props: {
  awsProfile: string
  stage: string
  defaultRegion: string
  defaultStackName: string
  onChange: (stackName: string, stage: string, region: string) => any
}) {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const [stacks, setStacks] = useState([])
  const [region, setRegion] = useState(props.defaultRegion)
  const [activeStackName, setActiveStackName] = useState(props.defaultStackName)
  const [dropDownInput, setDropDownInput] = useState(true)

  const { awsProfile } = props

  useEffect(() => {
    setLoading(true)
    listCloudFormationStacks({
      region,
      awsProfile,
    }).then(({ stacks, error }) => {
      setLoading(false)
      setError(error)
      setStacks(stacks)
      setActiveStackName(stacks[0])
    })
  }, [region, awsProfile])

  useEffect(() => {
    props.onChange(activeStackName, props.stage, region)
  }, [activeStackName])

  return (
    <table>
      <tr>
        <td style={{ width: 100 }}>Region</td>
        <td>
          <RegionSelect
            region={region}
            setRegion={setRegion}
            style={{ width: 250 }}
          />
        </td>
      </tr>
      <tr>
        <td style={{ minWidth: 100 }}>Stack name</td>
        <td>
          {loading ? (
            <div>loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : stacks.length === 0 ? (
            <div>No stacks found</div>
          ) : dropDownInput ? (
            <div>
              <Select
                showSearch
                style={{ width: 250 }}
                value={activeStackName}
                onChange={setActiveStackName}
                placeholder="Select a CloudFormation Stack"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const children: any = option.props.children
                  return (
                    children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  )
                }}
              >
                {stacks.map((stackName) => (
                  <Option key={stackName} value={stackName}>
                    {stackName}
                  </Option>
                ))}
              </Select>
              <div
                style={{
                  padding: 2,
                  opacity: 0.5,
                  textAlign: 'right',
                  cursor: 'pointer',
                  fontSize: '0.6rem',
                }}
                onClick={() => setDropDownInput(false)}
              >
                switch to manual input
              </div>
            </div>
          ) : (
            <div>
              <Input
                style={{ width: 250 }}
                value={activeStackName}
                onChange={(e) => setActiveStackName(e.target.value)}
              />
              <div
                style={{
                  padding: 2,
                  opacity: 0.5,
                  textAlign: 'right',
                  cursor: 'pointer',
                  fontSize: '0.6rem',
                }}
                onClick={() => setDropDownInput(true)}
              >
                switch to dropdown input
              </div>
            </div>
          )}
        </td>
      </tr>
    </table>
  )
}
/*
export class ListCloudFormationStacks extends React.Component<{
  region: string
  awsProfile: string
  defaultValue?: string
  onChange: (stage: string) => any
}> {
  state = {
    error: null,
    loading: true,
    stacks: []
  }

  async componentDidMount() {
    const { stacks, error } = await listCloudFormationStacks({
      region: this.props.region,
      awsProfile: this.props.awsProfile
    })
    this.setState({
      loading: false,
      error,
      stacks
    })
  }

  render() {
    return this.state.loading ? (
      <div>loading...</div>
    ) : this.state.error ? (
      <div>{this.state.error}</div>
    ) : this.state.stacks.length === 0 ? (
      <div>No stacks found</div>
    ) : (
      <Select
        showSearch
        style={{ width: '100%' }}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}
        placeholder="Select a CloudFormation Stack"
        optionFilterProp="children"
        filterOption={(input, option) => {
          const children: any = option.props.children
          return children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }}
      >
        {this.state.stacks.map(stackName => (
          <Option key={stackName} value={stackName}>
            {stackName}
          </Option>
        ))}
      </Select>
    )
  }
}

*/
