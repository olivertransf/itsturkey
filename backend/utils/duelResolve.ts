import type { LocationType } from '@types'
import type { DuelLockedGuess, DuelRoundLedgerEntry, DuelSession, DuelSide } from '@backend/models/duelSession'
import calculateDistance from './calculateDistance'
import calculateRoundScore from './calculateRoundScore'
import { DUEL_DISTANCE_TIE_EPSILON_METERS, duelRoundDamageMultiplier } from './duelConstants'
import { clampDamage } from './normalizeDuelSettings'

type Pin = { lat: number; lng: number }

/** When the reactive timer expires with no provisional pin, use world center (auto-submit style). */
const WORLD_CENTER_GUESS: Pin = { lat: 0, lng: 0 }

const effectiveSubmission = (
  locked: DuelLockedGuess | undefined,
  provisional: Pin | undefined,
  roundEnding: boolean
): { coords: Pin | null; noGuess: boolean } => {
  if (locked) return { coords: { lat: locked.lat, lng: locked.lng }, noGuess: false }
  if (roundEnding && provisional) return { coords: { lat: provisional.lat, lng: provisional.lng }, noGuess: false }
  if (roundEnding) return { coords: WORLD_CENTER_GUESS, noGuess: false }
  return { coords: null, noGuess: true }
}

export type DuelResolveOutcome = { type: 'none' } | { type: 'resolved'; duel: DuelSession }

/** Start 15s (or reactiveSeconds) countdown once exactly one player has locked. */
export const applyReactiveDeadlineIfNeeded = (duel: DuelSession, now: Date): void => {
  const hl = duel.hostLockedGuess
  const gl = duel.guestLockedGuess
  if (hl && gl) return
  if (!hl && !gl) return
  if (duel.roundDeadlineAt) return
  duel.roundDeadlineAt = new Date(now.getTime() + duel.reactiveSeconds * 1000)
}

export const tryResolveCurrentRound = (duel: DuelSession, now: Date, actual: LocationType): DuelResolveOutcome => {
  if (duel.status !== 'in_progress') return { type: 'none' }
  if (!duel.guest.joined) return { type: 'none' }

  const roundIdx = duel.completedRounds
  if (roundIdx >= duel.locations.length) return { type: 'none' }

  const hl = duel.hostLockedGuess
  const gl = duel.guestLockedGuess
  const dl = duel.roundDeadlineAt ? new Date(duel.roundDeadlineAt).getTime() : null

  const bothLocked = !!(hl && gl)
  const deadlinePassed = dl !== null && now.getTime() >= dl
  const oneLocked = !!(hl || gl)

  if (!bothLocked && !(deadlinePassed && oneLocked)) return { type: 'none' }

  const roundEnding = bothLocked || deadlinePassed

  const hostEff = effectiveSubmission(hl, duel.hostProvisionalPin, roundEnding)
  const guestEff = effectiveSubmission(gl, duel.guestProvisionalPin, roundEnding)

  const hostCoords = hostEff.coords
  const guestCoords = guestEff.coords
  const hostNoGuess = hostEff.noGuess
  const guestNoGuess = guestEff.noGuess

  const scoreFactor = duel.mapScoreFactor

  let hostDist = Number.POSITIVE_INFINITY
  let guestDist = Number.POSITIVE_INFINITY
  let hostPoints = 0
  let guestPoints = 0

  if (hostCoords && !hostNoGuess) {
    hostDist = calculateDistance(hostCoords, actual, 'metric')
    hostPoints = calculateRoundScore(hostDist, scoreFactor)
  }

  if (guestCoords && !guestNoGuess) {
    guestDist = calculateDistance(guestCoords, actual, 'metric')
    guestPoints = calculateRoundScore(guestDist, scoreFactor)
  }

  const hostDm = hostDist * 1000
  const guestDm = guestDist * 1000

  let winner: DuelSide | 'tie' = 'tie'
  if (hostNoGuess && guestNoGuess) winner = 'tie'
  else if (hostNoGuess) winner = 'guest'
  else if (guestNoGuess) winner = 'host'
  else if (Math.abs(hostDm - guestDm) <= DUEL_DISTANCE_TIE_EPSILON_METERS) winner = 'tie'
  else if (hostDm < guestDm) winner = 'host'
  else winner = 'guest'

  const roundOneBased = roundIdx + 1
  const ramp = duelRoundDamageMultiplier(roundOneBased, duel.useRoundRamp)

  let damageToHost = 0
  let damageToGuest = 0

  if (duel.mode === 'hp' && winner !== 'tie') {
    if (winner === 'host') {
      const base = Math.max(0, hostPoints - guestPoints)
      damageToGuest = clampDamage(base * duel.damageMultiplierHost * ramp)
    } else {
      const base = Math.max(0, guestPoints - hostPoints)
      damageToHost = clampDamage(base * duel.damageMultiplierGuest * ramp)
    }
  }

  if (duel.mode === 'points') {
    duel.host.totalPoints += hostPoints
    duel.guest.totalPoints += guestPoints
  }

  duel.host.hp -= damageToHost
  duel.guest.hp -= damageToGuest

  const entry: DuelRoundLedgerEntry = {
    roundIndex: roundIdx,
    hostGuess: hostCoords && !hostNoGuess ? { lat: hostCoords.lat, lng: hostCoords.lng } : null,
    guestGuess: guestCoords && !guestNoGuess ? { lat: guestCoords.lat, lng: guestCoords.lng } : null,
    hostNoGuess,
    guestNoGuess,
    hostDistanceMetric: Number.isFinite(hostDist) ? hostDist : 0,
    guestDistanceMetric: Number.isFinite(guestDist) ? guestDist : 0,
    hostPoints,
    guestPoints,
    winner,
    damageToHost,
    damageToGuest,
    hostHpAfter: duel.host.hp,
    guestHpAfter: duel.guest.hp,
  }

  duel.roundResults = duel.roundResults.concat(entry)
  duel.completedRounds = roundIdx + 1

  duel.hostLockedGuess = undefined
  duel.guestLockedGuess = undefined
  duel.hostProvisionalPin = undefined
  duel.guestProvisionalPin = undefined
  duel.roundDeadlineAt = null

  const hpEnd = duel.mode === 'hp' && (duel.host.hp <= 0 || duel.guest.hp <= 0)
  const pointsEnd =
    duel.mode === 'points' && duel.totalRounds != null && duel.completedRounds >= duel.totalRounds

  if (hpEnd) {
    duel.status = 'finished'
    duel.finishedAt = now
    if (duel.host.hp <= 0 && duel.guest.hp <= 0) duel.outcome = 'tie'
    else if (duel.host.hp <= 0) duel.outcome = 'guest_win'
    else duel.outcome = 'host_win'
  } else if (pointsEnd) {
    duel.status = 'finished'
    duel.finishedAt = now
    if (duel.host.totalPoints > duel.guest.totalPoints) duel.outcome = 'host_win'
    else if (duel.guest.totalPoints > duel.host.totalPoints) duel.outcome = 'guest_win'
    else duel.outcome = 'tie'
  }

  return { type: 'resolved', duel }
}
