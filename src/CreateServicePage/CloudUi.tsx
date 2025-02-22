import React from 'react'

export class CloudUI extends React.Component {
  render() {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Standalone Desktop Alternative to the AWS Console</h2>
        <p>
          <strong>CloudUI</strong> is an <strong>advanced version</strong> of
          this extension.
        </p>
        <p>
          An alternative to the AWS Console with <strong>a powerful</strong>,{' '}
          <strong>user-friendly</strong> interface for the most used services:
        </p>
        <ul>
          <li>Custom dashboards</li>
          <li>Logs</li>
          <li>DynamoDB Client</li>
          <li>SQL Client</li>
          <li>S3 Manager</li>
          <li>EC2 Manager</li>
        </ul>
        <p>
          Get early access: <a href="https://www.cloud-ui.com/">Cloud-UI.com</a>
          .
        </p>
        <img src="https://www.cloud-ui.com/hero.png" alt="CloudUI" />
      </div>
    )
  }
}
