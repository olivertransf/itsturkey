import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game, MultiSession } from '@backend/models'
import {
  collections,
  getLocations,
  isUserBanned,
  normalizeMultiSessionSettings,
  requirePlayableUser,
  throwError,
} from '@backend/utils'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'

type MultiGuessrMapSource = {
  _id: string
  name?: string
}

const getFallbackMapSources = (): MultiGuessrMapSource[] => {
  const raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS

  if (!raw) {
    return [{ _id: OFFICIAL_WORLD_ID, name: 'World' }]
  }

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return [{ _id: OFFICIAL_WORLD_ID, name: 'World' }]
    }

    const maps = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null

        const rec = item as Record<string, unknown>
        const _id = rec._id
        const name = rec.name

        if (typeof _id !== 'string') return null

        return {
          _id,
          name: typeof name === 'string' ? name : undefined,
        }
      })
      .filter(Boolean) as MultiGuessrMapSource[]

    return maps.length ? maps : [{ _id: OFFICIAL_WORLD_ID, name: 'World' }]
  } catch {
    return [{ _id: OFFICIAL_WORLD_ID, name: 'World' }]
  }
}

const getRandomMapSource = (maps: MultiGuessrMapSource[]) => maps[Math.floor(Math.random() * maps.length)]

const createMultiSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = await requirePlayableUser(req, res)
  const { mapId, mapName, gameSettings } = req.body
  const { panelCount, totalRoundsPerPanel, perGuessSeconds, cooldownSeconds } = normalizeMultiSessionSettings(req.body)

  const { isBanned } = await isUserBanned(userId)

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  if (!gameSettings) {
    return throwError(res, 400, 'Missing game settings')
  }

  const useAllMaps = !mapId || mapId === 'all'
  const fallbackMaps = getFallbackMapSources()
  const poolMaps = useAllMaps ? fallbackMaps : []

  const panelGames: Game[] = []

  for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
    const panelMap = useAllMaps ? getRandomMapSource(poolMaps) : null
    const panelMapId = panelMap?._id ?? mapId
    let locations = await getLocations(panelMapId, totalRoundsPerPanel)
    let resolvedPanelMap = panelMap

    if (useAllMaps && !locations) {
      const shuffledFallbackMaps = [...fallbackMaps].sort(() => Math.random() - 0.5)

      for (const fallbackMap of shuffledFallbackMaps) {
        locations = await getLocations(fallbackMap._id, totalRoundsPerPanel)

        if (locations) {
          resolvedPanelMap = fallbackMap
          break
        }
      }
    }

    if (!locations) {
      return throwError(res, 400, 'Failed to get locations')
    }

    panelGames.push({
      mapId: new ObjectId(resolvedPanelMap?._id ?? panelMapId) as unknown as string,
      mapName: resolvedPanelMap?.name ?? mapName,
      gameSettings: {
        ...gameSettings,
        timeLimit: perGuessSeconds,
      },
      mode: 'standard',
      userId: new ObjectId(userId),
      notForLeaderboard: true,
      guesses: [],
      rounds: locations,
      round: 1,
      totalPoints: 0,
      totalDistance: { metric: 0, imperial: 0 },
      totalTime: 0,
      streak: 0,
      state: 'started',
      totalRounds: totalRoundsPerPanel,
      unlimited: false,
      createdAt: new Date(),
    })
  }

  const gamesResult = await collections.games?.insertMany(panelGames)

  if (!gamesResult) {
    return throwError(res, 500, 'Failed to create multi games')
  }

  const panelGameIds = Object.values(gamesResult.insertedIds)
  const session: MultiSession = {
    userId: new ObjectId(userId),
    mapId: useAllMaps ? 'all' : mapId,
    mapName: useAllMaps ? 'All Maps' : mapName,
    panelCount: panelCount as MultiSession['panelCount'],
    totalRoundsPerPanel,
    perGuessSeconds,
    cooldownSeconds,
    panelGameIds,
    state: 'started',
    createdAt: new Date(),
  }

  const sessionResult = await collections.multiSessions?.insertOne(session)

  if (!sessionResult) {
    return throwError(res, 500, 'Failed to create multi session')
  }

  res.status(201).send({ _id: sessionResult.insertedId, ...session })
}

export default createMultiSession
