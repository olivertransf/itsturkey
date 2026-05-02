import type { LocationType, MapType } from '@types'
import type { DuelSession, DuelSide } from '@backend/models/duelSession'

export type DuelClientPayload = {
  id: string
  shortCode: string
  status: DuelSession['status']
  mode: DuelSession['mode']
  outcome?: DuelSession['outcome']
  mapDetails: MapType | null
  gameSettings: DuelSession['gameSettings']
  viewerRole: DuelSide | null
  guestJoined: boolean
  host: { hp: number; totalPoints: number }
  guest: { hp: number; totalPoints: number }
  startingHpHost: number
  startingHpGuest: number
  completedRounds: number
  totalRounds?: number
  reactiveSeconds: number
  roundDeadlineAt: string | null
  flags: { youLocked: boolean; opponentLocked: boolean }
  currentLocation: DuelSession['locations'][number] | null
  lastRoundResult: DuelSession['roundResults'][number] | null
  /** Actual location for `lastRoundResult.roundIndex` (for recap map). */
  lastRoundActualLocation: LocationType | null
  recapAckRoundIndex: number
  damageMultiplierHost: number
  damageMultiplierGuest: number
  useRoundRamp: boolean
}

export const buildDuelPayload = (duel: DuelSession, role: DuelSide | null, mapDetailsRaw: unknown): DuelClientPayload => {
  const mapDetails = (mapDetailsRaw as MapType | null | undefined) ?? null

  const playing = duel.status === 'in_progress'
  const idx = duel.completedRounds
  const loc =
    playing && role && idx < duel.locations.length ? duel.locations[idx] ?? null : null

  const hostLocked = !!duel.hostLockedGuess
  const guestLocked = !!duel.guestLockedGuess

  const youLocked = role === 'host' ? hostLocked : role === 'guest' ? guestLocked : false
  const oppLocked = role === 'host' ? guestLocked : role === 'guest' ? hostLocked : false

  const last =
    duel.roundResults.length > 0 ? duel.roundResults[duel.roundResults.length - 1] ?? null : null

  const lastRoundActualLocation =
    last && last.roundIndex < duel.locations.length ? duel.locations[last.roundIndex] ?? null : null

  return {
    id: duel._id?.toString() ?? '',
    shortCode: duel.shortCode,
    status: duel.status,
    mode: duel.mode,
    outcome: duel.outcome,
    mapDetails,
    gameSettings: duel.gameSettings,
    viewerRole: role,
    guestJoined: duel.guest.joined,
    host: { hp: duel.host.hp, totalPoints: duel.host.totalPoints },
    guest: { hp: duel.guest.hp, totalPoints: duel.guest.totalPoints },
    startingHpHost: duel.startingHpHost,
    startingHpGuest: duel.startingHpGuest,
    completedRounds: duel.completedRounds,
    totalRounds: duel.totalRounds,
    reactiveSeconds: duel.reactiveSeconds,
    roundDeadlineAt: duel.roundDeadlineAt ? new Date(duel.roundDeadlineAt).toISOString() : null,
    flags: { youLocked, opponentLocked: oppLocked },
    currentLocation: loc,
    lastRoundResult: last,
    lastRoundActualLocation,
    recapAckRoundIndex: duel.recapAckRoundIndex ?? -1,
    damageMultiplierHost: duel.damageMultiplierHost,
    damageMultiplierGuest: duel.damageMultiplierGuest,
    useRoundRamp: duel.useRoundRamp,
  }
}
