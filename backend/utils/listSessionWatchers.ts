import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'
import { PRESENCE_ONLINE_WINDOW_MS } from '@utils/friends/friendPresence'
import type { PresenceSessionKind } from '@utils/friends/friendPresence'

export type SessionWatcher = {
  id: string
  name: string
}

const ONLINE_MS = PRESENCE_ONLINE_WINDOW_MS

/** Users currently heartbeating as spectators of this match session. */
export async function listSessionWatchers(
  kind: PresenceSessionKind,
  sessionIds: string | string[]
): Promise<SessionWatcher[]> {
  const ids = (Array.isArray(sessionIds) ? sessionIds : [sessionIds])
    .map((id) => id.trim())
    .filter(Boolean)
  if (!ids.length) return []

  const cutoff = new Date(Date.now() - ONLINE_MS)
  const rows = await collections.users
    ?.find({
      presenceActivity: 'spectating',
      'presenceSession.kind': kind,
      'presenceSession.id': { $in: ids },
      lastSeenAt: { $gte: cutoff },
    })
    .project({ name: 1 })
    .limit(12)
    .toArray()

  if (!rows?.length) return []

  return rows.map((u) => ({
    id: (u._id as ObjectId).toString(),
    name: typeof u.name === 'string' && u.name.trim() ? u.name.trim() : 'Friend',
  }))
}
