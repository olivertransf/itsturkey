import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'

export type DerivedFriendActivity = 'in_game' | 'in_duel'

/**
 * Authoritative session lookups for friends who are currently online.
 * Returns peer id hex → activity (duel beats solo/multi).
 */
export async function resolveFriendsActiveSessions(
  peerIds: ObjectId[]
): Promise<Map<string, DerivedFriendActivity>> {
  const result = new Map<string, DerivedFriendActivity>()
  if (!peerIds.length) return result

  const [duels, games, multi] = await Promise.all([
    collections.duelSessions
      ?.find({
        status: { $in: ['waiting', 'in_progress'] },
        $or: [{ 'host.userId': { $in: peerIds } }, { 'guest.userId': { $in: peerIds } }],
      })
      .project({ 'host.userId': 1, 'guest.userId': 1 })
      .toArray() ?? [],
    collections.games
      ?.find({ userId: { $in: peerIds }, state: 'started' })
      .project({ userId: 1 })
      .toArray() ?? [],
    collections.multiSessions
      ?.find({ userId: { $in: peerIds }, state: 'started' })
      .project({ userId: 1 })
      .toArray() ?? [],
  ])

  for (const game of games) {
    const id = game.userId instanceof ObjectId ? game.userId.toHexString() : null
    if (id) result.set(id, 'in_game')
  }

  for (const session of multi) {
    const id = session.userId instanceof ObjectId ? session.userId.toHexString() : null
    if (id) result.set(id, 'in_game')
  }

  for (const duel of duels) {
    const hostId =
      duel.host?.userId instanceof ObjectId ? duel.host.userId.toHexString() : null
    const guestId =
      duel.guest?.userId instanceof ObjectId ? duel.guest.userId.toHexString() : null
    if (hostId) result.set(hostId, 'in_duel')
    if (guestId) result.set(guestId, 'in_duel')
  }

  return result
}
