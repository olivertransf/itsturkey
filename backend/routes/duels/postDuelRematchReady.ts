import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { advanceDuelState } from '@backend/utils/advanceDuelState'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { DUEL_HP_LOCATION_BATCH, DUEL_ROUND_LOCATION_POOL_ID } from '@backend/utils/duelConstants'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import getLocations from '@backend/utils/getLocations'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { notifyDuelUpdated } from '@backend/utils/pusherNotify'
import { replyWithDuelPayload } from './buildDuelPayload'

const rematchLocationCount = (duel: DuelSession): number =>
  duel.mode === 'points' ? Math.max(1, duel.totalRounds ?? duel.locations.length) : DUEL_HP_LOCATION_BATCH

const postDuelRematchReady = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  const load = async () => (await findDuelSessionByInvite(duelId)) as DuelSession | null

  let duel = await load()
  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  const role = duelParticipantRole(duel, userId, anonymousId)
  if (!role) {
    return throwError(res, 401, 'You are not part of this duel')
  }

  if (duel.status !== 'finished') {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  if (!duel.guest.joined) {
    return throwError(res, 400, 'Cannot rematch without an opponent')
  }

  const flagField = role === 'host' ? 'rematchReadyHost' : 'rematchReadyGuest'

  await collections.duelSessions?.updateOne({ _id: duel._id, status: 'finished' }, { $set: { [flagField]: true } })

  void notifyDuelUpdated(duelId, 'rematch')

  duel = await load()
  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  if (duel.status !== 'finished') {
    const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
    await replyWithDuelPayload(res, duel, role, mapDetails)
    return
  }

  if (duel.rematchReadyHost && duel.rematchReadyGuest) {
    const locationCount = rematchLocationCount(duel)
    const newLocations = await getLocations(DUEL_ROUND_LOCATION_POOL_ID, locationCount)
    if (!newLocations?.length) {
      return throwError(res, 503, 'Could not prepare new rounds — try again')
    }

    const resetHost = { ...duel.host, hp: duel.startingHpHost, totalPoints: 0 }
    const resetGuest = { ...duel.guest, hp: duel.startingHpGuest, totalPoints: 0 }

    await collections.duelSessions?.findOneAndUpdate(
      {
        _id: duel._id,
        status: 'finished',
        rematchReadyHost: true,
        rematchReadyGuest: true,
      },
      {
        $set: {
          status: 'in_progress',
          locations: newLocations,
          completedRounds: 0,
          roundResults: [],
          host: resetHost,
          guest: resetGuest,
          roundDeadlineAt: null,
          rematchReadyHost: false,
          rematchReadyGuest: false,
          hostWinMultiplier: 1,
          guestWinMultiplier: 1,
        },
        $unset: {
          outcome: '',
          finishedAt: '',
          hostLockedGuess: '',
          guestLockedGuess: '',
          hostProvisionalPin: '',
          guestProvisionalPin: '',
          recapAckRoundIndex: '',
        },
      },
    )

    void notifyDuelUpdated(duelId, 'rematch')

    duel = await load()
    if (!duel) {
      return throwError(res, 404, 'Duel not found')
    }

    if (duel.status === 'in_progress') {
      const { duel: advanced, mutated } = await advanceDuelState(duel)
      duel = advanced
      if (mutated) {
        await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
        void notifyDuelUpdated(duelId, 'rematch')
        duel = (await load()) as DuelSession
      }
    }
  }

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
  await replyWithDuelPayload(res, duel, role, mapDetails)
}

export default postDuelRematchReady
