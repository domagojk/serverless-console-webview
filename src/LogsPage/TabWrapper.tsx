import React from 'react'
import './tabWrapper.css'
import { LogStreamList } from './LogStreamList'
import { showLogsOptions } from '../asyncData/asyncData'
import { Input, Icon } from 'antd'
// import { LogStream } from './LogStream'

export class TabWrapper extends React.Component<{
  tab: any
  autoRefreshInterval: number
  onAutoRefreshChange: (interval: number) => any
  isActive: boolean
}> {
  state = {
    refreshClickedInProgres: false,
    refreshInProgres: false,
    oldRefreshTimestamp: Date.now(),
    newRefreshTimestamp: Date.now(),
    search: '',
    groupPerRequest: document.vscodeData?.settings?.groupPerRequest,
  }
  _timeout: NodeJS.Timeout

  onRefreshed() {
    this.setState({
      refreshClickedInProgres: false,
      oldRefreshTimestamp: Date.now(),
    })

    clearTimeout(this._timeout)
    this._timeout = setTimeout(() => {
      this.onAutoRefresh()
    }, this.props.autoRefreshInterval)
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.autoRefreshInterval !== this.props.autoRefreshInterval ||
      prevProps.isActive !== this.props.isActive
    ) {
      this.onAutoRefresh()
    }
  }

  onAutoRefresh() {
    if (this.props.autoRefreshInterval > 500 && this.props.isActive) {
      this.setState({
        newRefreshTimestamp: Date.now(),
        refreshClickedInProgres: true,
      })
    }
  }

  onManualRefresh() {
    this.setState({
      newRefreshTimestamp: Date.now(),
      refreshClickedInProgres: true,
    })
  }

  render() {
    return (
      <div>
        <div className="top-right-options">
          <div className="logstream-options">
            <Input.Search
              onChange={(e) => {
                this.setState({
                  search: e.target.value,
                })
              }}
              value={this.state.search}
              placeholder="search"
              allowClear={true}
              size="small"
            />
          </div>

          <Icon
            className="option"
            type={this.state.refreshClickedInProgres ? 'loading' : 'sync'}
            onClick={() => {
              if (!this.state.refreshInProgres) {
                this.onManualRefresh()
              }
            }}
          />
          <Icon
            className="option"
            type="setting"
            onClick={async () => {
              const result = await showLogsOptions()
              this.setState({
                groupPerRequest: result.groupPerRequest,
              })

              this.props.onAutoRefreshChange(result.autoRefreshInterval)
            }}
          />
        </div>

        <LogStreamList
          tab={this.props.tab}
          search={this.state.search}
          groupPerRequest={this.state.groupPerRequest}
          onRefreshed={() => {
            this.onRefreshed()
          }}
          refreshTimestamp={this.state.newRefreshTimestamp}
          isActive={this.props.isActive}
        />
      </div>
    )
  }
}
