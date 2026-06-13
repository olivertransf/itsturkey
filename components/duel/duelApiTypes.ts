import type { GameSettingsType, LocationType, MapType } from '@types'

/** SVG key under `/images/userAvatars` + pin ring color; matches `User.avatar` shape. */
export type DuelGuessAvatar = { emoji: string; color: string }

/** Default marker when user is anonymous or API has no avatar (8-ball asset). */
export const DUEL_GUESS_MARKER_FALLBACK: DuelGuessAvatar = { emoji: '1f3b1', color: '#94a3b8' }

export type DuelViewerRole = 'host' | 'guest' | 'spectator' | null

export type DuelMultiplierMode = 'round_ramp' | 'win_streak'

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
  damageMultiplierUsed: number
  damageToHost: number
  damageToGuest: number
  hostHpAfter: number
  guestHpAfter: number
}

export type DuelChatMessageClient = {
  senderRole: 'host' | 'guest'
  text: string
  createdAt: string
}

export type DuelClientPayload = {
  id: string
  shortCode: string
  status: 'waiting' | 'in_progress' | 'finished'
  mode: 'hp' | 'points'
  outcome?: 'host_win' | 'guest_win' | 'tie'
  mapId?: string
  mapDetails: MapType | null
  gameSettings: GameSettingsType
  viewerRole: DuelViewerRole
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
  currentLocation: LocationType | null
  lastRoundResult: DuelRoundResultClient | null
  roundResults: DuelRoundResultClient[]
  roundLocations: LocationType[]
  lastRoundActualLocation: LocationType | null
  recapAckRoundIndex: number
  multiplierMode: DuelMultiplierMode
  hostWinMultiplier: number
  guestWinMultiplier: number
  rematchReady: { host: boolean; guest: boolean }
  playerNames: { host: string; guest: string }
  playerAvatars: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  chatMessages?: DuelChatMessageClient[]
}
