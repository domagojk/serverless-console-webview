import React, { useState } from 'react'
import { Logs } from './Logs/Logs'
import './createServicePage.css'
import { AddDynamoDb } from './DynamoDb/AddDynamoDb'

export function CreateServicePage() {
  const [service, setService] = useState('logs')

  return (
    <div className="create-page-root">
      {
        <div className="button-box-wrapper">
          <div
            onClick={() => setService('logs')}
            className={`button-box ${service === 'logs' ? 'active' : ''}`}
          >
            <span>Logs</span>
          </div>

          <div
            onClick={() => setService('dynamodb')}
            className={`button-box ${service === 'dynamodb' ? 'active' : ''}`}
          >
            <span>DynamoDB</span>
          </div>
        </div>
      }

      <div>
        {service === 'logs' && (
          <Logs
            awsProfile="default"
            source="serverless"
            cwd="./"
            offset={0}
            print="serverless print"
            region="us-east-1"
            stages={['dev']}
            stacks={[{ stage: 'dev', stackName: null }]}
            customLogs={{
              '0-default': [{ stage: 'dev', logGroup: null }],
            }}
          />
        )}
        {service === 'dynamodb' && (
          <AddDynamoDb awsProfile="default" region="us-east-1" />
        )}
      </div>
    </div>
  )
}
