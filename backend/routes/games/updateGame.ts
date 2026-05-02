import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import {
  calculateDistance,
  calculateRoundScore,
  canAccessGame,
  collections,
  getExistingAnonymousGameId,
  getLocations,
  getUserId,
  isUserBanned,
  throwError,
} from '@backend/utils'
import { ChallengeType, DistanceType, GuessType } from '@types'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { getRealCountryCode } from '@utils/helpers/getRealCountryCode'

const triggerScoresUpdate = async (req: NextApiRequest, game: Game) => {
  const host = req.headers.host
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const baseUrl = `${protocol}://${host}`

  await fetch(`${baseUrl}/api/scores/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: process.env.INTERNAL_API_SECRET ?? '',
    },
    body: JSON.stringify({ game }),
  })
}

const updateGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  if (!userId && !anonymousId) {
    return throwError(res, 401, 'Unauthorized')
  }

  const { isBanned } = userId ? await isUserBanned(userId) : { isBanned: false }

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  const getGameQuery = { _id: new ObjectId(gameId) }
  const game = (await collections.games?.findOne(getGameQuery)) as Game

  if (!game) {
    return throwError(res, 500, 'Failed to save your recent guess')
  }

  if (
    !canAccessGame(
      { userId: game.userId?.toString(), anonymousId: game.anonymousId },
      { userId, anonymousId }
    )
  ) {
    return throwError(res, 401, 'You are not authorized to modify this game')
  }

  // End unlimited standard games early (no new guess)
  if (req.body?.endGame === true) {
    if (game.mode !== 'standard' || !game.unlimited) {
      return throwError(res, 400, 'Only unlimited single-player games can be ended this way')
    }

    if (game.state === 'finished') {
      const mapDetails = await getMapFromGame(game)
      return res.status(200).send({ game, mapDetails })
    }

    if (!game.guesses?.length) {
      return throwError(res, 400, 'Play at least one round before ending')
    }

    game.state = 'finished'

    await collections.games?.findOneAndUpdate(getGameQuery, { $set: game })

    const finishedGame = (await collections.games?.findOne(getGameQuery)) as Game
    const mapDetails = await getMapFromGame(finishedGame)

    await triggerScoresUpdate(req, finishedGame)

    return res.status(200).send({ game: finishedGame, mapDetails })
  }

  const { guess, guessTime, localRound, timedOut, timedOutWithGuess, adjustedLocation, streakLocationCode } = req.body

  // Checking if guess has already been submitted for this round
  if (game.guesses.length === localRound) {
    return throwError(res, 400, 'You have already made a guess for this round. Please refresh your browser')
  }

  let isGameFinished = false

  if (game.mode === 'standard') {
    if (!game.unlimited) {
      const total = game.totalRounds ?? game.rounds?.length ?? DEFAULT_TOTAL_ROUNDS
      isGameFinished = game.round === total
    }
  }

  if (game.mode === 'streak') {
    const actualLocation = game.rounds[localRound - 1]

    if (streakLocationCode.toLowerCase() !== getRealCountryCode(actualLocation?.countryCode).toLowerCase()) {
      isGameFinished = true
    } else {
      game.streak++
    }
  }

  game.state = isGameFinished ? 'finished' : 'started'

  if (!isGameFinished) {
    const isStreakGame = game.mode === 'streak'
    const NEW_LOCATIONS_COUNT = 10

    if (isStreakGame && game.challengeId) {
      const query = { _id: new ObjectId(game.challengeId) }
      const challenge = (await collections.challenges?.findOne(query)) as unknown as ChallengeType

      if (localRound >= challenge.locations.length) {
        const newLocations = await getLocations(String(game.mapId), NEW_LOCATIONS_COUNT)

        if (!newLocations) {
          return throwError(res, 400, 'Failed to get new location')
        }

        challenge.locations = challenge.locations.concat(newLocations)

        const updatedChallenge = await collections.challenges?.findOneAndUpdate(query, { $set: challenge })

        if (!updatedChallenge) {
          return throwError(res, 500, 'Failed to get next round')
        }

        game.rounds = game.rounds.concat(newLocations)
      }

      game.rounds = challenge.locations
    }

    if (isStreakGame && !game.challengeId) {
      if (localRound >= game.rounds.length) {
        const newLocations = await getLocations(String(game.mapId), NEW_LOCATIONS_COUNT)

        if (!newLocations) {
          return throwError(res, 400, 'Failed to get new location')
        }

        game.rounds = game.rounds.concat(newLocations)
      }
    }

    if (adjustedLocation) {
      game.rounds[localRound - 1] = adjustedLocation
    }
  }

  const mapDetails = await getMapFromGame(game)

  const metricDistance = calculateDistance(guess, game.rounds[game.round - 1], 'metric')
  const imperialDistance = calculateDistance(guess, game.rounds[game.round - 1], 'imperial')

  const distance: DistanceType = {
    metric: metricDistance,
    imperial: imperialDistance,
  }

  const points = calculateRoundScore(metricDistance, mapDetails?.scoreFactor)

  const newGuess: GuessType = {
    lat: guess.lat,
    lng: guess.lng,
    points: timedOut && !timedOutWithGuess ? 0 : points,
    distance,
    time: Math.floor(guessTime),
    timedOut,
    timedOutWithGuess,
    streakLocationCode,
  }
  game.guesses = game.guesses.concat(newGuess)

  game.round++
  game.totalPoints += timedOut && !timedOutWithGuess ? 0 : points
  game.totalDistance.metric += distance.metric
  game.totalDistance.imperial += distance.imperial
  game.totalTime += Math.floor(guessTime)

  if (game.mode === 'standard' && game.unlimited && !isGameFinished && game.round > game.rounds.length) {
    const BATCH = 10
    const more = await getLocations(String(game.mapId), BATCH)

    if (!more?.length) {
      return throwError(res, 400, 'Failed to get new location')
    }

    game.rounds = game.rounds.concat(more)
  }

  const updatedGame = await collections.games?.findOneAndUpdate(getGameQuery, { $set: game })

  if (!updatedGame) {
    return throwError(res, 500, 'Failed to save your recent guess')
  }

  if (isGameFinished) {
    await triggerScoresUpdate(req, game)
  }

  res.status(200).send({ game, mapDetails })
}

export default updateGame
