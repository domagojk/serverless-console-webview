import './queryFormFilter.css'
import React from 'react'
import { Icon, AutoComplete, Input } from 'antd'
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
  'Begins with'
]
const types = {
  S: allTypes,
  B: allTypes,
  N: ['=', '≠', '<=', '<', '>=', '>', 'Between', 'Exists', 'Not exists'],
  BOOL: ['=', '≠', 'Exists', 'Not exists'],
  NULL: ['Exists', 'Not exists']
}

const mapLongToShort = {
  String: 'S',
  Number: 'N',
  Boolean: 'BOOL',
  Null: 'NULL',
  Binary: 'B'
}
const mapShortToLong = {
  S: 'String',
  N: 'Number',
  BOOL: 'Boolean',
  NULL: 'Null',
  B: 'Binary'
}

export function QueryFormFilter({
  queryFilters,
  columns,
  attributesSchema,
  onFilterAdd,
  onFilterRemove,
  onChange
}: {
  queryFilters: QueryFilter[]
  attributesSchema: Record<string, string>
  columns: any[]
  onFilterAdd: any
  onFilterRemove: any
  onChange: any
}) {
  return (
    <div className="query-filter">
      {queryFilters.map(filter => {
        const dataType = filter.dataType
          ? filter.dataType
          : filter.autoDetectedDataType

        return (
          <div className="query-filter-item" key={filter.id}>
            <AutoComplete
              style={{ width: 130, marginRight: 5 }}
              disabled={filter.keyCondition}
              dataSource={columns
                .map(c => c.key)
                .filter(
                  val => !filter.fieldName || val.startsWith(filter.fieldName)
                )}
              value={filter.fieldName}
              placeholder="Field name"
              onChange={value =>
                onChange({
                  ...filter,
                  fieldName: value
                })
              }
            />
            <AutoComplete
              style={{ width: 70, marginRight: 5 }}
              className="comparator-select"
              dataSource={
                types[attributesSchema?.[filter?.fieldName]] || allTypes
              }
              value={filter.comparison}
              onChange={value =>
                onChange({
                  ...filter,
                  comparison: value
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
                  onChange={e => {
                    onChange({
                      ...filter,
                      value: e.target.value
                    })
                  }}
                />
              )}
            {filter.comparison === 'Between' && (
              <>
                <Input
                  style={{ width: 60, marginRight: 5 }}
                  value={filter.valueSecond}
                  onChange={e => {
                    onChange({
                      ...filter,
                      valueSecond: e.target.value
                    })
                  }}
                />
                <span>and</span>
                <Input
                  style={{ width: 60, marginRight: 5 }}
                  value={filter.valueSecond}
                  onChange={e => {
                    onChange({
                      ...filter,
                      valueSecond: e.target.value
                    })
                  }}
                />
              </>
            )}

            {(filter.dataType || filter.value !== undefined) && (
              <AutoComplete
                style={{ width: 70, marginRight: 5 }}
                disabled={filter.keyCondition}
                dataSource={Object.keys(mapLongToShort)}
                value={mapShortToLong[dataType]}
                onChange={(value: string) => {
                  onChange({
                    ...filter,
                    dataType: mapLongToShort[value]
                  })
                }}
              />
            )}
            {!filter.keyCondition && (
              <Icon
                type="minus-circle"
                className="item-remove item-add-remove"
                onClick={() => {
                  onFilterRemove(filter.id)
                }}
              />
            )}
          </div>
        )
      })}
      <span className="item-add-remove add-field-icon" onClick={onFilterAdd}>
        <Icon type="plus-circle" /> Add field
      </span>
    </div>
  )
}
