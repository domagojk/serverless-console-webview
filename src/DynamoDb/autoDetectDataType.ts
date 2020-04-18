export function autoDetectDataType({ value, fieldName, attributesSchema }) {
  if (attributesSchema?.[fieldName]) {
    return attributesSchema?.[fieldName]
  }
  if (value === 'false' || value === 'true') {
    return 'BOOL'
  }
  if (!isNaN(value)) {
    return 'N'
  }
  return 'S'
}
