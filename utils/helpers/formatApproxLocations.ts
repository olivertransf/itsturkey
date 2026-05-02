import formatLargeNumber from './formatLargeNumber'

/** e.g. "~80,000 locations" */
const formatApproxLocations = (count: number | undefined): string => {
  if (count === undefined || Number.isNaN(count)) {
    return 'Locations unknown'
  }

  const formatted = formatLargeNumber(count)

  if (!formatted) {
    return `${count} locations`
  }

  return `~${formatted} locations`
}

export default formatApproxLocations
