import { ObjectId } from 'mongodb'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'

/**
 * ObjectIds for standard maps whose scores roll up into {@link WORLD_STANDARD_LEADERBOARD_KEY}:
 * `NEXT_PUBLIC_HOME_MAP_CARDS` entries named Default World* or Equitable World*, plus legacy {@link OFFICIAL_WORLD_ID}.
 */
export default function getWorldStandardLeaderboardSourceIds(): ObjectId[] {
  const raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS?.trim()
  const ids: ObjectId[] = []

  if (raw) {
    try {
      const cards = JSON.parse(raw) as unknown
      if (!Array.isArray(cards)) {
        return finalize(ids)
      }

      for (const c of cards) {
        if (!c || typeof c !== 'object') continue
        const rec = c as Record<string, unknown>
        const name = rec.name
        if (typeof name !== 'string') continue
        if (!name.startsWith('Default World') && !name.startsWith('Equitable World')) continue
        if (typeof rec._id !== 'string') continue
        ids.push(new ObjectId(rec._id))
      }
    } catch {
      /* ignore malformed env */
    }
  }

  return finalize(ids)
}

function finalize(ids: ObjectId[]): ObjectId[] {
  const official = new ObjectId(OFFICIAL_WORLD_ID)
  if (!ids.some((id) => id.equals(official))) {
    ids.push(official)
  }
  return ids
}
