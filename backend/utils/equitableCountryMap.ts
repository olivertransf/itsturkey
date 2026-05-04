import { ObjectId } from 'mongodb'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'

export {
  equitableCountryMapIdFromCode,
  isEquitableCountryVirtualMapId,
  isMongoObjectIdHex24,
  parseEquitableCountryMapKey,
} from '@utils/helpers/equitableCountryMapId'

export {
  equitableContinentMapIdFromSlug,
  isEquitableContinentVirtualMapId,
  parseEquitableContinentMapKey,
} from '@utils/helpers/equitableContinentMapId'

/** Per-country or per-continent equitable virtual standard maps (not stored in `maps`). */
export function isEquitableVirtualStandardMapId(mapId: unknown): boolean {
  const s = String(mapId ?? '')
  return parseEquitableCountryMapKey(s) !== null || parseEquitableContinentMapKey(s) !== null
}

/** Standard games: store ObjectId for real maps, string for virtual country/continent maps. */
export function storageMapIdForStandardGame(mapId: unknown): string | ObjectId {
  const s = String(mapId ?? '').trim()
  if (parseEquitableCountryMapKey(s)) return s
  if (parseEquitableContinentMapKey(s)) return s
  if (/^[a-f\d]{24}$/i.test(s)) return new ObjectId(s)
  return s
}
