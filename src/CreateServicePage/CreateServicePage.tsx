import React from 'react'
import { ServerlessFunctions } from './ServerlessFunctions'
import './createServicePage.css'
// import { Carousel } from 'antd'

export function CreateServicePage() {
  return (
    <div className="create-page-root">
      {/*
      <div className="button-box-wrapper">
        <div className="button-box active">
          <span>Serverless Functions</span>
        </div>

        <div className="button-box">
          <span>Custom Logs</span>
        </div>
      </div>
      */}

      <div>
        <ServerlessFunctions
          awsProfile="default"
          source="serverless"
          cwd="./"
          offset={0}
          print="serverless print"
          region="us-east-1"
          stages={['dev']}
          stacks={[{ stage: 'dev', stackName: null }]}
        />
        {/*
        <div className="create-right">
          <h4 style={{ paddingBottom: 5 }}>Serverless Functions Overview</h4>
          <Carousel autoplay speed={1000} effect="fade">
            {document.vscodeData.overview.serverless.images.map((img, key) => (
              <img key={key} src={img} />
            ))}
          </Carousel>
          <ul className="feature-list">
            {document.vscodeData.overview.serverless.features.map(
              (feature, key) => (
                <li key={key}>{feature}</li>
              )
            )}
          </ul>
        </div>
        */}
      </div>
    </div>
  )
}
