import type { ContinentSlug } from '@utils/constants/iso2ContinentSlug'

/** Virtual standard-map id: `eqcontinent-eu` (continent slug). */
export const EQCONTINENT_MAP_PREFIX = 'eqcontinent-'

const ALLOWED: ReadonlySet<string> = new Set(['af', 'an', 'as', 'eu', 'na', 'oc', 'sa'])

export function parseEquitableContinentMapKey(mapId: string | undefined | null): ContinentSlug | null {
  if (!mapId || typeof mapId !== 'string') return null
  if (!mapId.startsWith(EQCONTINENT_MAP_PREFIX)) return null
  const slug = mapId.slice(EQCONTINENT_MAP_PREFIX.length).toLowerCase()
  if (!ALLOWED.has(slug)) return null
  return slug as ContinentSlug
}

export function isEquitableContinentVirtualMapId(mapId: unknown): boolean {
  return parseEquitableContinentMapKey(String(mapId ?? '')) !== null
}

export function equitableContinentMapIdFromSlug(slug: ContinentSlug): string {
  return `${EQCONTINENT_MAP_PREFIX}${slug}`
}
