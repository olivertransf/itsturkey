import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { queryLowestScores, queryLowestScoresMultiMap } from '@backend/queries/lowScores'
import queryTopScores, { queryTopScoresMultiMap } from '@backend/queries/topScores'
import { collections, getUserId } from '@backend/utils'
import compareObjectIds from '@backend/utils/compareObjectIds'
import { resolvePublicMapIdToLeaderboardStorageKey } from '@backend/utils/resolveStandardLeaderboardKey'
import {
  MAP_LEADERBOARD_TOP_N,
  STANDARD_LEADERBOARD_GAME_MATCH,
} from '@backend/utils/standardLeaderboardGameMatch'
import getWorldStandardLeaderboardSourceIds from '@backend/utils/worldStandardLeaderboardMapIds'
import { TopScore } from '@backend/models'
import { WORLD_STANDARD_LEADERBOARD_KEY } from '@utils/constants/standardLeaderboard'

type TopScoreType = TopScore & {
  highlight?: boolean
  userName?: string
  userAvatar?: { emoji: string; color: string }
}

type Variant = 'high' | 'low'

async function computeHighScoresFromGames(leaderboardMapKey: ObjectId | string): Promise<TopScore[]> {
  if (leaderboardMapKey === WORLD_STANDARD_LEADERBOARD_KEY) {
    const mapIds = getWorldStandardLeaderboardSourceIds()
    return (
      (await queryTopScoresMultiMap(mapIds, MAP_LEADERBOARD_TOP_N, STANDARD_LEADERBOARD_GAME_MATCH)) ?? []
    )
  }

  if (typeof leaderboardMapKey === 'string') {
    return (
      (await queryTopScores(
        { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: leaderboardMapKey },
        MAP_LEADERBOARD_TOP_N
      )) ?? []
    )
  }

  let rows =
    (await queryTopScores(
      { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: leaderboardMapKey },
      MAP_LEADERBOARD_TOP_N
    )) ?? []

  if (!rows.length) {
    rows =
      (await queryTopScores(
        { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: leaderboardMapKey.toHexString() },
        MAP_LEADERBOARD_TOP_N
      )) ?? []
  }

  return rows
}

async function computeLowScoresFromGames(leaderboardMapKey: ObjectId | string): Promise<TopScore[]> {
  if (leaderboardMapKey === WORLD_STANDARD_LEADERBOARD_KEY) {
    const mapIds = getWorldStandardLeaderboardSourceIds()
    return (
      (await queryLowestScoresMultiMap(mapIds, MAP_LEADERBOARD_TOP_N, STANDARD_LEADERBOARD_GAME_MATCH)) ??
      []
    )
  }

  if (typeof leaderboardMapKey === 'string') {
    return (
      (await queryLowestScores(
        { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: leaderboardMapKey },
        MAP_LEADERBOARD_TOP_N
      )) ?? []
    )
  }

  let rows =
    (await queryLowestScores(
      { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: leaderboardMapKey },
      MAP_LEADERBOARD_TOP_N
    )) ?? []

  if (!rows.length) {
    rows =
      (await queryLowestScores(
        { ...STANDARD_LEADERBOARD_GAME_MATCH, mapId: leaderboardMapKey.toHexString() },
        MAP_LEADERBOARD_TOP_N
      )) ?? []
  }

  return rows
}

async function hydrateCachedScores(
  leaderboardMapKey: ObjectId | string,
  nestedField: 'scores' | 'scoresLow'
): Promise<TopScoreType[]> {
  const mapLeaderboard = await collections.mapLeaderboard
    ?.aggregate([
      { $match: { mapId: leaderboardMapKey } },
      { $unwind: `$${nestedField}` },
      {
        $lookup: {
          from: 'users',
          localField: `${nestedField}.userId`,
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          mapId: { $first: '$mapId' },
          scores: {
            $push: {
              gameId: `$${nestedField}.gameId`,
              userId: `$${nestedField}.userId`,
              totalPoints: `$${nestedField}.totalPoints`,
              totalTime: `$${nestedField}.totalTime`,
              userName: { $ifNull: ['$userDetails.name', 'Player'] },
              userAvatar: {
                $ifNull: ['$userDetails.avatar', { emoji: '1f464', color: '#64748b' }],
              },
            },
          },
        },
      },
    ])
    .toArray()

  return mapLeaderboard?.length ? (mapLeaderboard[0].scores as TopScoreType[]) : []
}

