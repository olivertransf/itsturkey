import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { advanceDuelState } from '@backend/utils/advanceDuelState'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { applyReactiveDeadlineIfNeeded } from '@backend/utils/duelResolve'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { notifyDuelUpdated } from '@backend/utils/pusherNotify'
import { replyWithDuelPayload } from './buildDuelPayload'

const postDuelGuess = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  const lat = Number(req.body?.lat)
  const lng = Number(req.body?.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return throwError(res, 400, 'Invalid coordinates')
  }

  let duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null

  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  const roundsBeforeAdvance = duel.completedRounds
  const { duel: step0, mutated: z0 } = await advanceDuelState(duel)
  duel = step0
  if (z0) {
    await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
    void notifyDuelUpdated(duelId, 'guess')
  }

  const role = duelParticipantRole(duel, userId, anonymousId)

  if (duel.status !== 'in_progress' || duel.completedRounds !== roundsBeforeAdvance) {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  if (!role) {
    return throwError(res, 401, 'You are not part of this duel')
  }

  const now = new Date()

  if (role === 'host' && duel.hostLockedGuess) {
    return throwError(res, 400, 'You have already locked your guess for this round')
  }

  if (role === 'guest' && duel.guestLockedGuess) {
    return throwError(res, 400, 'You have already locked your guess for this round')
  }

  if (duel.roundDeadlineAt && now.getTime() > new Date(duel.roundDeadlineAt).getTime()) {
    const { duel: timedOut, mutated: tMut } = await advanceDuelState(duel)
    duel = timedOut
    if (tMut) {
      await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
      void notifyDuelUpdated(duelId, 'guess')
    }
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  const locked = { lat, lng, lockedAt: now }

  if (role === 'host') {
    duel.hostLockedGuess = locked
  } else {
    duel.guestLockedGuess = locked
  }

  applyReactiveDeadlineIfNeeded(duel, now)

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  const { duel: processed, mutated } = await advanceDuelState(duel)
  duel = processed

  if (mutated) {
    await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
  }

  void notifyDuelUpdated(duelId, 'guess')

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)

  await replyWithDuelPayload(res, duel, duelParticipantRole(duel, userId, anonymousId), mapDetails)
}

export default postDuelGuess
