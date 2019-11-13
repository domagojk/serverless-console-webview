import React from 'react'
import './overview.css'
import { Descriptions } from 'antd'
import { RelativeTime } from './RelativeTime'

const Item = Descriptions.Item

export function Overview(
  props: {
    name?: any
    lastModified?: any
    memorySize?: any
    runtime?: any
    timeout?: any
    codeSize?: any
  } = {}
) {
  return (
    <div className="overview-section">
      <h2>Overview</h2>
      <Descriptions size="small" className="overview-content">
        <Item label="Name">
          <OverviewValue value={props.name} type="string" />
        </Item>
        <Item label="Last Modified">
          <OverviewValue value={props.lastModified} type="relativeTime" />
        </Item>

        <Item label="Runtime">
          <OverviewValue value={props.runtime} type="string" />
        </Item>
        <Item label="Timeout">
          <OverviewValue value={props.timeout} type="seconds" />
        </Item>
        <Item label="Memory Size">
          <OverviewValue value={props.memorySize} type="megabytes" />
        </Item>
        <Item label="Code Size">
          <OverviewValue value={props.codeSize} type="bytes" />
        </Item>
      </Descriptions>
    </div>
  )
}

function OverviewValue({
  value,
  type
}: {
  value: any
  type: 'string' | 'bytes' | 'relativeTime' | 'seconds' | 'megabytes'
}) {
  if (!value) {
    return <span>...</span>
  }

  switch (type) {
    case 'string':
      return <span>{value}</span>
    case 'bytes':
      return <span>{formatBytes(parseInt(value))}</span>
    case 'relativeTime':
      return <RelativeTime time={value} />
    case 'seconds':
      return <span>{value} seconds</span>
    case 'megabytes':
      return <span>{value} MB</span>
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
