export type FriendPresenceActivity = 'idle' | 'browsing' | 'in_game' | 'in_duel' | 'spectating'

export type PresenceSessionKind = 'duel' | 'game' | 'multi'

export type PresenceSession = {
  kind: PresenceSessionKind
  id: string
  mode?: 'standard' | 'streak'
  duelStatus?: 'waiting' | 'in_progress'
}

export type FriendRow = {
  id: string
  name: string
  friendCode?: string
  lastSeenAt?: string | null
  presenceActivity?: string
  online?: boolean
  presenceSession?: PresenceSession
}

export const PRESENCE_ONLINE_WINDOW_MS = 45_000

const SESSION_KINDS = new Set<PresenceSessionKind>(['duel', 'game', 'multi'])
const SESSION_MODES = new Set(['standard', 'streak'])
const DUEL_STATUSES = new Set(['waiting', 'in_progress'])

export function normalizePresenceSession(raw: unknown): PresenceSession | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const rec = raw as Record<string, unknown>
  const kind = rec.kind
  const id = rec.id
  if (typeof kind !== 'string' || !SESSION_KINDS.has(kind as PresenceSessionKind)) return undefined
  if (typeof id !== 'string') return undefined
  const trimmed = id.trim()
  if (!trimmed || trimmed.length > 80) return undefined
  const next: PresenceSession = { kind: kind as PresenceSessionKind, id: trimmed }
  if (typeof rec.mode === 'string' && SESSION_MODES.has(rec.mode)) {
    next.mode = rec.mode as 'standard' | 'streak'
  }
  if (typeof rec.duelStatus === 'string' && DUEL_STATUSES.has(rec.duelStatus)) {
    next.duelStatus = rec.duelStatus as 'waiting' | 'in_progress'
  }
  return next
}

export function friendPresenceLabel(
  friend: Pick<FriendRow, 'online' | 'presenceActivity' | 'presenceSession'>
): string {
  if (!friend.online) return 'Offline'
  const act = friend.presenceActivity
  const sess = friend.presenceSession
  if (act === 'idle') return 'Away'
  if (act === 'in_duel') {
    if (sess?.duelStatus === 'waiting') return 'In a duel lobby'
    return 'In a duel'
  }
  if (act === 'in_game') {
    if (sess?.kind === 'multi') return 'In MultiGuessr'
    if (sess?.mode === 'streak') return 'On a streak'
    return 'In a game'
  }
  if (act === 'spectating') {
    if (sess?.kind === 'multi') return 'Watching MultiGuessr'
    if (sess?.kind === 'duel') return 'Watching a duel'
    if (sess?.mode === 'streak') return 'Watching a streak'
    return 'Watching a game'
  }
  return 'Online'
}

export function friendIsInGame(friend: Pick<FriendRow, 'online' | 'presenceActivity'>): boolean {
  return Boolean(
    friend.online && (friend.presenceActivity === 'in_game' || friend.presenceActivity === 'in_duel')
  )
}

export function friendIsInSession(
  friend: Pick<FriendRow, 'online' | 'presenceActivity'>
): boolean {
  return Boolean(
    friend.online &&
      (friend.presenceActivity === 'in_game' ||
        friend.presenceActivity === 'in_duel' ||
        friend.presenceActivity === 'spectating')
  )
}

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
  if (session.kind === 'multi' && friend.presenceActivity === 'in_game') {
    return `/multi/${encodeURIComponent(session.id)}?spectate=1`
  }
  return null
}

export type SpectateFollowDecision = { action: 'stay' } | { action: 'follow'; href: string } | { action: 'kick' }

export function spectateFollowDecision(
  owner: Pick<FriendRow, 'id' | 'online' | 'presenceActivity' | 'presenceSession'> | null | undefined,
  current: { kind: PresenceSessionKind; id: string }
): SpectateFollowDecision {
  if (!owner || !owner.online) return { action: 'kick' }
  const act = owner.presenceActivity
  if (act === 'browsing' || act === 'idle' || !act) return { action: 'kick' }

  const sess = owner.presenceSession
  if (sess && sess.kind === current.kind && sess.id === current.id) return { action: 'stay' }

  const href = friendWatchHref({
    id: owner.id,
    name: '',
    online: owner.online,
    presenceActivity: owner.presenceActivity,
    presenceSession: owner.presenceSession,
  })
  if (href) return { action: 'follow', href }
  return { action: 'kick' }
}

export function sortFriendsByPresence(friends: FriendRow[]): FriendRow[] {
  const rank = (f: FriendRow) => {
    if (!f.online) return 8
    if (f.presenceActivity === 'in_duel' && f.presenceSession?.duelStatus === 'waiting') return 1
    if (f.presenceActivity === 'in_duel') return 0
    if (f.presenceActivity === 'in_game' && f.presenceSession?.kind === 'multi') return 2
    if (f.presenceActivity === 'in_game' && f.presenceSession?.mode === 'streak') return 3
    if (f.presenceActivity === 'in_game') return 4
    if (f.presenceActivity === 'spectating') return 5
    if (f.presenceActivity === 'idle') return 7
    return 6
  }

  return [...friends].sort((a, b) => {
    const diff = rank(a) - rank(b)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}
