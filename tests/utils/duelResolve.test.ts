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
  damageMultiplierHost: 1,
  damageMultiplierGuest: 1,
  useRoundRamp: false,
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

test('resolves round when both locked — closer wins HP duel', () => {
  const duel = mkDuel()
  const t = new Date('2026-01-01T00:00:00Z')

  duel.hostLockedGuess = { lat: 48.86, lng: 2.35, lockedAt: t }
  duel.guestLockedGuess = { lat: 40, lng: 2, lockedAt: t }

  const out = tryResolveCurrentRound(duel, t, actual)

  expect(out.type).toBe('resolved')
  expect(duel.completedRounds).toBe(1)
  expect(duel.roundResults).toHaveLength(1)
  expect(duel.roundResults[0]?.winner).toBe('host')
  expect(duel.roundDeadlineAt).toBe(null)
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
