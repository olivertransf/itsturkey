import { ObjectId } from 'mongodb'
import type { TopScore } from '@backend/models'
import { collections } from '@backend/utils'

/** Per user: worst game (lowest points; ties break on longer time). Then take the worst 5 players. */
const lowestScoresStagesAfterMatch = (limit: number) => [
  { $sort: { totalPoints: 1, totalTime: -1 } },
  {
    $group: {
      _id: '$userId',
      gameId: { $first: '$_id' },
      totalTime: { $first: '$totalTime' },
      totalPoints: { $first: '$totalPoints' },
    },
  },
  { $sort: { totalPoints: 1, totalTime: -1 } },
  { $limit: limit },
  {
    $project: {
      _id: 0,
      gameId: '$gameId',
      userId: '$_id',
      totalPoints: 1,
      totalTime: 1,
    },
  },
]

export const queryLowestScores = async (query: Record<string, unknown>, limit: number) => {
  const data = await collections.games
    ?.aggregate([
      { $match: { ...query, notForLeaderboard: { $ne: true } } },
      ...lowestScoresStagesAfterMatch(limit),
    ])
    .toArray()

  return data as TopScore[] | undefined
}

export async function queryLowestScoresMultiMap(
  mapIds: ObjectId[],
  limit: number,
  query: Record<string, unknown>
): Promise<TopScore[] | undefined> {
  if (!mapIds.length) return undefined

  const data = await collections.games
    ?.aggregate([
      { $match: { ...query, mapId: { $in: mapIds }, notForLeaderboard: { $ne: true } } },
      ...lowestScoresStagesAfterMatch(limit),
    ])
    .toArray()

  return data as TopScore[] | undefined
}
