import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'

/**
 * Live duel membership for friend status.
 * Solo/multi unfinished games are ignored — abandoned `started` games would
 * falsely mark friends as in-game forever.
 */
export async function resolveFriendsActiveSessions(
  peerIds: ObjectId[]
): Promise<Map<string, 'in_duel'>> {
  const result = new Map<string, 'in_duel'>()
  if (!peerIds.length) return result

  const duels =
    (await collections.duelSessions
      ?.find({
        status: { $in: ['waiting', 'in_progress'] },
        $or: [{ 'host.userId': { $in: peerIds } }, { 'guest.userId': { $in: peerIds } }],
      })
      .project({ 'host.userId': 1, 'guest.userId': 1 })
      .toArray()) ?? []

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
