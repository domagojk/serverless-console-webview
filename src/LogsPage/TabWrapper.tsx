import React from 'react'
import hotkeys from 'hotkeys-js'
import './tabWrapper.css'
import { LogStreamList } from './LogStreamList'
import { showLogsOptions, getLambdaOverview } from '../asyncData/asyncData'
import { Input, Icon, Modal } from 'antd'
import { Overview } from './Overview'

export class TabWrapper extends React.Component<{
  tab: any
  autoRefreshInterval: number
  onAutoRefreshChange: (interval: number) => any
  isActive: boolean
}> {
  state = {
    refreshInProgress: false,
    overviewLoadInProgress: false,
    oldRefreshTimestamp: Date.now(),
    newRefreshTimestamp: Date.now(),
    search: '',
    groupPerRequest: document.vscodeData?.settings?.groupPerRequest,
  }
  _timeout: NodeJS.Timeout
  _inputRef: any

  componentDidMount() {
    const isMac = navigator?.platform?.toUpperCase()?.indexOf('MAC') >= 0
    const shortcut = isMac ? 'command+f' : 'ctrl+f'
    hotkeys(shortcut, () => {
      this._inputRef?.focus()
      return false
    })
  }

  onRefreshed() {
    this.setState({
      refreshInProgress: false,
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
        refreshInProgress: true,
      })
    }
  }

  onManualRefresh() {
    this.setState({
      newRefreshTimestamp: Date.now(),
      refreshInProgress: true,
    })
  }

  render() {
    return (
      <div>
        <div className="top-right-options">
          <div className="logstream-options">
            <Input.Search
              ref={(input) => {
                this._inputRef = input
              }}
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

          {this.props.tab.lambda && (
            <Icon
              className="option"
              type={
                this.state.overviewLoadInProgress ? 'loading' : 'info-circle'
              }
              onClick={async () => {
                this.setState({
                  overviewLoadInProgress: true,
                })
                const res = await getLambdaOverview({
                  fnName: this.props.tab.lambda,
                  region: this.props.tab.region,
                  awsProfile: this.props.tab.awsProfile,
                })
                const overviewProps = res.overviewProps

                Modal.info({
                  title: 'Function Overview',
                  content: (
                    <Overview
                      {...{
                        ...overviewProps,
                        name: this.props.tab.lambda,
                      }}
                    />
                  ),
                  onOk() {},
                })

                this.setState({
                  overviewLoadInProgress: false,
                })
              }}
            />
          )}

          <Icon
            className="option"
            type={this.state.refreshInProgress ? 'loading' : 'sync'}
            onClick={() => {
              if (!this.state.refreshInProgress) {
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
