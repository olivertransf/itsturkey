/** Virtual standard-map id prefix: `eqcountry-us` (lowercase ISO alpha-2). */
export const EQCOUNTRY_MAP_PREFIX = 'eqcountry-'

export function parseEquitableCountryMapKey(mapId: string | undefined | null): string | null {
  if (!mapId || typeof mapId !== 'string') return null
  if (!mapId.startsWith(EQCOUNTRY_MAP_PREFIX)) return null
  const code = mapId.slice(EQCOUNTRY_MAP_PREFIX.length).toLowerCase()
  if (!/^[a-z]{2}$/.test(code)) return null
  return code
}

export function isEquitableCountryVirtualMapId(mapId: unknown): boolean {
  return parseEquitableCountryMapKey(String(mapId ?? '')) !== null
}

export function equitableCountryMapIdFromCode(isoAlpha2: string): string {
  return `${EQCOUNTRY_MAP_PREFIX}${isoAlpha2.trim().toLowerCase()}`
}

export function isMongoObjectIdHex24(s: string): boolean {
  return /^[a-f\d]{24}$/i.test(s)
}
