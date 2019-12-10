import React from 'react'
import moment from 'moment'

export class RelativeTime extends React.Component<{
  time: number
  interval?: number
  className?: string
}> {
  state = {
    ping: 0,
    message: ''
  }
  _intervalRef: NodeJS.Timeout

  initInterval() {
    const period =
      this.props.interval && this.props.interval > 500
        ? this.props.interval
        : 10000

    this._intervalRef = setInterval(() => {
      if (period <= 5000) {
        const secondsAgo = Math.round((Date.now() - this.props.time) / 1000)
        this.setState({
          ping: Date.now(),
          message: secondsAgo < 10 && `${secondsAgo} seconds ago`
        })
      } else {
        this.setState({
          ping: Date.now()
        })
      }
    }, period)
  }

  componentDidMount() {
    this.initInterval()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.interval !== this.props.interval) {
      this.initInterval()
    }
  }

  componentWillUnmount() {
    clearInterval(this._intervalRef)
  }

  render() {
    return (
      <span className={this.props.className}>
        {this.state.message || moment(this.props.time).fromNow()}
      </span>
    )
  }
}
