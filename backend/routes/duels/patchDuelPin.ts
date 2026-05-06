import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { advanceDuelState } from '@backend/utils/advanceDuelState'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { DUEL_PIN_MIN_INTERVAL_MS } from '@backend/utils/duelConstants'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { notifyDuelUpdated } from '@backend/utils/pusherNotify'
import { replyWithDuelPayload } from './buildDuelPayload'

const patchDuelPin = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { duel: advanced, mutated: m0 } = await advanceDuelState(duel)
  duel = advanced
  if (m0) {
    await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
  }

  if (duel.status !== 'in_progress') {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    const role = duelParticipantRole(duel, userId, anonymousId)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  const role = duelParticipantRole(duel, userId, anonymousId)

  if (!role) {
    return throwError(res, 401, 'You are not part of this duel')
  }

  if (role === 'host' && duel.hostLockedGuess) {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  if (role === 'guest' && duel.guestLockedGuess) {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  const prev = role === 'host' ? duel.hostProvisionalPin : duel.guestProvisionalPin

  if (prev) {
    const delta = Date.now() - new Date(prev.at).getTime()
    if (delta < DUEL_PIN_MIN_INTERVAL_MS) {
      const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
      await replyWithDuelPayload(res, duel, role, mapDetails)
      return
    }
  }

  const snapshot = { lat, lng, at: new Date() }

  if (role === 'host') {
    duel.hostProvisionalPin = snapshot
  } else {
    duel.guestProvisionalPin = snapshot
  }

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  const { duel: processed, mutated } = await advanceDuelState(duel)
  duel = processed

  if (mutated) {
    await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
    void notifyDuelUpdated(duelId, 'pin_state')
  }

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)

  await replyWithDuelPayload(res, duel, role, mapDetails)
}

export default patchDuelPin
