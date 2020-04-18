import moment from 'moment'

export interface License {
  invalid: boolean
  expires: number
  inTrial: boolean
  deviceId: string
  daysRemaining?: string
  licenseKey?: string
}

export function getLicense(licenseData: License) {
  const remainingDays = licenseData.inTrial
    ? moment(licenseData?.expires).diff(moment(), 'days') || 0
    : null

  const dayPlural = remainingDays === 1 ? '' : 's'

  const daysRemaining = `${
    remainingDays < 0 ? 0 : remainingDays
  } day${dayPlural}`

  return {
    ...licenseData,
    daysRemaining,
  }
}
