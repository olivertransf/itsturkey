import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game, MultiSession } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { canAccessGame, collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'

const getMultiSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  if (sessionId.length !== 24) {
    return throwError(res, 404, 'Failed to find multi session')
  }

  const session = (await collections.multiSessions?.findOne({ _id: new ObjectId(sessionId) })) as MultiSession

  if (!session) {
    return throwError(res, 404, 'Failed to find multi session')
  }

  const sessionBelongsToUser = canAccessGame(
    { userId: session.userId?.toString(), anonymousId: session.anonymousId },
    { userId, anonymousId }
  )

  if (!sessionBelongsToUser) {
    return throwError(res, 401, 'You are not authorized to view this multi session')
  }

  const games = (await collections.games
    ?.find({ _id: { $in: session.panelGameIds } })
    .toArray()) as Game[]
  const gameById = new Map(games.map((game) => [game._id?.toString(), game]))
  const panelGames = session.panelGameIds
    .map((gameId) => gameById.get(gameId.toString()))
    .filter(Boolean) as Game[]
  const mapDetails = panelGames[0] ? await getMapFromGame(panelGames[0]) : null
  const panelMapDetails = await Promise.all(panelGames.map((game) => getMapFromGame(game)))

  panelGames.forEach((game, index) => {
    if (panelMapDetails[index]) {
      game.mapDetails = panelMapDetails[index] as Game['mapDetails']
    }
  })

  res.status(200).send({ session, panels: panelGames, mapDetails })
}

export default getMultiSession
