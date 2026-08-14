/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { Game } from '@backend/models'
import { listSessionWatchers } from '@backend/utils/listSessionWatchers'
import { canAccessGame, collections, dbConnect, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    if (req.method !== 'GET') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const gameId = req.query.id as string
    const userId = await getUserId(req, res)
    const anonymousId = getExistingAnonymousGameId(req)

    if (!gameId || gameId.length !== 24) {
      return throwError(res, 404, 'Failed to find game')
    }

    const game = (await collections.games?.findOne({ _id: new ObjectId(gameId) })) as Game | null
    if (!game) {
      return throwError(res, 404, 'Failed to find game')
    }

    if (
      !canAccessGame(
        { userId: game.userId?.toString(), anonymousId: game.anonymousId },
        { userId, anonymousId }
      )
    ) {
      return throwError(res, 401, 'Unauthorized')
    }

    const watchers = await listSessionWatchers('game', gameId)
    return res.status(200).send({ watchers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
