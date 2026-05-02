import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { canAccessGame, collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import { userProject } from '@backend/utils/dbProjects'

const getGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

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

  res.status(200).send({ game, gameBelongsToUser, mapDetails })
}

export default getGame
