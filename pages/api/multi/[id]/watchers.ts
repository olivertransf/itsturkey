/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { MultiSession } from '@backend/models'
import { listSessionWatchers } from '@backend/utils/listSessionWatchers'
import { canAccessGame, collections, dbConnect, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    if (req.method !== 'GET') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const sessionId = req.query.id as string
    const userId = await getUserId(req, res)
    const anonymousId = getExistingAnonymousGameId(req)

    if (!sessionId || sessionId.length !== 24) {
      return throwError(res, 404, 'Failed to find session')
    }

    const session = (await collections.multiSessions?.findOne({
      _id: new ObjectId(sessionId),
    })) as MultiSession | null
    if (!session) {
      return throwError(res, 404, 'Failed to find session')
    }

    if (
      !canAccessGame(
        { userId: session.userId?.toString(), anonymousId: session.anonymousId },
        { userId, anonymousId }
      )
    ) {
      return throwError(res, 401, 'Unauthorized')
    }

    const watchers = await listSessionWatchers('multi', sessionId)
    return res.status(200).send({ watchers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
