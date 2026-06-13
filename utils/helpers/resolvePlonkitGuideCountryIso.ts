import { parseEquitableCountryMapKey } from './equitableCountryMapId'
import { getRealCountryCode } from './getRealCountryCode'

/** Normalize stored location.countryCode to ISO alpha-2 for Plonk It URLs (handles composites like IL/PS). */
export function normalizePlonkitIsoFromCountryCode(countryCode?: string | null): string | null {
  if (!countryCode || typeof countryCode !== 'string') return null
  const raw = getRealCountryCode(countryCode.trim())
  if (!raw) return null
  const primary = raw.includes('/') ? raw.split('/')[0].trim() : raw
  const u = primary.toUpperCase()
  if (!/^[A-Z]{2}$/.test(u)) return null
  return u.toLowerCase()
}

/** ISO alpha-2 when the round qualifies for Plonk (eqcountry-* virtual map or location countryCode). */
export function resolvePlonkitGuideCountryIso(
  mapId: unknown,
  roundLocation?: { countryCode?: string } | null
): string | null {
  const fromVirtualCountryMap = parseEquitableCountryMapKey(String(mapId ?? ''))
  if (fromVirtualCountryMap) return fromVirtualCountryMap

  return normalizePlonkitIsoFromCountryCode(roundLocation?.countryCode ?? undefined)
}

/** Actual location for the guess just submitted (`guesses[n]` corresponds to `rounds[n]`). */
export function lastCompletedRoundLocation<T extends { countryCode?: string }>(
  gameData: { rounds: T[]; guesses?: { length: number } | null | undefined }
): T | undefined {
  const n = gameData.guesses?.length ?? 0
  if (n < 1 || !gameData.rounds?.length) return undefined
  return gameData.rounds[n - 1]
}
