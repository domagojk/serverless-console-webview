import React from 'react'
import { Select } from 'antd'
const { Option } = Select

export function RegionSelect(props: { region: string; setRegion: any }) {
  return (
    <Select
      showSearch
      defaultValue={props.region}
      style={{ width: '100%' }}
      onChange={props.setRegion}
      optionFilterProp="children"
      filterOption={(input, option) => {
        const children: any = option.props.children
        return children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }}
    >
      <Option value="us-east-2">us-east-2 (US East, Ohio)</Option>
      <Option value="us-east-1">us-east-1 (US East, N. Virginia)</Option>
      <Option value="us-west-1">us-west-1 (US West, N. California)</Option>
      <Option value="us-west-2">us-west-2 (US West, Oregon)</Option>
      <Option value="ap-east-1">ap-east-1 (Asia Pacific, Hong Kong)</Option>
      <Option value="ap-south-1">ap-south-1 (Asia Pacific, Mumbai)</Option>
      <Option value="ap-northeast-3">
        ap-northeast-3 (Asia Pacific, Osaka-Local)
      </Option>
      <Option value="ap-northeast-2">
        ap-northeast-2 (Asia Pacific, Seoul)
      </Option>
      <Option value="ap-southeast-1">
        ap-southeast-1 (Asia Pacific, Singapore)
      </Option>
      <Option value="ap-southeast-2">
        ap-southeast-2 (Asia Pacific, Sydney)
      </Option>
      <Option value="ap-northeast-1">
        ap-northeast-1 (Asia Pacific, Tokyo)
      </Option>
      <Option value="ca-central-1">ca-central-1 (Canada, Central)</Option>
      <Option value="cn-north-1">cn-north-1 (China, Beijing)</Option>
      <Option value="cn-northwest-1">cn-northwest-1 (China, Ningxia)</Option>
      <Option value="eu-central-1">eu-central-1 (EU, Frankfurt)</Option>
      <Option value="eu-west-1">eu-west-1 (EU, Ireland)</Option>
      <Option value="eu-west-2">eu-west-2 (EU, London)</Option>
      <Option value="eu-west-3">eu-west-3 (EU, Paris)</Option>
      <Option value="eu-north-1">eu-north-1 (EU, Stockholm)</Option>
      <Option value="me-south-1">me-south-1 (Middle East, Bahrain)</Option>
      <Option value="sa-east-1">sa-east-1 (South America, Sao Paulo)</Option>
      <Option value="us-gov-east-1">
        us-gov-east-1 (AWS GovCloud, US-East)
      </Option>
      <Option value="us-gov-west-1">
        us-gov-west-1 (AWS GovCloud, US-West)
      </Option>
    </Select>
  )
}
