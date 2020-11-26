import React from 'react'
import Mark from 'mark.js'
import './logEvent.css'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import copy from 'copy-to-clipboard'
import { Button } from 'antd'

SyntaxHighlighter.registerLanguage('json', json)

export class LogEvent extends React.Component<{
  message: string
  search: string
}> {
  state = {
    copyStr: 'copy JSON to clipboard',
    searched: false,
    loaded: false
  }
  myRef: any

  constructor(props) {
    super(props)
    this.myRef = React.createRef()
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loaded: true
      })
    }, 0)
  }

  componentDidUpdate() {
    if (this.props.search) {
      if (this.state.searched === false) {
        this.setState({
          searched: true
        })
      }
      var instance = new Mark(this.myRef.current)
      instance.unmark({
        done: () => {
          instance.mark(this.props.search, {
            acrossElements: true,
            separateWordSearch: false
          })
        }
      })
    } else if (this.state.searched) {
      const instance = new Mark(this.myRef.current)
      instance.unmark()
    }
  }

  renderWithJson(content: string) {
    const splitted = extractJSON(content)

    if (splitted) {
      return (
        <div className="logevent-longmessage">
          <div>{splitted[0]}</div>
          <div className="code-wrapper">
            <Button
              size="small"
              onClick={e => {
                e.currentTarget.blur()

                copy(splitted[1])
                this.setState({
                  copyStr: 'copied'
                })
                setTimeout(() => {
                  this.setState({
                    copyStr: 'copy JSON to clipboard'
                  })
                }, 1000)
              }}
            >
              {this.state.copyStr}
            </Button>

            <SyntaxHighlighter
              className="syntax-highlighter"
              useInlineStyles={false}
              language="json"
              showLineNumbers
            >
              {splitted[1]}
            </SyntaxHighlighter>
          </div>

          <div>{splitted[2]}</div>
        </div>
      )
    }
    return <div className="logevent-longmessage">{content}</div>
  }

  render() {
    return (
      <div ref={this.myRef}>
        {this.state.loaded ? (
          this.renderWithJson(this.props.message)
        ) : (
          <div>loading</div>
        )}
      </div>
    )
  }
}

function extractJSON(str: string) {
  const match = str.match(/{[\s\S]*}|\[[\s\S]*\]/)

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
