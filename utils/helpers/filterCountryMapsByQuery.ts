import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

export function filterCountryMapsByQuery<T extends { _id?: unknown; name: string }>(maps: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return maps

  return maps.filter((map) => {
    if (map.name.toLowerCase().includes(q)) return true
    const code = parseEquitableCountryMapKey(String(map._id ?? ''))
    return Boolean(code && code.includes(q))
  })
}
