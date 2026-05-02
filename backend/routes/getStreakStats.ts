import { NextApiRequest, NextApiResponse } from 'next'
import { collections, compareObjectIds, getUserId } from '@backend/utils'
import { COUNTRY_STREAKS_ID, EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'
import { ObjectId } from 'mongodb'
import { TopScore } from '@backend/models'

type TopScoreType = TopScore & {
  highlight?: boolean
}

const CLASSIC_LOCATION_COUNT = 250000
const EQUITABLE_LOCATION_COUNT = 125000
const COUNTRY_COUNT = 98

function resolveStreakStatsMapId(queryMapId: unknown): string {
  return queryMapId === EQUITABLE_COUNTRY_STREAK_ID ? EQUITABLE_COUNTRY_STREAK_ID : COUNTRY_STREAKS_ID
}

const getStreakStats = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const streakMapId = resolveStreakStatsMapId(req.query.mapId)
  const locationCount =
    streakMapId === EQUITABLE_COUNTRY_STREAK_ID ? EQUITABLE_LOCATION_COUNT : CLASSIC_LOCATION_COUNT

  const mapLeaderboard = await collections.mapLeaderboard
    ?.aggregate([
      { $match: { mapId: streakMapId } },
      {
        $unwind: '$scores',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'scores.userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $group: {
          _id: '$_id',
          mapId: { $first: '$mapId' },
          avgScore: { $first: '$avgScore' },
          usersPlayed: { $first: '$usersPlayed' },
          scores: {
            $push: {
              gameId: '$scores.gameId',
              userId: '$scores.userId',
              streak: '$scores.totalPoints',
              totalTime: '$scores.totalTime',
              userName: '$userDetails.name',
              userAvatar: '$userDetails.avatar',
            },
          },
        },
      },
    ])
    .toArray()

  if (!mapLeaderboard?.length) {
    return res.status(200).send({
      avgScore: 0,
      usersPlayed: 0,
      locationCount,
      countryCount: COUNTRY_COUNT,
      scores: [],
    })
  }

  const streakStats = mapLeaderboard[0]
  const topScores = streakStats.scores as TopScoreType[]

  const thisUserIndex = topScores.findIndex((topScore) => compareObjectIds(topScore.userId, userId))
  const isUserInTopFive = thisUserIndex !== -1

  if (isUserInTopFive) {
    topScores[thisUserIndex] = { ...topScores[thisUserIndex], highlight: true }
  } else {
    const usersTopScore = (await collections.games
      ?.aggregate([
        {
          $match: {
            mode: 'streak',
            mapId: streakMapId,
            userId: new ObjectId(userId),
            state: 'finished',
          },
        },
        { $sort: { streak: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            gameId: '$_id',
            userId: 1,
            userName: '$userDetails.name',
            userAvatar: '$userDetails.avatar',
            streak: 1,
            totalTime: 1,
          },
        },
      ])
      .toArray()) as TopScoreType[]

    if (usersTopScore?.length) {
      topScores.push({ ...usersTopScore[0], highlight: true })
    }
  }

  res.status(200).send({
    avgScore: streakStats.avgScore,
    usersPlayed: streakStats.usersPlayed,
    locationCount,
    countryCount: COUNTRY_COUNT,
    scores: topScores,
  })
}

export default getStreakStats
