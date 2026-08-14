export type FriendPresenceActivity = 'idle' | 'browsing' | 'in_game' | 'in_duel'

export type PresenceSessionKind = 'duel' | 'game' | 'multi'

export type PresenceSession = {
  kind: PresenceSessionKind
  id: string
}

export type FriendRow = {
  id: string
  name: string
  friendCode?: string
  lastSeenAt?: string | null
  presenceActivity?: string
  online?: boolean
  /** Live match pointer when friend is in_game / in_duel (friends list only). */
  presenceSession?: PresenceSession
}

const SESSION_KINDS = new Set<PresenceSessionKind>(['duel', 'game', 'multi'])

export function normalizePresenceSession(raw: unknown): PresenceSession | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const rec = raw as Record<string, unknown>
  const kind = rec.kind
  const id = rec.id
  if (typeof kind !== 'string' || !SESSION_KINDS.has(kind as PresenceSessionKind)) return undefined
  if (typeof id !== 'string') return undefined
  const trimmed = id.trim()
  if (!trimmed || trimmed.length > 80) return undefined
  return { kind: kind as PresenceSessionKind, id: trimmed }
}

export function friendPresenceLabel(friend: Pick<FriendRow, 'online' | 'presenceActivity'>): string {
  if (!friend.online) return 'Inactive'
  if (friend.presenceActivity === 'in_duel') return 'In a duel'
  if (friend.presenceActivity === 'in_game') return 'In a game'
  return 'Online'
}

export function friendIsInGame(friend: Pick<FriendRow, 'online' | 'presenceActivity'>): boolean {
  return Boolean(
    friend.online &&
      (friend.presenceActivity === 'in_game' || friend.presenceActivity === 'in_duel')
  )
}

/** Spectate URL when the friend is in a watchable live session. */
export function friendWatchHref(friend: FriendRow): string | null {
  if (!friend.online) return null
  const session = friend.presenceSession
  if (!session) return null
  if (session.kind === 'duel' && friend.presenceActivity === 'in_duel') {
    return `/duel/${encodeURIComponent(session.id)}?spectate=1&follow=${encodeURIComponent(friend.id)}`
  }
  if (session.kind === 'game' && friend.presenceActivity === 'in_game') {
    return `/game/${encodeURIComponent(session.id)}?spectate=1`
  }
  return null
}

/** In-game / duel first, then other active, then inactive; name within each group. */
export function sortFriendsByPresence(friends: FriendRow[]): FriendRow[] {
  const rank = (f: FriendRow) => {
    if (f.online && f.presenceActivity === 'in_duel') return 0
    if (f.online && f.presenceActivity === 'in_game') return 1
    if (f.online) return 2
    return 3
  }

  return [...friends].sort((a, b) => {
    const diff = rank(a) - rank(b)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}