async function enrichTopScoresWithUsers(rows: TopScore[]): Promise<TopScoreType[]> {
  if (!rows.length) return []

  const ids = Array.from(new Set(rows.map((r) => r.userId.toString()))).map((id) => new ObjectId(id))
  const users =
    (await collections.users?.find({ _id: { $in: ids } }).project({ name: 1, avatar: 1 }).toArray()) ?? []

  const byId = new Map(users.map((u) => [u._id.toString(), u]))

  return rows.map((r) => ({
    ...r,
    userName: byId.get(r.userId.toString())?.name ?? 'Player',
    userAvatar: byId.get(r.userId.toString())?.avatar ?? { emoji: '1f464', color: '#64748b' },
  }))
}

function personalPipelineStages(matchExtras: Record<string, unknown>, uid: string, variant: Variant) {
  const sort =
    variant === 'high'
      ? ({ $sort: { totalPoints: -1 } } as const)
      : ({ $sort: { totalPoints: 1, totalTime: -1 } } as const)

  return [
    {
      $match: {
        ...STANDARD_LEADERBOARD_GAME_MATCH,
        ...matchExtras,
        userId: new ObjectId(uid),
        notForLeaderboard: { $ne: true },
      },
    },
    sort,
    { $limit: 1 },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        gameId: '$_id',
        userId: 1,
        userName: { $ifNull: ['$userDetails.name', 'Player'] },
        userAvatar: {
          $ifNull: ['$userDetails.avatar', { emoji: '1f464', color: '#64748b' }],
        },
        totalPoints: 1,
        totalTime: 1,
      },
    },
  ]
}

const getGameScores = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string
  const variant: Variant = req.query.variant === 'low' ? 'low' : 'high'

  const leaderboardMapKey = resolvePublicMapIdToLeaderboardStorageKey(mapId)

  const lbDoc = await collections.mapLeaderboard?.findOne({ mapId: leaderboardMapKey })

  const nestedField = variant === 'low' ? 'scoresLow' : 'scores'
  const cachedArr = variant === 'low' ? lbDoc?.scoresLow : lbDoc?.scores

  let topScores: TopScoreType[]

  if (cachedArr?.length) {
    topScores = await hydrateCachedScores(leaderboardMapKey, nestedField)
  } else {
    const raw =
      variant === 'high'
        ? await computeHighScoresFromGames(leaderboardMapKey)
        : await computeLowScoresFromGames(leaderboardMapKey)
    topScores = await enrichTopScoresWithUsers(raw)
  }

  if (!topScores.length) {
    return res.status(200).send([])
  }

  const thisUserIndex = topScores.findIndex((topScore) => compareObjectIds(topScore.userId, userId))
  const isUserInTopFive = thisUserIndex !== -1

  if (isUserInTopFive) {
    topScores[thisUserIndex] = { ...topScores[thisUserIndex], highlight: true }
  } else if (userId) {
    const gameMapMatch =
      leaderboardMapKey === WORLD_STANDARD_LEADERBOARD_KEY
        ? { mapId: { $in: getWorldStandardLeaderboardSourceIds() } }
        : typeof leaderboardMapKey === 'string'
          ? { mapId: leaderboardMapKey }
          : { mapId: leaderboardMapKey }

    let personalRows = (await collections.games
      ?.aggregate(personalPipelineStages(gameMapMatch, userId, variant))
      .toArray()) as TopScoreType[]

    if (!personalRows?.length && leaderboardMapKey instanceof ObjectId) {
      personalRows = (await collections.games
        ?.aggregate(personalPipelineStages({ mapId: leaderboardMapKey.toHexString() }, userId, variant))
        .toArray()) as TopScoreType[]
    }

    if (personalRows?.length) {
      topScores.push({ ...personalRows[0], highlight: true })
    }
  }

  res.status(200).send(topScores)
}

export default getGameScores
