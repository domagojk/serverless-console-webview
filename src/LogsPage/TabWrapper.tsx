import React from 'react'
import { LogStreamList } from './LogStreamList'
import { Overview } from './Overview'
import { RelativeTime } from './RelativeTime'
import { getLogStreams, LogStreamData, getLambdaOverview } from './asyncData'

export class TabWrapper extends React.Component<{ tab: any }> {
  state = {
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

  async componentDidMount() {
    const { logStreams, nextToken, error } = await getLogStreams(
      this.props.tab.logs
    )

    let overviewProps = {}
    if (this.props.tab.lambda) {
      const res = await getLambdaOverview(this.props.tab.lambda)
      overviewProps = res.overviewProps
    }

    this.setState({
      error,
      loaded: true,
      logStreams,
      overviewProps,
      nextToken
    })
  }

  async onRefresh() {
    this.setState({
      refreshInProgres: true
    })

    const { logStreams, error } = await getLogStreams(this.props.tab.logs)

    const oldStreams = this.state.logStreams.filter(
      logStream => !logStreams.find(l => l.arn === logStream.arn)
    )

    let overviewProps = {}
    if (this.props.tab.lambda) {
      const res = await getLambdaOverview(this.props.tab.lambda)
      overviewProps = res.overviewProps
    }

    this.setState({
      error,
      logStreams: [...oldStreams, ...logStreams],
      refreshInProgres: false,
      overviewProps,
      lastRefreshed: Date.now()
    })
  }

  async onLoadMore() {
    this.setState({
      loadMoreInProgress: true
    })

    const { logStreams, nextToken, error } = await getLogStreams(
      this.props.tab.logs,
      this.state.nextToken
    )

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
        {this.state.refreshInProgres ? (
          <div className="refresh-option">loading...</div>
        ) : (
          <div className="refresh-option">
            <span className="spanlink" onClick={this.onRefresh.bind(this)}>
              Refresh
            </span>
            <div className="last-refreshed">
              last updated <RelativeTime time={this.state.lastRefreshed} />
            </div>
          </div>
        )}
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
        />
      </div>
    )
  }
}
