import type { GameSettingsType, LocationType, MapType } from '@types'

export type DuelViewerRole = 'host' | 'guest' | null

export type DuelRoundResultClient = {
  roundIndex: number
  hostGuess: { lat: number; lng: number } | null
  guestGuess: { lat: number; lng: number } | null
  hostNoGuess: boolean
  guestNoGuess: boolean
  hostDistanceMetric: number
  guestDistanceMetric: number
  hostPoints: number
  guestPoints: number
  winner: 'host' | 'guest' | 'tie'
  damageToHost: number
  damageToGuest: number
  hostHpAfter: number
  guestHpAfter: number
}

export type DuelClientPayload = {
  id: string
  shortCode: string
  status: 'waiting' | 'in_progress' | 'finished'
  mode: 'hp' | 'points'
  outcome?: 'host_win' | 'guest_win' | 'tie'
  mapDetails: MapType | null
  gameSettings: GameSettingsType
  viewerRole: DuelViewerRole
  guestJoined: boolean
  host: { hp: number; totalPoints: number }
  guest: { hp: number; totalPoints: number }
  completedRounds: number
  totalRounds?: number
  reactiveSeconds: number
  roundDeadlineAt: string | null
  flags: { youLocked: boolean; opponentLocked: boolean }
  currentLocation: LocationType | null
  lastRoundResult: DuelRoundResultClient | null
  lastRoundActualLocation: LocationType | null
  recapAckRoundIndex: number
  damageMultiplierHost: number
  damageMultiplierGuest: number
  useRoundRamp: boolean
}
