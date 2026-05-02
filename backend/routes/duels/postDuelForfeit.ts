import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { buildDuelPayload } from './buildDuelPayload'

const postDuelForfeit = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  const duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null

  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  if (duel.status === 'finished') {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    const role = duelParticipantRole(duel, userId, anonymousId)
    return res.status(200).send(buildDuelPayload(duel, role, mapDetails))
  }

  const role = duelParticipantRole(duel, userId, anonymousId)

  if (!role) {
    return throwError(res, 401, 'You are not part of this duel')
  }

  duel.status = 'finished'
  duel.finishedAt = new Date()
  duel.outcome = role === 'host' ? 'guest_win' : 'host_win'
  duel.roundDeadlineAt = null

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)

  res.status(200).send(buildDuelPayload(duel, role, mapDetails))
}

export default postDuelForfeit
