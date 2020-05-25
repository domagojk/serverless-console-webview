import './queryFormFilter.css'
import React, { useRef } from 'react'
import { Icon, AutoComplete, Input, Button } from 'antd'
import { QueryFilter } from '../DynamoDb'

const allTypes = [
  '=',
  '≠',
  '<=',
  '<',
  '>=',
  '>',
  'Between',
  'Exists',
  'Not exists',
  'Contains',
  'Not contains',
  'Begins with',
]
const types = {
  S: allTypes,
  B: allTypes,
  N: ['=', '≠', '<=', '<', '>=', '>', 'Between', 'Exists', 'Not exists'],
  BOOL: ['=', '≠', 'Exists', 'Not exists'],
  NULL: ['Exists', 'Not exists'],
}

const mapLongToShort = {
  String: 'S',
  Number: 'N',
  Boolean: 'BOOL',
  Null: 'NULL',
  Binary: 'B',
}
const mapShortToLong = {
  S: 'String',
  N: 'Number',
  BOOL: 'Boolean',
  NULL: 'Null',
  B: 'Binary',
}

export function QueryFormFilter({
  queryFilters,
  columns,
  attributesSchema,
  searchButtonLabel,
  onFilterAdd,
  onFilterRemove,
  onChange,
  onEnter,
  onRef,
}: {
  queryFilters: QueryFilter[]
  attributesSchema: Record<string, string>
  columns: any[]
  searchButtonLabel: string
  onFilterAdd: any
  onFilterRemove: any
  onChange: any
  onEnter: any
  onRef: any
}) {
  let fieldNameLastFilter = useRef(null)
  const onFilterAddWithFocus = () => {
    onFilterAdd()
    setTimeout(() => fieldNameLastFilter?.current?.focus())
  }

  return (
    <div className="query-filter">
      {queryFilters.map((filter, index) => {
        const dataType = filter.dataType
          ? filter.dataType
          : filter.autoDetectedDataType

        return (
          <div className="query-filter-item" key={filter.id}>
            <AutoComplete
              ref={(input) => {
                if (index === queryFilters.length - 1) {
                  fieldNameLastFilter.current = input
                }
                onRef(input)
              }}
              style={{ width: 130, marginRight: 5 }}
              disabled={filter.keyCondition}
              dataSource={columns
                .map((c) => c.key)
                .filter((val) => {
                  return !filter.fieldName || val.startsWith(filter.fieldName)
                })}
              onChange={(value) => {
                onChange({
                  ...filter,
                  fieldName: value,
                })
              }}
              value={filter.fieldName}
              placeholder="Field name"
            />
            <AutoComplete
              style={{ width: 70, marginRight: 5 }}
              className="comparator-select"
              dataSource={
                types[attributesSchema?.[filter?.fieldName]] || allTypes
              }
              value={filter.comparison}
              disabled={filter.comparisonLocked}
              onChange={(value) =>
                onChange({
                  ...filter,
                  comparison: value,
                })
              }
            />
            {filter.comparison !== 'Exists' &&
              filter.comparison !== 'Not exists' &&
              filter.comparison !== 'Between' && (
                <Input
                  style={{ width: 130, marginRight: 5 }}
                  placeholder="Enter value"
                  value={filter.value}
                  onChange={(e) => {
                    onChange({
                      ...filter,
                      value: e.target.value,
                    })
                  }}
                  onPressEnter={onEnter}
                />
              )}
            {filter.comparison === 'Between' && (
              <>
                <Input
                  style={{ width: 60, marginRight: 5 }}
                  value={filter.valueSecond}
                  onChange={(e) => {
                    onChange({
                      ...filter,
                      valueSecond: e.target.value,
                    })
                  }}
                  onPressEnter={onEnter}
                />
                <span>and</span>
                <Input
                  style={{ width: 60, marginRight: 5 }}
                  value={filter.valueSecond}
                  onChange={(e) => {
                    onChange({
                      ...filter,
                      valueSecond: e.target.value,
                    })
                  }}
                  onPressEnter={onEnter}
                />
              </>
            )}

            <AutoComplete
              style={{ width: 70, marginRight: 5 }}
              disabled={filter.keyCondition}
              dataSource={Object.keys(mapLongToShort)}
              onChange={(value: string) => {
                onChange({
                  ...filter,
                  dataType: mapLongToShort[value],
                })
              }}
              value={dataType ? mapShortToLong[dataType] : 'String'}
            >
              <Input onPressEnter={onEnter} />
            </AutoComplete>

            {
              // if it is key condition of a query
              filter.keyCondition ||
              // or a only filter with no values
              (index === 0 &&
                !filter.value &&
                !filter.fieldName &&
                filter.comparison === '=' &&
                queryFilters.length === 1) ? null : (
                <Icon
                  type="minus-circle"
                  className="item-remove item-add-remove"
                  onClick={() => {
                    onFilterRemove(filter.id)
                  }}
                />
              )
            }
          </div>
        )
      })}
      <div className="options-below-filters">
        <span className="item-add-remove" onClick={onFilterAddWithFocus}>
          <Icon type="plus-circle" /> Add field
        </span>
        <Input
          style={{
            opacity: 0,
            position: 'absolute',
            pointerEvents: 'none',
            width: 0,
            height: 0,
          }}
          onFocus={onFilterAddWithFocus}
        />
      </div>
      <Button
        tabIndex={0}
        disabled={searchButtonLabel === 'Fetching...'}
        className="search-button"
        type="primary"
        size="small"
        onClick={onEnter}
      >
        {searchButtonLabel}
      </Button>
    </div>
  )
}
