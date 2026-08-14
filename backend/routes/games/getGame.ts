import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { areUsersFriends } from '@backend/utils/areUsersFriends'
import { canAccessGame, collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import { userProject } from '@backend/utils/dbProjects'

/** Hide unplayed future locations from spectators while the game is live. */
const redactGameForSpectator = (game: Game): Game => {
  if (game.state === 'finished') return game
  const rounds = Array.isArray(game.rounds) ? game.rounds : []
  const guessesLen = Array.isArray(game.guesses) ? game.guesses.length : 0
  const keep = Math.min(rounds.length, Math.max(guessesLen + 1, game.round || 1))
  return { ...game, rounds: rounds.slice(0, keep) }
}

const getGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)
  const spectate = req.query.spectate === '1'

  if (gameId.length !== 24) {
    return throwError(res, 404, 'Failed to find game')
  }

  const game = (await collections.games?.findOne({ _id: new ObjectId(gameId) })) as Game

  if (!game) {
    return throwError(res, 404, 'Failed to find game')
  }

  const gameBelongsToUser = canAccessGame(
    { userId: game.userId?.toString(), anonymousId: game.anonymousId },
    { userId, anonymousId }
  )
  const mapDetails = await getMapFromGame(game)

  if (game.userId) {
    const userDetails = await collections.users?.findOne({ _id: game.userId }, { projection: userProject })
    game.userDetails = userDetails as Game['userDetails']
  }

  if (spectate) {
    if (!userId) {
      return throwError(res, 401, 'Sign in to spectate')
    }

    if (gameBelongsToUser) {
      return res.status(200).send({ game, gameBelongsToUser: true, isSpectator: false, mapDetails })
    }

    if (!game.userId) {
      return throwError(res, 403, 'This game cannot be spectated')
    }

    const friends = await areUsersFriends(userId, game.userId.toString())
    if (!friends) {
      return throwError(res, 403, 'Only friends can spectate this game')
    }

    const safeGame = redactGameForSpectator(game)
    return res.status(200).send({
      game: safeGame,
      gameBelongsToUser: false,
      isSpectator: true,
      mapDetails,
    })
  }

  res.status(200).send({ game, gameBelongsToUser, mapDetails })
}

export default getGame
