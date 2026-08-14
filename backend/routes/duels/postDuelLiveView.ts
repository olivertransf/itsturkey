import { NextApiRequest, NextApiResponse } from 'next'
import type DuelSession from '@backend/models/duelSession'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { normalizeStreetViewLiveView } from '@utils/helpers/streetViewLiveView'

const postDuelLiveView = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  const liveView = normalizeStreetViewLiveView(req.body?.liveView ?? req.body)
  if (!liveView) {
    return throwError(res, 400, 'Invalid live view')
  }

  const duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null
  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  if (duel.status !== 'in_progress') {
    return res.status(200).send({ ok: true })
  }

  const role = duelParticipantRole(duel, userId, anonymousId)
  if (role !== 'host' && role !== 'guest') {
    return throwError(res, 401, 'You are not part of this duel')
  }

  await collections.duelSessions?.updateOne(
    { _id: duel._id },
    {
      $set: {
        [`liveViews.${role}`]: {
          ...liveView,
          updatedAt: new Date(),
        },
      },
    }
  )

  return res.status(200).send({ ok: true })
}

export default postDuelLiveView
