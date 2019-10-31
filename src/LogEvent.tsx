import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  github,
  monokaiSublime
} from 'react-syntax-highlighter/dist/esm/styles/hljs'

export class LogEvent extends React.Component<{ message: string }> {
  state = {
    loaded: false
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loaded: true
      })
    }, 0)
  }

  renderWithJson(content: string) {
    const splitted = extractJSON(content)

    if (splitted) {
      return (
        <div className="logevent-longmessage">
          <div>{splitted[0]}</div>
          <SyntaxHighlighter
            className="syntax-highlighter"
            language="json"
            showLineNumbers
            lineNumberStyle={{ opacity: 0.4 }}
            style={
              document.body.className.includes('dark') ? monokaiSublime : github
            }
          >
            {splitted[1]}
          </SyntaxHighlighter>
          <div>{splitted[2]}</div>
        </div>
      )
    }
    return <div className="logevent-longmessage">{content}</div>
  }

  render() {
    return this.state.loaded ? (
      this.renderWithJson(this.props.message)
    ) : (
      <div>loading</div>
    )
  }
}

function extractJSON(str: string) {
  const match = str.match(/{[\s\S]*}/)

  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      const splitted = str.split(match[0])

      return [splitted[0], JSON.stringify(parsed, null, 2), splitted[1]]
    } catch (err) {
      return false
    }
  }

  return false
}
