import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { collections, getAnonymousGameId, getUserId, isUserBanned, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { buildDuelPayload } from './buildDuelPayload'

const joinDuel = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = userId ? undefined : getAnonymousGameId(req, res)

  const { isBanned } = userId ? await isUserBanned(userId) : { isBanned: false }

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  if (!duelId || duelId.length !== 24) {
    return throwError(res, 404, 'Duel not found')
  }

  let duel = (await collections.duelSessions?.findOne({ _id: new ObjectId(duelId) })) as DuelSession | null

  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  if (duel.status === 'finished') {
    return throwError(res, 400, 'This duel has already finished')
  }

  if (duel.guest.joined) {
    return throwError(res, 400, 'Someone has already joined this duel')
  }

  const existingRole = duelParticipantRole(duel, userId, anonymousId)

  if (existingRole === 'host') {
    return throwError(res, 400, 'You cannot join as guest — you created this duel')
  }

  if (!userId && duel.host.anonymousId && duel.host.anonymousId === anonymousId) {
    return throwError(res, 400, 'Open this link in a different browser or incognito window to play as guest')
  }

  duel.guest = {
    ...duel.guest,
    userId: userId ? new ObjectId(userId) : undefined,
    anonymousId: userId ? undefined : anonymousId,
    joined: true,
    hp: duel.startingHpGuest,
    totalPoints: 0,
  }

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
  const role = duelParticipantRole(duel, userId, anonymousId)

  res.status(200).send(buildDuelPayload(duel, role, mapDetails))
}

export default joinDuel
