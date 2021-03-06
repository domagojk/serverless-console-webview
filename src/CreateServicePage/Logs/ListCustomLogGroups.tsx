import React, { useState, useEffect } from 'react'
import { describeLogGroups } from '../../asyncData/asyncData'
import { Select, Checkbox, Input } from 'antd'
import { RegionSelect } from '../RegionSelect'
const { Option } = Select

export function ListCustomLogGroups(props: {
  awsProfile: string
  stage: string
  defaultRegion: string
  defaultLogGroup: string
  title?: string
  showTitle: boolean
  onChange: (props: {
    logGroupName: string
    stage: string
    region: string
    useLogGroupName?: boolean
    customTitle?: string
  }) => any
}) {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const [logGroups, setLogGroups] = useState([])
  const [region, setRegion] = useState(props.defaultRegion)
  const [activeLogGroup, setActiveLogGroup] = useState(props.defaultLogGroup)
  const [useLogGroupName, setUseLogGroupName] = useState(!Boolean(props.title))
  const [customTitle, setCustomTitle] = useState(props.title)
  const [dropDownInput, setDropDownInput] = useState(true)

  const { awsProfile } = props

  let textInput: any = React.createRef()

  useEffect(() => {
    setLoading(true)
    describeLogGroups({
      region,
      awsProfile,
    }).then(({ logGroups, error }) => {
      setLoading(false)
      setError(error)
      setLogGroups(logGroups)
      setActiveLogGroup(logGroups[0])
    })
  }, [region, awsProfile])

  useEffect(() => {
    props.onChange({
      logGroupName: activeLogGroup,
      stage: props.stage,
      region: region,
      useLogGroupName: useLogGroupName,
      customTitle: customTitle,
    })
  }, [activeLogGroup, useLogGroupName, customTitle])

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
        <td style={{ minWidth: 100 }}>Log Group</td>
        <td>
          {loading ? (
            <div>loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : logGroups.length === 0 ? (
            <div>No stacks found</div>
          ) : dropDownInput ? (
            <div>
              <Select
                showSearch
                style={{ width: 250 }}
                value={activeLogGroup}
                onChange={setActiveLogGroup}
                placeholder="Select a CloudFormation Stack"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const children: any = option.props.children
                  return (
                    children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  )
                }}
              >
                {logGroups.map((logGroup) => (
                  <Option key={logGroup} value={logGroup}>
                    {logGroup}
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
                value={activeLogGroup}
                onChange={(e) => setActiveLogGroup(e.target.value)}
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
      <tr>
        <td className="td-left">Title</td>
        {props.showTitle ? (
          <td>
            <Checkbox
              className="config-title"
              style={{ width: 150, opacity: useLogGroupName ? 1 : 0.5 }}
              checked={useLogGroupName}
              onChange={(e) => {
                setUseLogGroupName(e.target.checked)
                textInput.current.focus()
              }}
            >
              Use Log Group name
            </Checkbox>

            <Input
              style={{ width: 100, opacity: useLogGroupName ? 0 : 1 }}
              ref={textInput}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </td>
        ) : (
          <td>will be the same as in first stage</td>
        )}
      </tr>
    </table>
  )
}
