import {
  friendIsInGame,
  friendPresenceLabel,
  friendWatchHref,
  normalizePresenceSession,
  sortFriendsByPresence,
  spectateFollowDecision,
} from '@utils/friends/friendPresence'
import type { FriendRow } from '@utils/friends/friendPresence'

const base = (overrides: Partial<FriendRow>): FriendRow => ({
  id: '1',
  name: 'Ada',
  online: false,
  ...overrides,
})

describe('friendPresenceLabel', () => {
  test('labels offline, away, online, and session states', () => {
    expect(friendPresenceLabel(base({ online: false }))).toBe('Offline')
    expect(friendPresenceLabel(base({ online: true }))).toBe('Online')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'browsing' }))).toBe('Online')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'idle' }))).toBe('Away')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'in_game' }))).toBe('In a game')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'game', id: 'g1', mode: 'streak' },
        })
      )
    ).toBe('On a streak')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'multi', id: 'm1' },
        })
      )
    ).toBe('In MultiGuessr')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'in_duel',
          presenceSession: { kind: 'duel', id: 'd1', duelStatus: 'waiting' },
        })
      )
    ).toBe('In a duel lobby')
    expect(friendPresenceLabel(base({ online: true, presenceActivity: 'in_duel' }))).toBe('In a duel')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'spectating',
          presenceSession: { kind: 'game', id: 'g1' },
        })
      )
    ).toBe('Watching a game')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'spectating',
          presenceSession: { kind: 'game', id: 'g1', mode: 'streak' },
        })
      )
    ).toBe('Watching a streak')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'spectating',
          presenceSession: { kind: 'multi', id: 'm1' },
        })
      )
    ).toBe('Watching MultiGuessr')
    expect(
      friendPresenceLabel(
        base({
          online: true,
          presenceActivity: 'spectating',
          presenceSession: { kind: 'duel', id: 'd1' },
        })
      )
    ).toBe('Watching a duel')
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
  test('returns duel, solo, and multi spectate links for live sessions', () => {
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
    ).toBe('/multi/m1?spectate=1')

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
  test('accepts duel/game/multi ids and optional mode/duelStatus', () => {
    expect(normalizePresenceSession({ kind: 'duel', id: ' x ' })).toEqual({ kind: 'duel', id: 'x' })
    expect(normalizePresenceSession({ kind: 'game', id: 'abc', mode: 'streak' })).toEqual({
      kind: 'game',
      id: 'abc',
      mode: 'streak',
    })
    expect(
      normalizePresenceSession({ kind: 'duel', id: 'd1', duelStatus: 'waiting' })
    ).toEqual({ kind: 'duel', id: 'd1', duelStatus: 'waiting' })
    expect(normalizePresenceSession({ kind: 'nope', id: 'abc' })).toBeUndefined()
    expect(normalizePresenceSession(null)).toBeUndefined()
  })
})

describe('sortFriendsByPresence', () => {
  test('orders live duel, lobby, multi, streak, game, watching, online, away, offline', () => {
    const sorted = sortFriendsByPresence([
      base({ id: 'o', name: 'Zoe', online: false }),
      base({ id: 'on', name: 'Bob', online: true }),
      base({ id: 'away', name: 'Ann', online: true, presenceActivity: 'idle' }),
      base({
        id: 'g',
        name: 'Cara',
        online: true,
        presenceActivity: 'in_game',
        presenceSession: { kind: 'game', id: 'g1' },
      }),
      base({
        id: 's',
        name: 'Sam',
        online: true,
        presenceActivity: 'in_game',
        presenceSession: { kind: 'game', id: 's1', mode: 'streak' },
      }),
      base({
        id: 'm',
        name: 'Mo',
        online: true,
        presenceActivity: 'in_game',
        presenceSession: { kind: 'multi', id: 'm1' },
      }),
      base({
        id: 'd',
        name: 'Dan',
        online: true,
        presenceActivity: 'in_duel',
        presenceSession: { kind: 'duel', id: 'd1', duelStatus: 'in_progress' },
      }),
      base({
        id: 'l',
        name: 'Liz',
        online: true,
        presenceActivity: 'in_duel',
        presenceSession: { kind: 'duel', id: 'l1', duelStatus: 'waiting' },
      }),
      base({
        id: 'w',
        name: 'Wes',
        online: true,
        presenceActivity: 'spectating',
        presenceSession: { kind: 'game', id: 'w1' },
      }),
    ])
    expect(sorted.map((f) => f.id)).toEqual(['d', 'l', 'm', 's', 'g', 'w', 'on', 'away', 'o'])
  })
})

describe('spectateFollowDecision', () => {
  test('stays on the same session, follows a new one, kicks when browsing', () => {
    expect(
      spectateFollowDecision(
        base({
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'game', id: 'g1' },
        }),
        { kind: 'game', id: 'g1' }
      )
    ).toEqual({ action: 'stay' })

    expect(
      spectateFollowDecision(
        base({
          id: 'p1',
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'game', id: 'g2' },
        }),
        { kind: 'game', id: 'g1' }
      )
    ).toEqual({ action: 'follow', href: '/game/g2?spectate=1' })

    expect(
      spectateFollowDecision(
        base({ online: true, presenceActivity: 'browsing' }),
        { kind: 'game', id: 'g1' }
      )
    ).toEqual({ action: 'kick' })

    expect(
      spectateFollowDecision(
        base({
          id: 'p1',
          online: true,
          presenceActivity: 'in_game',
          presenceSession: { kind: 'multi', id: 'm2' },
        }),
        { kind: 'multi', id: 'm1' }
      )
    ).toEqual({ action: 'follow', href: '/multi/m2?spectate=1' })
  })
})
