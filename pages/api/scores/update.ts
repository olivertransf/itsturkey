/* eslint-disable import/no-anonymous-default-export */
import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, dbConnect, throwError } from '@backend/utils'
import { queryLowestScores, queryLowestScoresMultiMap } from '@backend/queries/lowScores'
import queryTopScores, { queryTopScoresMultiMap } from '@backend/queries/topScores'
import { COUNTRY_STREAKS_ID, DAILY_CHALLENGE_ID, EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'
import queryTopStreaks from '@backend/queries/topStreaks'
import { Game, TopScore } from '@backend/models'
import {
  leaderboardStorageKey,
  resolveStandardLeaderboardKey,
} from '@backend/utils/resolveStandardLeaderboardKey'
import {
  MAP_LEADERBOARD_TOP_N as LEADERBOARD_LENGTH,
  STANDARD_LEADERBOARD_GAME_MATCH,
} from '@backend/utils/standardLeaderboardGameMatch'
import getWorldStandardLeaderboardSourceIds from '@backend/utils/worldStandardLeaderboardMapIds'
import {
  notifyDailyChallengeLeaderboardUpdated,
  notifyStandardLeaderboardUpdated,
  notifyStreakLeaderboardUpdated,
} from '@backend/utils/pusherNotify'

async function aggregateExplorerStats(match: Record<string, unknown>) {
  const gameStats = await collections.games
    ?.aggregate([
      { $match: { ...match, state: 'finished', notForLeaderboard: { $ne: true } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalPoints' },
          uniquePlayers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 0,
          avgScore: 1,
          explorers: { $size: '$uniquePlayers' },
        },
      },
    ])
    .toArray()

  if (!gameStats?.length) {
    return { explorers: 0, avgScore: 0 }
  }

  const { explorers, avgScore } = gameStats[0]
  return {
    explorers,
    avgScore: Math.ceil(avgScore ?? 0),
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const authHeader = req.headers.authorization

    if (!authHeader || authHeader !== process.env.INTERNAL_API_SECRET) {
      return throwError(res, 401, 'Unauthorized')
    }

    await dbConnect()

    const { game } = req.body

    if (game.mode === 'standard' && !game.isDailyChallenge) {
      await updateMapLeaderboard(game)
      await updateMapStats(game)
      await notifyStandardLeaderboardUpdated(game)
    }

    if (game.mode === 'standard' && game.isDailyChallenge) {
      await updateDailyChallenge(game)
      await notifyDailyChallengeLeaderboardUpdated()
    }

    if (game.mode === 'streak') {
      await updateStreakLeaderboard(game)
      await updateStreakStats()
      await notifyStreakLeaderboardUpdated(game)
    }

    res.status(200).send('Success')
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}

// DAILY CHALLENGE
const updateDailyChallenge = async (game: Game) => {
  const dailyChallengeQuery = await collections.challenges
    ?.find({ isDailyChallenge: true })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray()

  if (!dailyChallengeQuery?.length) {
    return null
  }

  const dailyChallenge = dailyChallengeQuery[0]
  const dailyChallengeId = new ObjectId(dailyChallenge._id)

  const stats = await getDailyChallengeStats(dailyChallengeId)
  const scores = await getDailyChallengeScores(dailyChallengeId, game)

  let updateFields = {}

  if (stats) {
    updateFields = { ...updateFields, ...stats }
  }

  if (scores) {
    updateFields = { ...updateFields, scores }
  }

  await collections.mapLeaderboard?.findOneAndUpdate(
    { mapId: DAILY_CHALLENGE_ID, dailyChallengeId },
    { $set: updateFields },
    { upsert: true }
  )
}

const getDailyChallengeStats = async (dailyChallengeId: ObjectId) => {
  const gameStats = await collections.games
    ?.aggregate([
      { $match: { challengeId: dailyChallengeId, state: 'finished', notForLeaderboard: { $ne: true } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalPoints' },
          uniquePlayers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 0,
          avgScore: 1,
          explorers: { $size: '$uniquePlayers' },
        },
      },
    ])
    .toArray()

  if (!gameStats) {
    return null
  }

  const { explorers, avgScore } = gameStats?.length ? gameStats[0] : { explorers: 0, avgScore: 0 }

  return {
    usersPlayed: explorers,
    avgScore: Math.ceil(avgScore),
  }
}

const getDailyChallengeScores = async (dailyChallengeId: ObjectId, game: Game) => {
  const mapId = DAILY_CHALLENGE_ID
  const mapLeaderboard = await collections.mapLeaderboard?.findOne({ mapId, dailyChallengeId })

  const topScores = mapLeaderboard?.scores
  const leaderboardNeedsMoreScores = topScores?.length && topScores.length < LEADERBOARD_LENGTH
  const lowestTopScore = topScores?.length
    ? topScores.reduce((min, score) => Math.min(min, score.totalPoints), Infinity)
    : 0

  if (game.totalPoints < lowestTopScore && !leaderboardNeedsMoreScores) {
    return
  }

  const query = { challengeId: dailyChallengeId, state: 'finished' }
  const newTopScores = await queryTopScores(query, LEADERBOARD_LENGTH)

  return newTopScores
}

// REGULAR MAPS (+ equitable virtual standard + unified hub world bucket)
const updateMapStats = async (game: Game) => {
  const resolution = resolveStandardLeaderboardKey(game.mapId)

  if (resolution.kind === 'world') {
    const mapIds = getWorldStandardLeaderboardSourceIds()
    const { explorers, avgScore } = await aggregateExplorerStats({ mapId: { $in: mapIds } })
    const lbKey = leaderboardStorageKey(resolution)

    await collections.mapLeaderboard?.findOneAndUpdate(
      { mapId: lbKey },
      { $set: { avgScore, usersPlayed: explorers } },
      { upsert: true }
    )

    for (const id of mapIds) {
      await collections.maps?.updateOne({ _id: id }, { $set: { avgScore, usersPlayed: explorers } })
    }
    return
  }

  if (resolution.kind === 'map' && typeof resolution.mapId === 'string') {
    const sid = resolution.mapId
    const { explorers, avgScore } = await aggregateExplorerStats({ mapId: sid })

    await collections.mapLeaderboard?.findOneAndUpdate(
      { mapId: sid },
      { $set: { avgScore, usersPlayed: explorers } },
      { upsert: true }
    )
    return
  }

  const mapId = resolution.mapId as ObjectId
  const { explorers, avgScore } = await aggregateExplorerStats({ mapId })

  await collections.maps?.updateOne({ _id: mapId }, { $set: { avgScore, usersPlayed: explorers } })
}

const updateMapLeaderboard = async (game: Game) => {
  const resolution = resolveStandardLeaderboardKey(game.mapId)
  const dbKey = leaderboardStorageKey(resolution)

  const mapLeaderboard = await collections.mapLeaderboard?.findOne({ mapId: dbKey })

  const topScores = mapLeaderboard?.scores
  const leaderboardNeedsMoreScores = topScores?.length && topScores.length < LEADERBOARD_LENGTH
  const lowestTopScore = topScores?.length
    ? topScores.reduce((min, score) => Math.min(min, score.totalPoints), Infinity)
    : 0

  const shouldRefreshHigh = game.totalPoints >= lowestTopScore || leaderboardNeedsMoreScores

  let newTopScores: TopScore[] | undefined
  if (shouldRefreshHigh) {
    if (resolution.kind === 'world') {
      const mapIds = getWorldStandardLeaderboardSourceIds()
      newTopScores = await queryTopScoresMultiMap(mapIds, LEADERBOARD_LENGTH, STANDARD_LEADERBOARD_GAME_MATCH)
    } else if (resolution.kind === 'map' && typeof resolution.mapId === 'string') {
      newTopScores = await queryTopScores(
        { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: resolution.mapId },
        LEADERBOARD_LENGTH
      )
    } else {
      const mapId = resolution.mapId as ObjectId
      newTopScores = await queryTopScores({ ...STANDARD_LEADERBOARD_GAME_MATCH, mapId }, LEADERBOARD_LENGTH)
    }
  }

  let newLowScores: TopScore[] | undefined
  if (resolution.kind === 'world') {
    const mapIds = getWorldStandardLeaderboardSourceIds()
    newLowScores = await queryLowestScoresMultiMap(mapIds, LEADERBOARD_LENGTH, STANDARD_LEADERBOARD_GAME_MATCH)
  } else if (resolution.kind === 'map' && typeof resolution.mapId === 'string') {
    newLowScores = await queryLowestScores(
      { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: resolution.mapId },
      LEADERBOARD_LENGTH
    )
  } else {
    const mapId = resolution.mapId as ObjectId
    newLowScores = await queryLowestScores({ ...STANDARD_LEADERBOARD_GAME_MATCH, mapId }, LEADERBOARD_LENGTH)
    if (!newLowScores?.length) {
      newLowScores = await queryLowestScores(
        { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: mapId.toHexString() },
        LEADERBOARD_LENGTH
      )
    }
  }

  const $set: Record<string, unknown> = {
    scoresLow: newLowScores ?? [],
  }
  if (shouldRefreshHigh && newTopScores !== undefined) {
    $set.scores = newTopScores
  }

  await collections.mapLeaderboard?.findOneAndUpdate({ mapId: dbKey }, { $set }, { upsert: true })
}

// COUNTRY STREAKS (classic vs equitable virtual maps)
const updateStreakStatsForMapId = async (streakMapId: string) => {
  const gameStats = await collections.games
    ?.aggregate([
      {
        $match: {
          mode: 'streak',
          state: 'finished',
          notForLeaderboard: { $ne: true },
          mapId: streakMapId,
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$streak' },
          uniquePlayers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 0,
          avgScore: 1,
          explorers: { $size: '$uniquePlayers' },
        },
      },
    ])
    .toArray()

  if (!gameStats) {
    return null
  }

  const { explorers, avgScore } = gameStats?.length ? gameStats[0] : { explorers: 0, avgScore: 0 }
  const roundedAvgScore = Math.ceil(avgScore)

  await collections.mapLeaderboard?.findOneAndUpdate(
    { mapId: streakMapId },
    { $set: { avgScore: roundedAvgScore, usersPlayed: explorers } },
    { upsert: true }
  )
}

const updateStreakStats = async () => {
  await updateStreakStatsForMapId(COUNTRY_STREAKS_ID)
  await updateStreakStatsForMapId(EQUITABLE_COUNTRY_STREAK_ID)
}

const updateStreakLeaderboard = async (game: Game) => {
  const mapId =
    game.mapId === EQUITABLE_COUNTRY_STREAK_ID ? EQUITABLE_COUNTRY_STREAK_ID : COUNTRY_STREAKS_ID
  const mapLeaderboard = await collections.mapLeaderboard?.findOne({ mapId })

  const topScores = mapLeaderboard?.scores
  const leaderboardNeedsMoreScores = topScores?.length && topScores.length < LEADERBOARD_LENGTH
  const lowestTopScore = topScores?.length
    ? topScores.reduce((min, score) => Math.min(min, score.totalPoints), Infinity)
    : 0

  if (game.streak >= lowestTopScore || leaderboardNeedsMoreScores) {
    const query = { mode: 'streak', state: 'finished', mapId }
    const newTopScores = await queryTopStreaks(query, LEADERBOARD_LENGTH)

    await collections.mapLeaderboard?.findOneAndUpdate({ mapId }, { $set: { scores: newTopScores } }, { upsert: true })
  }
}
