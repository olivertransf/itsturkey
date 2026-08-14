import {
  friendIsInGame,
  friendPresenceLabel,
  friendWatchHref,
  normalizePresenceSession,
  sortFriendsByPresence,
} from '@utils/friends/friendPresence'
import type { FriendRow } from '@utils/friends/friendPresence'

const base = (overrides: Partial<FriendRow>): FriendRow => ({
  id: '1',
  name: 'Ada',
  online: false,
  ...overrides,
})

describe('friendPresenceLabel', () => {
  test('labels inactive, online, and in-game states', () => {
    expect(friendPresenceLabel(base({ online: false }))).toBe('Inactive')
    expect(friendPresenceLabel(base({ online: true }))).toBe('Online')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'browsing' }))).toBe('Online')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'in_game' }))).toBe('In a game')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'in_duel' }))).toBe('In a duel')
  })
})

describe('friendIsInGame', () => {
  test('requires online plus game or duel activity', () => {
    expect(friendIsInGame(base({ online: true, presenceActivity: 'in_game' }))).toBe(true)
    expect(friendIsInGame(base({ online: false, presenceActivity: 'in_game' }))).toBe(false)
    expect(friendIsInGame(base({ online: true, presenceActivity: 'browsing' }))).toBe(false)
  })
})

describe('friendWatchHref', () => {
  test('returns duel and solo spectate links for live sessions', () => {
    expect(
      friendWatchHref(
        base({
          online: true,
          presenceActivity: 'in_duel',
          presenceSession: { kind: 'duel', id: 'ABC12' },
        })
      )
    ).toBe('/duel/ABC12?spectate=1&follow=1')

    expect(
      friendWatchHref(
        base({
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'game', id: 'aaaaaaaaaaaaaaaaaaaaaaaa' },
        })
      )
    ).toBe('/game/aaaaaaaaaaaaaaaaaaaaaaaa?spectate=1')

    expect(
      friendWatchHref(
        base({
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'multi', id: 'm1' },
        })
      )
    ).toBeNull()

    expect(
      friendWatchHref(
        base({
          online: false,
          presenceActivity: 'in_duel',
          presenceSession: { kind: 'duel', id: 'ABC12' },
        })
      )
    ).toBeNull()
  })
})

describe('normalizePresenceSession', () => {
  test('accepts duel/game/multi ids and rejects junk', () => {
    expect(normalizePresenceSession({ kind: 'duel', id: ' x ' })).toEqual({ kind: 'duel', id: 'x' })
    expect(normalizePresenceSession({ kind: 'game', id: 'abc' })).toEqual({ kind: 'game', id: 'abc' })
    expect(normalizePresenceSession({ kind: 'nope', id: 'abc' })).toBeUndefined()
    expect(normalizePresenceSession(null)).toBeUndefined()
  })
})

describe('sortFriendsByPresence', () => {
  test('orders duel, game, online, then offline', () => {
    const sorted = sortFriendsByPresence([
      base({ id: 'o', name: 'Zoe', online: false }),
      base({ id: 'on', name: 'Bob', online: true }),
      base({ id: 'g', name: 'Cara', online: true, presenceActivity: 'in_game' }),
      base({ id: 'd', name: 'Dan', online: true, presenceActivity: 'in_duel' }),
    ])
    expect(sorted.map((f) => f.id)).toEqual(['d', 'g', 'on', 'o'])
  })
})
