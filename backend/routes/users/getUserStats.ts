import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from '@backend/utils'

const getUserStats = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string
  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).send({ error: { message: 'Invalid user' } })
  }

  const oid = new ObjectId(userId)
  const queryFinishedGames = { userId: oid, state: 'finished', mode: 'standard' }
  const queryFinishedStreakGames = { userId: oid, state: 'finished', mode: 'streak' }

  const gamesPlayed = await collections.games?.find(queryFinishedGames).count()
  const bestGame = await collections.games?.findOne(queryFinishedGames, { sort: { totalPoints: -1 } })
  const averageGameScore = await collections.games
    ?.aggregate([
      { $match: queryFinishedGames },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalPoints' },
        },
      },
    ])
    .toArray()

  const streakGamesPlayed = await collections.games?.find(queryFinishedStreakGames).count()
  const bestStreakGame = await collections.games?.findOne(queryFinishedStreakGames, { sort: { streak: -1 } })

  const dailyChallengeWins = await collections.challenges
    ?.find({ isDailyChallenge: true, 'winner.userId': oid })
    .count()

  const recentGames = await collections.games
    ?.find(queryFinishedGames)
    .sort({ createdAt: -1 })
    .limit(5)
    .project({ totalPoints: 1 })
    .toArray()

  const last5Avg =
    recentGames && recentGames.length > 0
      ? Math.round(recentGames.reduce((sum, game) => sum + (game.totalPoints || 0), 0) / recentGames.length)
      : 0

  const sampleGames = await collections.games
    ?.find(queryFinishedGames)
    .sort({ createdAt: -1 })
    .limit(80)
    .project({ guesses: 1, totalDistance: 1 })
    .toArray()

  let guessCount = 0
  let fiveKCount = 0
  let distanceSum = 0
  let distanceCount = 0

  for (const game of sampleGames || []) {
    const guesses = Array.isArray(game.guesses) ? game.guesses : []
    for (const guess of guesses) {
      guessCount += 1
      if ((guess.points ?? 0) >= 5000) fiveKCount += 1
    }
    const metric = game.totalDistance?.metric
    if (typeof metric === 'number') {
      distanceSum += metric
      distanceCount += 1
    }
  }

  const fiveKRate = guessCount > 0 ? Math.round((fiveKCount / guessCount) * 100) : 0
  const avgMissKm = distanceCount > 0 ? Math.round(distanceSum / distanceCount) : 0

  const duelPlayed = await collections.duelSessions?.countDocuments({
    status: 'finished',
    $or: [{ 'host.userId': oid }, { 'guest.userId': oid }],
  })
  const duelWins = await collections.duelSessions?.countDocuments({
    status: 'finished',
    $or: [
      { 'host.userId': oid, outcome: 'host_win' },
      { 'guest.userId': oid, outcome: 'guest_win' },
    ],
  })
  const duelsFinished = duelPlayed || 0
  const duelWinCount = duelWins || 0
  const duelWinRate = duelsFinished > 0 ? Math.round((duelWinCount / duelsFinished) * 100) : 0

  const avgScore =
    averageGameScore && averageGameScore.length > 0 ? Math.ceil(averageGameScore[0].avgScore) : 0

  const result = [
    { label: 'Games finished', data: gamesPlayed || 0 },
    { label: 'Best score (pts)', data: bestGame?.totalPoints || 0 },
    { label: 'Average score (pts)', data: avgScore },
    { label: 'Last 5 average (pts)', data: last5Avg },
    { label: '5k guesses', data: fiveKCount },
    { label: '5k rate (%)', data: fiveKRate },
    { label: 'Average miss (km)', data: avgMissKm },
    { label: 'Streaks finished', data: streakGamesPlayed || 0 },
    { label: 'Best streak (countries)', data: bestStreakGame?.streak || 0 },
    { label: 'Daily challenge wins', data: dailyChallengeWins || 0 },
    { label: 'Duels finished', data: duelsFinished },
    { label: 'Duel wins', data: duelWinCount },
    { label: 'Duel win rate (%)', data: duelWinRate },
  ]

  res.status(200).send(result)
}

export default getUserStats
