import React from 'react'
import { Tabs, Input } from 'antd'
import { ListCloudFormationStacks } from './ListCloudFormationStacks'
import { ListCustomLogGroups } from './ListCustomLogGroups'

const { TabPane } = Tabs
type Panes = {
  stage: string
  stackName?: string
  logGroupName?: string
  region?: string
  useLogGroupName?: boolean
  customTitle?: string
}[]

export class StagesTabs extends React.Component<{
  source: string
  awsProfile: string
  defaultStages: Panes
  defaultRegion: string
  onChange: (stacks: Panes) => any
}> {
  newTabIndex: number
  state: {
    activeKey: string
    newStageVal: string
    panes: Panes
  }

  constructor(props) {
    super(props)
    this.newTabIndex = 0
    this.state = {
      newStageVal: '',
      activeKey: props.defaultStages[0].stage,
      panes: props.defaultStages
    }
  }

  onChange = activeKey => {
    this.setState({ activeKey })
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey)
  }

  add = () => {
    if (
      !this.state.newStageVal ||
      this.state.panes.find(p => p.stage === this.state.newStageVal)
    ) {
      return false
    }
    const { panes } = this.state
    const activeKey = this.state.newStageVal

    panes.push({
      stage: this.state.newStageVal
    })
    this.setState({ panes, activeKey, newStageVal: '' })
  }

  remove = targetKey => {
    let { activeKey } = this.state
    let lastIndex
    this.state.panes.forEach((pane, i) => {
      if (pane.stage === targetKey) {
        lastIndex = i - 1
      }
    })
    const panes = this.state.panes.filter(pane => pane.stage !== targetKey)
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].stage
      } else {
        activeKey = panes[0].stage
      }
    }
    this.setState({ panes, activeKey })
    this.props.onChange(panes)
  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '70%', maxWidth: 450 }}>
          <Tabs
            hideAdd
            onChange={this.onChange}
            activeKey={this.state.activeKey}
            size="small"
            type="editable-card"
            animated
            onEdit={this.onEdit}
          >
            {this.state.panes.map((pane, index) => (
              <TabPane tab={pane.stage} key={pane.stage}>
                {this.props.source === 'cloudformation' && (
                  <ListCloudFormationStacks
                    awsProfile={this.props.awsProfile}
                    defaultRegion={pane.region || this.props.defaultRegion}
                    defaultStackName={pane.stage}
                    stage={this.state.activeKey}
                    onChange={(stackName, stage, region) => {
                      const newPanes = this.state.panes.map(pane => {
                        if (pane.stage === stage) {
                          return {
                            ...pane,
                            region,
                            stackName
                          }
                        } else {
                          return pane
                        }
                      })
                      this.setState({
                        panes: newPanes
                      })
                      this.props.onChange(newPanes)
                    }}
                  />
                )}
                {this.props.source === 'custom' && (
                  <ListCustomLogGroups
                    awsProfile={this.props.awsProfile}
                    defaultRegion={pane.region || this.props.defaultRegion}
                    defaultLogGroup={pane.stage}
                    stage={this.state.activeKey}
                    showTitle={index === 0}
                    onChange={({
                      logGroupName,
                      stage,
                      region,
                      useLogGroupName,
                      customTitle
                    }) => {
                      const newPanes = this.state.panes.map(pane => {
                        if (pane.stage === stage) {
                          return {
                            ...pane,
                            region,
                            logGroupName,
                            useLogGroupName,
                            customTitle
                          }
                        } else {
                          return pane
                        }
                      })
                      this.setState({
                        panes: newPanes
                      })
                      this.props.onChange(newPanes)
                    }}
                  />
                )}
              </TabPane>
            ))}
          </Tabs>
        </div>
        <div style={{ width: '30%', marginTop: 8 }}>
          <Input
            style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
            value={this.state.newStageVal}
            onChange={e => this.setState({ newStageVal: e.target.value })}
            placeholder="add new stage"
            onPressEnter={this.add}
          />
        </div>
      </div>
    )
  }
}
