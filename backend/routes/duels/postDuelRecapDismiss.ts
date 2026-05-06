import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { advanceDuelState } from '@backend/utils/advanceDuelState'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { notifyDuelUpdated } from '@backend/utils/pusherNotify'
import { replyWithDuelPayload } from './buildDuelPayload'

const postDuelRecapDismiss = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  const roundIndexRaw = req.body?.roundIndex
  const roundIndex = typeof roundIndexRaw === 'number' ? roundIndexRaw : Number(roundIndexRaw)

  if (!Number.isFinite(roundIndex) || roundIndex < 0 || !Number.isInteger(roundIndex)) {
    return throwError(res, 400, 'Invalid round index')
  }

  let duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null

  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  const { duel: stepped, mutated: z0 } = await advanceDuelState(duel)
  duel = stepped
  if (z0) {
    await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
    void notifyDuelUpdated(duelId, 'pin_state')
  }

  const role = duelParticipantRole(duel, userId, anonymousId)

  if (!role) {
    return throwError(res, 401, 'You are not part of this duel')
  }

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)

  if (duel.status !== 'in_progress') {
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  const last =
    duel.roundResults.length > 0 ? duel.roundResults[duel.roundResults.length - 1] ?? null : null

  if (!last || last.roundIndex !== roundIndex) {
    return throwError(res, 400, 'Invalid recap round')
  }

  const prev = duel.recapAckRoundIndex ?? -1
  duel.recapAckRoundIndex = Math.max(prev, roundIndex)

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  void notifyDuelUpdated(duelId, 'recap_dismiss')

  await replyWithDuelPayload(res, duel, role, mapDetails)
}

export default postDuelRecapDismiss
