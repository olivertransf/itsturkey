import { ObjectId } from 'mongodb'

/**
 * ObjectIds of GeoHub maps whose locations power **Equitable Country Streak**.
 * Override with `EQUITABLE_COUNTRY_STREAK_MAP_IDS` (comma-separated hex ids).
 * If unset, ids are taken from `NEXT_PUBLIC_HOME_MAP_CARDS` entries named `Equitable World*`.
 */
export default function getEquitableCountryStreakSourceMapIds(): ObjectId[] {
  const explicit = process.env.EQUITABLE_COUNTRY_STREAK_MAP_IDS?.trim()
  if (explicit) {
    return explicit
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((id) => new ObjectId(id))
  }

  const raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS?.trim()
  if (!raw) {
    return []
  }

  try {
    const cards = JSON.parse(raw) as unknown
    if (!Array.isArray(cards)) {
      return []
    }

    const ids: ObjectId[] = []
    for (const c of cards) {
      if (!c || typeof c !== 'object') continue
      const rec = c as Record<string, unknown>
      if (typeof rec.name !== 'string' || !rec.name.startsWith('Equitable World')) continue
      if (typeof rec._id !== 'string') continue
      ids.push(new ObjectId(rec._id))
    }
    return ids
  } catch {
    return []
  }
}
