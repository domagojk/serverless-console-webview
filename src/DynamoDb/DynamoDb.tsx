import './dynamoDb.css'
import React from 'react'
import { Items } from './Items'

export class DynamoDb extends React.Component {
  render() {
    return (
      <div className="dynamodb-page">
        <div className="main-wrapper">
          <Items />
        </div>
      </div>
    )
  }
}
