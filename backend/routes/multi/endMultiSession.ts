import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { MultiSession } from '@backend/models'
import { canAccessGame, collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'

const endMultiSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  if (sessionId.length !== 24) {
    return throwError(res, 404, 'Failed to find multi session')
  }

  const query = { _id: new ObjectId(sessionId) }
  const session = (await collections.multiSessions?.findOne(query)) as MultiSession

  if (!session) {
    return throwError(res, 404, 'Failed to find multi session')
  }

  const sessionBelongsToUser = canAccessGame(
    { userId: session.userId?.toString(), anonymousId: session.anonymousId },
    { userId, anonymousId }
  )

  if (!sessionBelongsToUser) {
    return throwError(res, 401, 'You are not authorized to modify this multi session')
  }

  const updatedSession: MultiSession = {
    ...session,
    state: 'finished',
    finishedAt: new Date(),
  }

  await collections.multiSessions?.findOneAndUpdate(query, { $set: updatedSession })

  res.status(200).send({ session: updatedSession })
}

export default endMultiSession
