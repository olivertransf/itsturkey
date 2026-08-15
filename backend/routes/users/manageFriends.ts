import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import type FriendshipEdge from '@backend/models/friendship'
import { collections, getUserId, throwError } from '@backend/utils'
import { PRESENCE_ONLINE_WINDOW_MS, normalizePresenceSession, sortFriendsByPresence } from '@utils/friends/friendPresence'

function sortedPair(a: ObjectId, b: ObjectId): { low: ObjectId; high: ObjectId } {
  const as = a.toHexString()
  const bs = b.toHexString()
  return as <= bs ? { low: a, high: b } : { low: b, high: a }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const listFriends = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  if (!userId) return throwError(res, 401, 'Unauthorized')

  const me = new ObjectId(userId)
  const edges =
    (await collections.friendships
      ?.find({ $or: [{ low: me }, { high: me }] })
      .toArray()) ?? []

  const peerIds = edges.map((e: FriendshipEdge) => (e.low.equals(me) ? e.high : e.low))
  if (!peerIds.length) {
    return res.status(200).send([])
  }

  const users =
    (await collections.users
      ?.find({ _id: { $in: peerIds } })
      .project({ name: 1, friendCode: 1, lastSeenAt: 1, presenceActivity: 1, presenceSession: 1 })
      .toArray()) ?? []

  const now = Date.now()
  const onlineWindowMs = PRESENCE_ONLINE_WINDOW_MS

  const rows = users.map((u) => {
    const id = u._id.toHexString()
    const lastSeenAt =
      u.lastSeenAt instanceof Date
        ? u.lastSeenAt.toISOString()
        : u.lastSeenAt
          ? new Date(u.lastSeenAt as Date).toISOString()
          : null
    const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0
    const online = lastSeenMs > 0 && now - lastSeenMs < onlineWindowMs

    let presenceActivity =
      typeof u.presenceActivity === 'string' ? u.presenceActivity : undefined

    // Heartbeat only — abandoned waiting/in_progress duel rows must not stick "In a duel".
    if (!online) {
      presenceActivity = undefined
    } else if (
      presenceActivity === 'in_game' ||
      presenceActivity === 'in_duel' ||
      presenceActivity === 'spectating' ||
      presenceActivity === 'idle'
    ) {
      // keep live heartbeat activity
    } else {
      presenceActivity = 'browsing'
    }

    const presenceSession =
      online &&
      (presenceActivity === 'in_game' ||
        presenceActivity === 'in_duel' ||
        presenceActivity === 'spectating')
        ? normalizePresenceSession((u as { presenceSession?: unknown }).presenceSession)
        : undefined

    return {
      id,
      name: u.name,
      friendCode: typeof u.friendCode === 'string' ? u.friendCode : undefined,
      lastSeenAt,
      presenceActivity,
      online,
      ...(presenceSession ? { presenceSession } : {}),
    }
  })

  res.status(200).send(sortFriendsByPresence(rows))
}

export const addFriend = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  if (!userId) return throwError(res, 401, 'Unauthorized')

  const raw = typeof req.body?.identifier === 'string' ? req.body.identifier.trim() : ''
  if (!raw) return throwError(res, 400, 'Enter a friend code, email, or display name')

  const me = new ObjectId(userId)

  let peer = await collections.users?.findOne({
    friendCode: new RegExp(`^${escapeRegex(raw)}$`, 'i'),
  })

  if (!peer && raw.includes('@')) {
    peer = await collections.users?.findOne({
      email: new RegExp(`^${escapeRegex(raw)}$`, 'i'),
    })
  }

  if (!peer) {
    const byName = await collections.users
      ?.find({ name: new RegExp(`^${escapeRegex(raw)}$`, 'i') })
      .limit(2)
      .toArray()
    if (byName?.length === 1) peer = byName[0]
    if (byName && byName.length > 1) {
      return throwError(res, 400, 'Multiple players use that name — try email or friend code')
    }
  }

  if (!peer?._id) {
    return throwError(res, 404, 'No player matched that friend code, email, or name')
  }

  if (peer._id.equals(me)) {
    return throwError(res, 400, 'You cannot add yourself')
  }

  const { low, high } = sortedPair(me, peer._id)

  await collections.friendships?.updateOne(
    { low, high },
    { $setOnInsert: { low, high, createdAt: new Date() } },
    { upsert: true }
  )

  res.status(200).send({
    id: peer._id.toHexString(),
    name: peer.name,
    friendCode: typeof peer.friendCode === 'string' ? peer.friendCode : undefined,
  })
}

export const removeFriend = async (req: NextApiRequest, res: NextApiResponse, peerHex: string) => {
  const userId = await getUserId(req, res)
  if (!userId) return throwError(res, 401, 'Unauthorized')

  if (!ObjectId.isValid(peerHex)) {
    return throwError(res, 400, 'Invalid friend id')
  }

  const me = new ObjectId(userId)
  const peer = new ObjectId(peerHex)
  const { low, high } = sortedPair(me, peer)

  await collections.friendships?.deleteOne({ low, high })
  res.status(200).send({ ok: true })
}
