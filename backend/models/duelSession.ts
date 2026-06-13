import { ObjectId } from 'mongodb'
import type { GameSettingsType, LocationType } from '@types'

export type DuelMode = 'hp' | 'points'

export type DuelSide = 'host' | 'guest'

export type DuelGuessCoords = {
  lat: number
  lng: number
}

export type DuelPinSnapshot = DuelGuessCoords & {
  at: Date
}

export type DuelLockedGuess = DuelGuessCoords & {
  lockedAt: Date
}

export type DuelPlayerSlot = {
  userId?: ObjectId
  anonymousId?: string
  displayName?: string
  hp: number
  totalPoints: number
  joined: boolean
}

export type DuelMultiplierMode = 'round_ramp' | 'win_streak'

export type DuelRoundLedgerEntry = {
  roundIndex: number
  hostGuess: DuelGuessCoords | null
  guestGuess: DuelGuessCoords | null
  hostNoGuess: boolean
  guestNoGuess: boolean
  hostDistanceMetric: number
  guestDistanceMetric: number
  hostPoints: number
  guestPoints: number
  winner: DuelSide | 'tie'
  damageMultiplierUsed: number
  damageToHost: number
  damageToGuest: number
  hostHpAfter: number
  guestHpAfter: number
}

export type DuelSession = {
  _id?: ObjectId
  shortCode: string
  mapId: string
  mapName?: string
  gameSettings: GameSettingsType
  mode: DuelMode
  locations: LocationType[]
  /** Points mode only — fixed rounds then compare totals */
  totalRounds?: number
  reactiveSeconds: number
  startingHpHost: number
  startingHpGuest: number
  /** @deprecated Legacy lobby knobs — ignored for HP damage when multiplierMode is set */
  damageMultiplierHost?: number
  /** @deprecated Legacy lobby knobs — ignored for HP damage when multiplierMode is set */
  damageMultiplierGuest?: number
  /** @deprecated Use multiplierMode === 'round_ramp' */
  useRoundRamp?: boolean
  multiplierMode?: DuelMultiplierMode
  hostWinMultiplier?: number
  guestWinMultiplier?: number
  status: 'waiting' | 'in_progress' | 'finished'
  outcome?: 'host_win' | 'guest_win' | 'tie'
  host: DuelPlayerSlot
  guest: DuelPlayerSlot
  /** Number of completed rounds (next playable index == this value) */
  completedRounds: number
  roundResults: DuelRoundLedgerEntry[]
  /** Last finished round whose recap overlay was dismissed by either player (-1 / omit = none yet). */
  recapAckRoundIndex?: number
  hostProvisionalPin?: DuelPinSnapshot
  guestProvisionalPin?: DuelPinSnapshot
  hostLockedGuess?: DuelLockedGuess
  guestLockedGuess?: DuelLockedGuess
  roundDeadlineAt?: Date | null
  /** Cached from map doc for scoring */
  mapScoreFactor?: number
  createdAt?: Date
  finishedAt?: Date
  /** After `finished`, both players must opt in before a rematch resets the session. */
  rematchReadyHost?: boolean
  rematchReadyGuest?: boolean
  chatMessages?: { senderRole: DuelSide; text: string; createdAt: Date }[]
}

export default DuelSession
