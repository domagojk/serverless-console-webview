import React from 'react'
import { Tag, Input, Icon } from 'antd'

type Props = {
  stages: string[]
  onStagesChange: (stages: string[]) => void
}

export class Stages extends React.Component<Props> {
  state = {
    inputVisible: false,
    inputValue: ''
  }

  handleClose = removedTag => {
    const stages = this.props.stages.filter(tag => tag !== removedTag)
    this.props.onStagesChange(stages)
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus())
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value })
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state
    let { stages } = this.props
    if (inputValue && stages.indexOf(inputValue) === -1) {
      stages = [...stages, inputValue]
    }

    this.props.onStagesChange(stages)
    this.setState({
      inputVisible: false,
      inputValue: ''
    })
  }

  saveInputRef = input => (this.input = input)
  input: any

  render() {
    const { inputVisible, inputValue } = this.state
    return (
      <div>
        {this.props.stages.map(stage => {
          return (
            <Tag
              key={stage}
              closable={true}
              onClose={() => this.handleClose(stage)}
            >
              {stage}
            </Tag>
          )
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} style={{ borderStyle: 'dashed' }}>
            <Icon type="plus" /> Add stage
          </Tag>
        )}
      </div>
    )
  }
}
