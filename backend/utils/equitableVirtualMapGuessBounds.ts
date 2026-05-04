import type { MapType } from '@types'
import continentBBox from '@utils/constants/continentBBox.json'
import countryBBox from '@utils/constants/countryBBox.json'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

type Bounds = NonNullable<MapType['bounds']>

/** Axis-aligned envelope of country/continent polygons for initial guess-map framing. */
export function boundsForVirtualStandardMap(mapId: string): Bounds | null {
  const cc = parseEquitableCountryMapKey(mapId)
  if (cc) {
    const b = (countryBBox as Record<string, Bounds | undefined>)[cc]
    return b ?? null
  }
  const ct = parseEquitableContinentMapKey(mapId)
  if (ct) {
    const b = (continentBBox as Record<string, Bounds | undefined>)[ct]
    return b ?? null
  }
  return null
}
