import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import type DuelSession from '@backend/models/duelSession'
import { collections, getUserId, throwError } from '@backend/utils'
import { fetchUserDisplayName } from '@backend/utils/resolveDuelPlayerNames'
import { areUsersFriends } from '@backend/utils/areUsersFriends'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { notifyUserDuelInviteCreated } from '@backend/utils/pusherNotify'

const INVITE_TTL_MS = 30 * 60 * 1000

const postDuelInviteFriend = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelSegment = req.query.id as string
  const userId = await getUserId(req, res)

  if (!userId) {
    return throwError(res, 401, 'Sign in to invite friends')
  }

  const peerHex = typeof req.body?.peerId === 'string' ? req.body.peerId.trim() : ''
  if (!peerHex || !ObjectId.isValid(peerHex)) {
    return throwError(res, 400, 'Invalid friend')
  }

  if (peerHex === userId) {
    return throwError(res, 400, 'You cannot invite yourself')
  }

  const duel = (await findDuelSessionByInvite(duelSegment)) as DuelSession | null
  if (!duel?._id) {
    return throwError(res, 404, 'Duel not found')
  }

  if (duel.status !== 'waiting' || duel.guest.joined) {
    return throwError(res, 400, 'This duel is not accepting invites')
  }

  const role = duelParticipantRole(duel, userId, undefined)
  if (role !== 'host') {
    return throwError(res, 403, 'Only the host can invite friends')
  }

  const friends = await areUsersFriends(userId, peerHex)
  if (!friends) {
    return throwError(res, 403, 'You can only invite people on your friends list')
  }

  let hostDisplayName = (await fetchUserDisplayName(userId)) ?? 'Friend'
  hostDisplayName = hostDisplayName.trim() || 'Friend'

  const now = new Date()
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS)

  await collections.duelFriendInvites?.deleteMany({
    duelObjectId: duel._id,
    recipientUserId: new ObjectId(peerHex),
    consumedAt: null,
  })

  const inserted = await collections.duelFriendInvites?.insertOne({
    inviteSegment: duelSegment,
    duelObjectId: duel._id,
    hostUserId: new ObjectId(userId),
    recipientUserId: new ObjectId(peerHex),
    hostDisplayName,
    createdAt: now,
    expiresAt,
    dismissedAt: null,
    consumedAt: null,
  })

  const inviteRowId = inserted?.insertedId?.toHexString()
  if (inviteRowId) {
    void notifyUserDuelInviteCreated(peerHex, {
      id: inviteRowId,
      hostName: hostDisplayName,
      inviteSegment: duelSegment,
      createdAt: now.toISOString(),
    })
  }

  res.status(200).send({ ok: true })
}

export default postDuelInviteFriend
