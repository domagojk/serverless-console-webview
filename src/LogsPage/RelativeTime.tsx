import React from 'react'
import moment from 'moment'

export class RelativeTime extends React.Component<{
  time: number
  className?: string
}> {
  componentDidMount() {
    setInterval(
      () =>
        this.setState({
          interval: Date.now()
        }),
      10000
    )
  }
  render() {
    return (
      <span className={this.props.className}>
        {moment(this.props.time).fromNow()}
      </span>
    )
  }
}
