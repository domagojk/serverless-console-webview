import React, { useState } from 'react'
import { Input, DatePicker } from 'antd'
import './searchPage.css'
import moment from 'moment'

const { Search, TextArea } = Input

const defaultQuery = `fields @timestamp, @message
  | filter @message like $inputValue
  | sort @timestamp desc
  | limit 20`

const { RangePicker } = DatePicker

export function SearchPage() {
  const [isQueryShown, setShowQuery] = useState(false)
  const [activeTimeFrame, onTimeFrameChange] = useState('1h')
  const [query, setQuery] = useState(defaultQuery)

  return (
    <div className="search-page">
      <h2>Search</h2>
      <Search onSearch={value => console.log(value)} enterButton="Search" />
      <div className="search-options">
        <div className="left timeframe">
          <TimeFrameLink
            timeframe="5m"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="10m"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="15m"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="30m"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="1h"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="3h"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="6h"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="12h"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="1d"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="2d"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
          <span className="separator">|</span>
          <TimeFrameLink
            timeframe="custom"
            active={activeTimeFrame}
            onTimeFrameChange={onTimeFrameChange}
          />
        </div>
        <div className="right">
          {isQueryShown ? (
            <span className="whitelink" onClick={() => setShowQuery(false)}>
              hide query
            </span>
          ) : (
            <span className="whitelink" onClick={() => setShowQuery(true)}>
              show query
            </span>
          )}
        </div>
      </div>
      {activeTimeFrame === 'custom' && (
        <RangePicker
          style={{ marginBottom: 10 }}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          placeholder={['Start Time', 'End Time']}
          defaultValue={[moment(Date.now()), moment(Date.now() + 259200000)]}
          onOk={console.log}
        />
      )}

      {isQueryShown && (
        <div className="search-query">
          <TextArea
            value={query}
            rows={4}
            onChange={e => setQuery(e.target.value)}
          />
          {query !== defaultQuery && (
            <span
              className="reset whitelink"
              onClick={() => setQuery(defaultQuery)}
            >
              reset
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function TimeFrameLink({ timeframe, active, onTimeFrameChange }) {
  return (
    <span
      className={`whitelink ${active === timeframe ? 'active' : ''}`}
      onClick={() => onTimeFrameChange(timeframe)}
    >
      {timeframe}
    </span>
  )
}
