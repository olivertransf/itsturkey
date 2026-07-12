export type FriendPresenceActivity = 'idle' | 'browsing' | 'in_game' | 'in_duel'

export type FriendRow = {
  id: string
  name: string
  friendCode?: string
  lastSeenAt?: string | null
  presenceActivity?: string
  online?: boolean
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
