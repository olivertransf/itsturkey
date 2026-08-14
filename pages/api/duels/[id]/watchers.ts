/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import type DuelSession from '@backend/models/duelSession'
import { listSessionWatchers } from '@backend/utils/listSessionWatchers'
import { dbConnect, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    if (req.method !== 'GET') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const duelId = req.query.id as string
    const userId = await getUserId(req, res)
    const anonymousId = getExistingAnonymousGameId(req)

    const duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null
    if (!duel) {
      return throwError(res, 404, 'Duel not found')
    }

    const role = duelParticipantRole(duel, userId, anonymousId)
    if (role !== 'host' && role !== 'guest') {
      return throwError(res, 401, 'Unauthorized')
    }

    const sessionIds = [duelId, duel.shortCode, duel._id?.toString() ?? ''].filter(Boolean)
    const watchers = await listSessionWatchers('duel', sessionIds)
    return res.status(200).send({ watchers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
