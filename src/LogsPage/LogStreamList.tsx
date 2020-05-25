import React from 'react'
import { LogStreamData, getLogStreams } from '../asyncData/asyncData'
import { Collapse } from 'antd'
import moment from 'moment'
import { LogStream } from './LogStream'
import { RelativeTime } from './RelativeTime'

const { Panel } = Collapse

type Props = {
  tab: any
  search: string
  groupPerRequest: boolean
  isActive: boolean
  onRefreshed: () => any
  refreshTimestamp: number
}

export class LogStreamList extends React.Component<Props> {
  _intervalRef: NodeJS.Timeout

  state = {
    loadMoreInProgress: false,
    loaded: false,
    error: '',
    currentToken: '',
    nextToken: '',
    logStreams: [] as LogStreamData[],
  }

  async componentDidMount() {
    const { logStreams, nextToken, error } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      region: this.props.tab.region,
      awsProfile: this.props.tab.awsProfile,
    })

    this.setState({
      error,
      loaded: true,
      logStreams,
      nextToken,
    })

    this.props.onRefreshed()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refreshTimestamp !== this.props.refreshTimestamp) {
      if (this.props.isActive) {
        this.onRefresh()
      }
    }
  }

  onRefresh = async () => {
    this.setState({
      refreshInProgres: true,
    })

    const { logStreams, error } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      limit: 50,
      region: this.props.tab.region,
      awsProfile: this.props.tab.awsProfile,
    })

    const oldStreams = this.state.logStreams.filter(
      (logStream) => !logStreams.find((l) => l.arn === logStream.arn)
    )

    this.setState({
      error,
      logStreams: [...oldStreams, ...logStreams],
      refreshInProgres: false,
    })
    this.props.onRefreshed()
  }

  onLoadMore = async () => {
    this.setState({
      loadMoreInProgress: true,
    })

    const { logStreams, nextToken, error } = await getLogStreams({
      logGroupName: this.props.tab.logs,
      region: this.props.tab.region,
      nextToken: this.state.nextToken,
      awsProfile: this.props.tab.awsProfile,
    })

    const oldStreams = this.state.logStreams.filter(
      (logStream) => !logStreams.find((l) => l.arn === logStream.arn)
    )

    this.setState({
      error,
      loadMoreInProgress: false,
      logStreams: [...oldStreams, ...logStreams],
      nextToken,
    })
  }

  render() {
    return (
      <div className="log-section">
        {this.state.loaded ? (
          <div>
            <Collapse className="logstreamslist">
              {this.state.error ? (
                <div className="foreground-color">{this.state.error}</div>
              ) : (
                this.state.logStreams
                  .sort((a, b) => b.sortByTimestamp - a.sortByTimestamp)
                  .map((logStream, index) => (
                    <Panel
                      header={
                        <div className="logstream">
                          <RelativeTime
                            className="relative-time"
                            time={logStream.sortByTimestamp}
                          />
                          <span className="abs-time">
                            {moment(logStream.sortByTimestamp).format('lll')}
                          </span>
                        </div>
                      }
                      key={logStream.arn}
                    >
                      <LogStream
                        logGroup={this.props.tab.logs}
                        region={this.props.tab.region}
                        awsProfile={this.props.tab.awsProfile}
                        logStream={logStream.logStreamName}
                        search={this.props.search}
                        groupPerRequest={this.props.groupPerRequest}
                      />
                    </Panel>
                  ))
              )}
            </Collapse>
            {this.state.nextToken && (
              <div className=" loadmore">
                {this.state.loadMoreInProgress ? (
                  <span>loading...</span>
                ) : (
                  <span className="spanlink" onClick={this.onLoadMore}>
                    Load more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>loading...</div>
        )}
      </div>
    )
  }
}
