import React, { useState, useEffect } from 'react'
import { describeLogGroups } from '../../asyncData'
import { Select, Checkbox, Input } from 'antd'
import { RegionSelect } from '../RegionSelect'
const { Option } = Select

export function ListCustomLogGroups(props: {
  awsProfile: string
  stage: string
  defaultRegion: string
  defaultLogGroup: string
  title?: string
  onChange: (props: {
    logGroupName: string
    stage: string
    region: string
    useCustomTitle?: boolean
    customTitle?: string
  }) => any
}) {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const [logGroups, setLogGroups] = useState([])
  const [region, setRegion] = useState(props.defaultRegion)
  const [activeLogGroup, setActiveLogGroup] = useState(props.defaultLogGroup)
  const [useCustomTitle, setUseCustomTitle] = useState(!Boolean(props.title))
  const [customTitle, setCustomTitle] = useState(props.title)

  let textInput: any = React.createRef()

  useEffect(() => {
    setLoading(true)
    describeLogGroups({
      region,
      awsProfile: props.awsProfile
    }).then(({ logGroups, error }) => {
      setLoading(false)
      setError(error)
      setLogGroups(logGroups)
      setActiveLogGroup(logGroups[0])
    })
  }, [region])

  useEffect(() => {
    props.onChange({
      logGroupName: activeLogGroup,
      stage: props.stage,
      region: region,
      useCustomTitle: useCustomTitle,
      customTitle: customTitle
    })
  }, [activeLogGroup, useCustomTitle, customTitle])

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
          ) : (
            <Select
              showSearch
              style={{ width: 250 }}
              value={activeLogGroup}
              onChange={setActiveLogGroup}
              placeholder="Select a CloudFormation Stack"
              optionFilterProp="children"
              filterOption={(input, option) => {
                const children: any = option.props.children
                return children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }}
            >
              {logGroups.map(logGroup => (
                <Option key={logGroup} value={logGroup}>
                  {logGroup}
                </Option>
              ))}
            </Select>
          )}
        </td>
      </tr>
      <tr>
        <td className="td-left">Title</td>
        <td>
          <Checkbox
            className="config-title"
            style={{ width: 140, opacity: useCustomTitle ? 1 : 0.5 }}
            checked={useCustomTitle}
            onChange={e => {
              setUseCustomTitle(e.target.checked)
              textInput.current.focus()
            }}
          >
            Use Log Group name
          </Checkbox>

          <Input
            style={{ width: 110, opacity: useCustomTitle ? 0 : 1 }}
            ref={textInput}
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
          />
        </td>
      </tr>
    </table>
  )
}
