import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import {
  collections,
  getAnonymousGameId,
  getUserId,
  isUserBanned,
  throwError,
} from '@backend/utils'
import {
  notifyDuelUpdated,
  notifyUserDuelInviteRemoved,
} from '@backend/utils/pusherNotify'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { fetchUserDisplayName, sanitizeDuelDisplayName } from '@backend/utils/resolveDuelPlayerNames'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { replyWithDuelPayload } from './buildDuelPayload'

const joinDuel = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = userId ? undefined : getAnonymousGameId(req, res)

  const { isBanned } = userId ? await isUserBanned(userId) : { isBanned: false }

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  let duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null

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
    return throwError(res, 400, 'You cannot join as the second player — you created this duel')
  }

  if (!userId && duel.host.anonymousId && duel.host.anonymousId === anonymousId) {
    return throwError(res, 400, 'Open this link in a different browser or incognito window to play as the second player')
  }

  let guestDisplayName: string | undefined
  if (userId) {
    guestDisplayName = (await fetchUserDisplayName(userId)) ?? undefined
  } else if (anonymousId) {
    guestDisplayName = sanitizeDuelDisplayName(req.body?.displayName)
  }

  duel.guest = {
    ...duel.guest,
    userId: userId ? new ObjectId(userId) : undefined,
    anonymousId: userId ? undefined : anonymousId,
    displayName: guestDisplayName,
    joined: true,
    hp: duel.startingHpGuest,
    totalPoints: 0,
  }

  const pendingInvites =
    (await collections.duelFriendInvites
      ?.find({ duelObjectId: duel._id, consumedAt: null })
      .toArray()) ?? []

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  await collections.duelFriendInvites?.updateMany(
    { duelObjectId: duel._id, consumedAt: null },
    { $set: { consumedAt: new Date() } }
  )

  for (const row of pendingInvites) {
    const recipientId = row.recipientUserId?.toHexString?.()
    const inviteRowId = row._id?.toHexString?.()
    if (recipientId && inviteRowId) {
      void notifyUserDuelInviteRemoved(recipientId, inviteRowId)
    }
  }

  void notifyDuelUpdated(duelId, 'join')

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
  const role = duelParticipantRole(duel, userId, anonymousId)

  await replyWithDuelPayload(res, duel, role, mapDetails)
}

export default joinDuel
