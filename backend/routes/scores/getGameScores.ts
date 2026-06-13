import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { queryLowestScores, queryLowestScoresMultiMap } from '@backend/queries/lowScores'
import queryTopScores, { queryTopScoresMultiMap } from '@backend/queries/topScores'
import { collections, getUserId } from '@backend/utils'
import compareObjectIds from '@backend/utils/compareObjectIds'
import type { LeaderboardSettingsBucket } from '@backend/utils/leaderboardSettingsBucket'
import { resolvePublicMapIdToBucketedLeaderboardStorageKey, resolvePublicMapIdToLeaderboardStorageKey } from '@backend/utils/resolveStandardLeaderboardKey'
import {
  buildStandardLeaderboardMatch,
  MAP_LEADERBOARD_TOP_N,
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

function parseLeaderboardBucket(raw: unknown): LeaderboardSettingsBucket {
  if (raw === 'no_move' || raw === 'nmpz') return raw
  return 'moving'
}

async function computeHighScoresFromGames(
  baseMapKey: ObjectId | string,
  bucket: LeaderboardSettingsBucket
): Promise<TopScore[]> {
  const match = buildStandardLeaderboardMatch(bucket)

  if (baseMapKey === WORLD_STANDARD_LEADERBOARD_KEY) {
    const mapIds = getWorldStandardLeaderboardSourceIds()
    return (await queryTopScoresMultiMap(mapIds, MAP_LEADERBOARD_TOP_N, match)) ?? []
  }

  if (typeof baseMapKey === 'string') {
    return (await queryTopScores({ ...match, mapId: baseMapKey }, MAP_LEADERBOARD_TOP_N)) ?? []
  }

  let rows =
    (await queryTopScores({ ...match, mapId: baseMapKey }, MAP_LEADERBOARD_TOP_N)) ?? []

  if (!rows.length) {
    rows =
      (await queryTopScores({ ...match, mapId: baseMapKey.toHexString() }, MAP_LEADERBOARD_TOP_N)) ?? []
  }

  return rows
}

async function computeLowScoresFromGames(
  baseMapKey: ObjectId | string,
  bucket: LeaderboardSettingsBucket
): Promise<TopScore[]> {
  const match = buildStandardLeaderboardMatch(bucket)

  if (baseMapKey === WORLD_STANDARD_LEADERBOARD_KEY) {
    const mapIds = getWorldStandardLeaderboardSourceIds()
    return (await queryLowestScoresMultiMap(mapIds, MAP_LEADERBOARD_TOP_N, match)) ?? []
  }

  if (typeof baseMapKey === 'string') {
    return (await queryLowestScores({ ...match, mapId: baseMapKey }, MAP_LEADERBOARD_TOP_N)) ?? []
  }

  let rows =
    (await queryLowestScores({ ...match, mapId: baseMapKey }, MAP_LEADERBOARD_TOP_N)) ?? []

  if (!rows.length) {
    rows =
      (await queryLowestScores(
        { ...match, mapId: baseMapKey.toHexString() },
        MAP_LEADERBOARD_TOP_N
      )) ?? []
  }

  return rows
}

async function hydrateCachedScores(
  leaderboardMapKey: string,
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

function personalPipelineStages(
  matchExtras: Record<string, unknown>,
  uid: string,
  variant: Variant,
  bucket: LeaderboardSettingsBucket
) {
  const sort =
    variant === 'high'
      ? ({ $sort: { totalPoints: -1 } } as const)
      : ({ $sort: { totalPoints: 1, totalTime: -1 } } as const)

  return [
    {
      $match: {
        ...buildStandardLeaderboardMatch(bucket),
        ...matchExtras,
        userId: new ObjectId(uid),
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
  const bucket = parseLeaderboardBucket(req.query.bucket)

  const baseMapKey = resolvePublicMapIdToLeaderboardStorageKey(mapId)
  const leaderboardMapKey = resolvePublicMapIdToBucketedLeaderboardStorageKey(mapId, bucket)

  const lbDoc = await collections.mapLeaderboard?.findOne({ mapId: leaderboardMapKey })

  const nestedField = variant === 'low' ? 'scoresLow' : 'scores'
  const cachedArr = variant === 'low' ? lbDoc?.scoresLow : lbDoc?.scores

  let topScores: TopScoreType[]

  if (cachedArr?.length) {
    topScores = await hydrateCachedScores(leaderboardMapKey, nestedField)
  } else {
    const raw =
      variant === 'high'
        ? await computeHighScoresFromGames(baseMapKey, bucket)
        : await computeLowScoresFromGames(baseMapKey, bucket)
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
      baseMapKey === WORLD_STANDARD_LEADERBOARD_KEY
        ? { mapId: { $in: getWorldStandardLeaderboardSourceIds() } }
        : typeof baseMapKey === 'string'
          ? { mapId: baseMapKey }
          : { mapId: baseMapKey }

    let personalRows = (await collections.games
      ?.aggregate(personalPipelineStages(gameMapMatch, userId, variant, bucket))
      .toArray()) as TopScoreType[]

    if (!personalRows?.length && baseMapKey instanceof ObjectId) {
      personalRows = (await collections.games
        ?.aggregate(personalPipelineStages({ mapId: baseMapKey.toHexString() }, userId, variant, bucket))
        .toArray()) as TopScoreType[]
    }

    if (personalRows?.length) {
      topScores.push({ ...personalRows[0], highlight: true })
    }
  }

  res.status(200).send(topScores)
}

export default getGameScores
