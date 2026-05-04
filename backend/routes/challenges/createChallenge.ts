import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { storageMapIdForStandardGame } from '@backend/utils/equitableCountryMap'
import { collections, getLocations, getUserId } from '@backend/utils'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'

const createChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const { mapId, gameSettings, mode } = req.body

  const parsed = Number.parseInt(String(req.body.totalRounds ?? ''), 10)
  const totalRounds = Number.isFinite(parsed)
    ? Math.min(MAX_TOTAL_ROUNDS, Math.max(1, parsed))
    : DEFAULT_TOTAL_ROUNDS

  const numLocationsToGenerate = mode === 'streak' ? 10 : totalRounds
  const locations = await getLocations(mapId, numLocationsToGenerate)

  if (locations === null) {
    return res.status(400).send('Invalid map Id, challenge could not be created')
  }

  const newChallenge = {
    mapId: mode === 'standard' ? storageMapIdForStandardGame(mapId) : mapId,
    creatorId: new ObjectId(userId),
    mode,
    gameSettings,
    locations,
  }

  // Create Challenge
  const result = await collections.challenges?.insertOne(newChallenge)

  if (!result) {
    return res.status(500).send('Failed to create a new challenge.')
  }

  res.status(201).send(result.insertedId)
}

export default createChallenge
