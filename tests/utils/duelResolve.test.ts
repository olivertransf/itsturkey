import type DuelSession from '@backend/models/duelSession'
import { duelRoundDamageMultiplier } from '@backend/utils/duelConstants'
import { applyReactiveDeadlineIfNeeded, tryResolveCurrentRound } from '@backend/utils/duelResolve'

const actual = { lat: 48.8566, lng: 2.3522 }

const mkDuel = (over: Partial<DuelSession> = {}): DuelSession => ({
  shortCode: 'ZZZZZZ',
  mapId: 'map',
  gameSettings: { timeLimit: 0, canMove: true, canPan: true, canZoom: true },
  mode: 'hp',
  locations: [actual],
  reactiveSeconds: 15,
  startingHpHost: 6000,
  startingHpGuest: 6000,
  multiplierMode: 'round_ramp',
  hostWinMultiplier: 1,
  guestWinMultiplier: 1,
  status: 'in_progress',
  host: { hp: 6000, totalPoints: 0, joined: true },
  guest: { hp: 6000, totalPoints: 0, joined: true },
  completedRounds: 0,
  roundResults: [],
  roundDeadlineAt: null,
  mapScoreFactor: 2000,
  ...over,
})

test('geoGuessr-style damage ramp helper', () => {
  expect(duelRoundDamageMultiplier(4, true)).toBe(1)
  expect(duelRoundDamageMultiplier(5, true)).toBe(1.5)
  expect(duelRoundDamageMultiplier(6, true)).toBe(2)
  expect(duelRoundDamageMultiplier(10, false)).toBe(1)
})

test('resolves round when both locked — higher score wins HP duel', () => {
  const duel = mkDuel()
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t }
  duel.guestLockedGuess = { lat: 40, lng: 2, lockedAt: t }

  const out = tryResolveCurrentRound(duel, t, actual)

  expect(out.type).toBe('resolved')
  expect(duel.completedRounds).toBe(1)
  expect(duel.roundResults).toHaveLength(1)
  expect(duel.roundResults[0]?.winner).toBe('host')
  expect(duel.roundResults[0]?.damageToGuest).toBeGreaterThan(0)
  expect(duel.roundResults[0]?.damageToHost).toBe(0)
  expect(duel.roundDeadlineAt).toBe(null)
})

test('equal scores deal zero damage', () => {
  const duel = mkDuel()
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.8566, lng: 2.3522, lockedAt: t }
  duel.guestLockedGuess = { lat: 48.8566, lng: 2.3522, lockedAt: t }

  tryResolveCurrentRound(duel, t, actual)

  expect(duel.roundResults[0]?.winner).toBe('tie')
  expect(duel.roundResults[0]?.damageToHost).toBe(0)
  expect(duel.roundResults[0]?.damageToGuest).toBe(0)
  expect(duel.host.hp).toBe(6000)
  expect(duel.guest.hp).toBe(6000)
})

test('round_ramp applies 1.5x on round 5', () => {
  const duel = mkDuel({
    locations: [actual, actual, actual, actual, actual],
    completedRounds: 4,
    roundResults: [],
  })
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t }
  duel.guestLockedGuess = { lat: 40, lng: 2, lockedAt: t }

  tryResolveCurrentRound(duel, t, actual)

  const entry = duel.roundResults[0]
  expect(entry?.roundIndex).toBe(4)
  expect(entry?.damageMultiplierUsed).toBe(1.5)
  expect(entry?.damageToGuest).toBe(Math.round((entry!.hostPoints - entry!.guestPoints) * 1.5))
})

test('win_streak bumps winner multiplier after round', () => {
  const duel = mkDuel({ multiplierMode: 'win_streak' })
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t }
  duel.guestLockedGuess = { lat: 40, lng: 2, lockedAt: t }

  tryResolveCurrentRound(duel, t, actual)

  expect(duel.hostWinMultiplier).toBe(1.5)
  expect(duel.guestWinMultiplier).toBe(1)
  expect(duel.roundResults[0]?.damageMultiplierUsed).toBe(1)
})

test('starts reactive deadline after first lock', () => {
  const duel = mkDuel()
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t }
  applyReactiveDeadlineIfNeeded(duel, t)

  expect(duel.roundDeadlineAt?.getTime()).toBe(t.getTime() + 15_000)
})

test('resolves on deadline using provisional pin for missing lock', () => {
  const duel = mkDuel()
  const t0 = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t0 }
  duel.roundDeadlineAt = new Date(t0.getTime() + 15_000)
  duel.guestProvisionalPin = { lat: 48.855, lng: 2.351, at: t0 }

  const tEnd = new Date(t0.getTime() + 16_000)
  const out = tryResolveCurrentRound(duel, tEnd, actual)

  expect(out.type).toBe('resolved')
  expect(duel.roundResults[0]?.guestNoGuess).toBe(false)
})

test('resolves on deadline with noGuess when no provisional pin', () => {
  const duel = mkDuel()
  const t0 = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t0 }
  duel.roundDeadlineAt = new Date(t0.getTime() + 15_000)

  const tEnd = new Date(t0.getTime() + 16_000)
  const out = tryResolveCurrentRound(duel, tEnd, actual)

  expect(out.type).toBe('resolved')
  expect(duel.roundResults[0]?.guestNoGuess).toBe(true)
  expect(duel.roundResults[0]?.guestPoints).toBe(0)
  expect(duel.roundResults[0]?.damageToGuest).toBeGreaterThan(0)
})

test('points mode adds both scores without HP swing', () => {
  const duel = mkDuel({ mode: 'points', totalRounds: 1 })
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t }
  duel.guestLockedGuess = { lat: 40, lng: 2, lockedAt: t }

  tryResolveCurrentRound(duel, t, actual)

  expect(duel.host.totalPoints).toBeGreaterThan(0)
  expect(duel.guest.totalPoints).toBeGreaterThan(0)
  expect(duel.host.hp).toBe(6000)
  expect(duel.guest.hp).toBe(6000)
  expect(duel.status).toBe('finished')
  expect(duel.outcome).toBeDefined()
})
