import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import Game from '@backend/models/game'
import { storageMapIdForStandardGame } from '@backend/utils/equitableCountryMap'
import { collections, getAnonymousGameId, getLocations, getUserId, isUserBanned, throwError } from '@backend/utils'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS, UNLIMITED_LOCATION_BATCH } from '@utils/constants/gameModes'

const createGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const { mode, mapId, mapName, gameSettings } = req.body
  const anonymousId = userId ? undefined : getAnonymousGameId(req, res)

  const { isBanned } = userId ? await isUserBanned(userId) : { isBanned: false }

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  const unlimited = mode === 'streak' ? true : req.body.unlimited === true

  let totalRounds = Number.parseInt(String(req.body.totalRounds ?? ''), 10)
  if (!unlimited) {
    if (!Number.isFinite(totalRounds)) {
      totalRounds = DEFAULT_TOTAL_ROUNDS
    }
    totalRounds = Math.min(MAX_TOTAL_ROUNDS, Math.max(1, totalRounds))
  }

  const locationCount = unlimited ? UNLIMITED_LOCATION_BATCH : totalRounds
  const locations = await getLocations(mapId, locationCount)

  if (!locations) {
    return throwError(res, 400, 'Failed to get locations')
  }

  const newGame = {
    mapId: mode === 'standard' ? storageMapIdForStandardGame(mapId) : mapId,
    mapName,
    gameSettings,
    mode,
    userId: userId ? new ObjectId(userId) : undefined,
    anonymousId,
    notForLeaderboard: !userId,
    guesses: [],
    rounds: locations,
    round: 1,
    totalPoints: 0,
    totalDistance: { metric: 0, imperial: 0 },
    totalTime: 0,
    streak: 0,
    state: 'started',
    createdAt: new Date(),
    ...(unlimited ? { unlimited: true } : { totalRounds, unlimited: false }),
  } as Game

  const result = await collections.games?.insertOne(newGame)

  if (!result) {
    return res.status(500).send('Failed to create a new game.')
  }

  res.status(201).send({ _id: result.insertedId, ...newGame })
}

export default createGame
