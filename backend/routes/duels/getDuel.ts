import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { advanceDuelState } from '@backend/utils/advanceDuelState'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { replyWithDuelPayload } from './buildDuelPayload'

const getDuel = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  let duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null

  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  const role = duelParticipantRole(duel, userId, anonymousId)

  if (role === null && !(duel.status === 'waiting' && !duel.guest.joined)) {
    return throwError(res, 401, 'You are not part of this duel')
  }

  const { duel: processed, mutated } = await advanceDuelState(duel)

  duel = processed

  if (mutated) {
    await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)
  }

  const fakeGame = { mapId: duel.mapId } as unknown as Game
  const mapDetails = await getMapFromGame(fakeGame)

  await replyWithDuelPayload(res, duel, role, mapDetails)
}

export default getDuel
