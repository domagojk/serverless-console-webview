import React from 'react'
import './tabWrapper.css'
import { LogStreamList } from './LogStreamList'
import { Overview } from './Overview'
import { RelativeTime } from './RelativeTime'
import {
  getLogStreams,
  LogStreamData,
  getLambdaOverview,
  setAutoRefresh
} from '../asyncData'

export class TabWrapper extends React.Component<{
  tab: any
  autoRefreshInterval: number
  onAutoRefreshChange: (interval: number) => any
  isActive: boolean
}> {
  state = {
    refreshClickedInProgres: false,
    refreshInProgres: false,
    loadMoreInProgress: false,
    loaded: false,
    error: '',
    currentToken: '',
    nextToken: '',
    logStreams: [] as LogStreamData[],
    lastRefreshed: Date.now(),
    overviewProps: {
      lastModified: null,
      memorySize: null,
      runtime: null,
      timeout: null,
      codeSize: null
    }
  }
  _intervalRef: NodeJS.Timeout

  async componentDidMount() {
    const { logStreams, nextToken, error } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      region: this.props.tab.region
    })

    let overviewProps = {}
    if (this.props.tab.lambda) {
      const res = await getLambdaOverview({
        fnName: this.props.tab.lambda,
        region: this.props.tab.region
      })
      overviewProps = res.overviewProps
    }

    this.setState({
      error,
      loaded: true,
      logStreams,
      overviewProps,
      nextToken
    })

    this.initInterval()
  }

  initInterval() {
    clearInterval(this._intervalRef)
    if (this.props.autoRefreshInterval > 500) {
      this._intervalRef = setInterval(() => {
        if (this.props.isActive) {
          this.onAutoRefresh()
        }
      }, this.props.autoRefreshInterval)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.autoRefreshInterval !== this.props.autoRefreshInterval) {
      this.initInterval()
    }
  }

  async onAutoRefresh() {
    this.setState({
      refreshInProgres: true
    })

    const { logStreams, error, timestamp } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      limit: 10,
      region: this.props.tab.region
    })

    const oldStreams = this.state.logStreams.filter(
      logStream => !logStreams.find(l => l.arn === logStream.arn)
    )

    this.setState({
      error,
      logStreams: [...oldStreams, ...logStreams],
      refreshInProgres: false,
      refreshClickedInProgres: false,
      lastRefreshed: timestamp
    })
  }

  async onRefresh(limit = 50) {
    this.setState({
      refreshInProgres: true
    })

    const { logStreams, error, timestamp } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      limit,
      region: this.props.tab.region
    })

    const oldStreams = this.state.logStreams.filter(
      logStream => !logStreams.find(l => l.arn === logStream.arn)
    )

    let overviewProps = {}
    if (this.props.tab.lambda) {
      const res = await getLambdaOverview({
        fnName: this.props.tab.lambda,
        region: this.props.tab.region
      })
      overviewProps = res.overviewProps
    }

    this.setState({
      error,
      logStreams: [...oldStreams, ...logStreams],
      refreshInProgres: false,
      refreshClickedInProgres: false,
      overviewProps,
      lastRefreshed: timestamp
    })
  }

  async onLoadMore() {
    this.setState({
      loadMoreInProgress: true
    })

    const { logStreams, nextToken, error } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      region: this.props.tab.region,
      nextToken: this.state.nextToken
    })

    const oldStreams = this.state.logStreams.filter(
      logStream => !logStreams.find(l => l.arn === logStream.arn)
    )

    this.setState({
      error,
      loadMoreInProgress: false,
      logStreams: [...oldStreams, ...logStreams],
      nextToken
    })
  }

  render() {
    return (
      <div>
        <div className="refresh-option">
          <span className="autorefresh">
            Auto Refresh:{' '}
            <span
              className="toggle"
              onClick={() => {
                const isEnabled = this.props.autoRefreshInterval > 500
                setAutoRefresh(!isEnabled).then(autoRefreshInterval => {
                  this.props.onAutoRefreshChange(autoRefreshInterval)
                })
              }}
            >
              {this.props.autoRefreshInterval > 500 ? 'ON' : 'OFF'}
            </span>
          </span>
          <span
            className="spanlink"
            onClick={() => {
              if (!this.state.refreshInProgres) {
                this.setState({
                  refreshClickedInProgres: true
                })
                this.onRefresh()
              }
            }}
          >
            {this.state.refreshClickedInProgres ? 'Loading...' : 'Refresh'}
          </span>
          <div className="last-refreshed">
            last refresh:{' '}
            <RelativeTime
              time={this.state.lastRefreshed}
              interval={this.props.autoRefreshInterval > 500 ? 1000 : null}
            />
          </div>
        </div>
        {this.props.tab.lambda && (
          <Overview
            {...{ ...this.state.overviewProps, name: this.props.tab.lambda }}
          />
        )}
        <LogStreamList
          tab={this.props.tab}
          loaded={this.state.loaded}
          error={this.state.error}
          logStreams={this.state.logStreams}
          nextToken={this.state.nextToken}
          loadMoreInProgress={this.state.loadMoreInProgress}
          onLoadMore={this.onLoadMore.bind(this)}
          autoRefreshInterval={this.props.autoRefreshInterval}
        />
      </div>
    )
  }
}
