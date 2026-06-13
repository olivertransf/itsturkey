import type { LocationType } from '@types'
import type { DuelLockedGuess, DuelRoundLedgerEntry, DuelSession, DuelSide } from '@backend/models/duelSession'
import calculateDistance from './calculateDistance'
import calculateRoundScore from './calculateRoundScore'
import { duelRoundDamageMultiplier } from './duelConstants'

type Pin = { lat: number; lng: number }

const effectiveSubmission = (
  locked: DuelLockedGuess | undefined,
  provisional: Pin | undefined,
  roundEnding: boolean
): { coords: Pin | null; noGuess: boolean } => {
  if (locked) return { coords: { lat: locked.lat, lng: locked.lng }, noGuess: false }
  if (roundEnding && provisional) return { coords: { lat: provisional.lat, lng: provisional.lng }, noGuess: false }
  if (roundEnding) return { coords: null, noGuess: true }
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

const resolveMultiplierMode = (duel: DuelSession): 'round_ramp' | 'win_streak' => {
  if (duel.multiplierMode === 'win_streak') return 'win_streak'
  return 'round_ramp'
}

const damageMultiplierForRound = (duel: DuelSession, roundOneBased: number, winner: DuelSide): number => {
  const mode = resolveMultiplierMode(duel)
  if (mode === 'win_streak') {
    return winner === 'host' ? (duel.hostWinMultiplier ?? 1) : (duel.guestWinMultiplier ?? 1)
  }
  const rampEnabled = duel.multiplierMode != null ? true : duel.useRoundRamp !== false
  return duelRoundDamageMultiplier(roundOneBased, rampEnabled)
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

  let winner: DuelSide | 'tie' = 'tie'
  if (hostPoints === guestPoints) winner = 'tie'
  else if (hostPoints > guestPoints) winner = 'host'
  else winner = 'guest'

  const roundOneBased = roundIdx + 1
  const scoreDiff = Math.abs(hostPoints - guestPoints)

  let damageToHost = 0
  let damageToGuest = 0
  let damageMultiplierUsed = 0

  if (duel.mode === 'hp' && winner !== 'tie' && scoreDiff > 0) {
    damageMultiplierUsed = damageMultiplierForRound(duel, roundOneBased, winner)
    const damage = Math.round(scoreDiff * damageMultiplierUsed)

    if (winner === 'host') {
      damageToGuest = damage
      if (resolveMultiplierMode(duel) === 'win_streak') {
        duel.hostWinMultiplier = (duel.hostWinMultiplier ?? 1) + 0.5
      }
    } else {
      damageToHost = damage
      if (resolveMultiplierMode(duel) === 'win_streak') {
        duel.guestWinMultiplier = (duel.guestWinMultiplier ?? 1) + 0.5
      }
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
    damageMultiplierUsed,
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
