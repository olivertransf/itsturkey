import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getUserId, throwError } from '@backend/utils'

const ALLOWED_ACTIVITIES = new Set(['idle', 'browsing', 'in_game', 'in_duel'])

const postUserPresence = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  if (!userId) return throwError(res, 401, 'Unauthorized')

  const raw = typeof req.body?.activity === 'string' ? req.body.activity.trim() : 'idle'
  const activity = ALLOWED_ACTIVITIES.has(raw) ? raw : 'idle'

  await collections.users?.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { lastSeenAt: new Date(), presenceActivity: activity } }
  )

  res.status(200).send({ ok: true })
}

export default postUserPresence
