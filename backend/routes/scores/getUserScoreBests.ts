import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from '@backend/utils'
import {
  leaderboardStorageKey,
  resolveStandardLeaderboardKey,
} from '@backend/utils/resolveStandardLeaderboardKey'
import countries from '@utils/constants/countries'
import { CONTINENT_NAMES } from '@utils/constants/iso2ContinentSlug'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { WORLD_STANDARD_LEADERBOARD_KEY } from '@utils/constants/standardLeaderboard'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

export type UserScoreBestRow = {
  leaderboardKey: string
  label: string
  totalPoints: number
  totalTime: number
  gameId: string
  mapPageId: string
}

const getUserScoreBests = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = typeof req.query.id === 'string' ? req.query.id : ''

  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user id' })
  }

  const games = await collections.games
    ?.find({
      userId: new ObjectId(userId),
      mode: 'standard',
      state: 'finished',
      notForLeaderboard: { $ne: true },
    })
    .project({ mapId: 1, totalPoints: 1, totalTime: 1 })
    .toArray()

  if (!games?.length) {
    return res.status(200).send([])
  }

  const bestByKey = new Map<string, { totalPoints: number; totalTime: number; gameId: ObjectId }>()

  for (const g of games) {
    const resolution = resolveStandardLeaderboardKey(g.mapId)
    const dbKey = leaderboardStorageKey(resolution)
    const key = typeof dbKey === 'string' ? dbKey : dbKey.toHexString()

    const prev = bestByKey.get(key)
    const better =
      !prev ||
      g.totalPoints > prev.totalPoints ||
      (g.totalPoints === prev.totalPoints && g.totalTime < prev.totalTime)

    if (better && g._id) {
      bestByKey.set(key, {
        totalPoints: g.totalPoints,
        totalTime: g.totalTime,
        gameId: g._id,
      })
    }
  }

  const rows: UserScoreBestRow[] = []

  for (const [key, row] of Array.from(bestByKey.entries())) {
    rows.push({
      leaderboardKey: key,
      label: await resolveLabelForLeaderboardKey(key),
      totalPoints: row.totalPoints,
      totalTime: row.totalTime,
      gameId: row.gameId.toHexString(),
      mapPageId: key === WORLD_STANDARD_LEADERBOARD_KEY ? OFFICIAL_WORLD_ID : key,
    })
  }

  rows.sort((a, b) => b.totalPoints - a.totalPoints)

  res.status(200).send(rows)
}

async function resolveLabelForLeaderboardKey(serializedKey: string): Promise<string> {
  if (serializedKey === WORLD_STANDARD_LEADERBOARD_KEY) {
    return 'World maps (Default + Equitable)'
  }

  const cc = parseEquitableCountryMapKey(serializedKey)
  if (cc) {
    return countries.find((c) => c.code === cc)?.name ?? serializedKey
  }

  const cont = parseEquitableContinentMapKey(serializedKey)
  if (cont) {
    return CONTINENT_NAMES[cont]
  }

  if (ObjectId.isValid(serializedKey)) {
    const map = await collections.maps?.findOne(
      { _id: new ObjectId(serializedKey) },
      { projection: { name: 1 } }
    )
    return map?.name ?? 'Community map'
  }

  return serializedKey
}

export default getUserScoreBests
