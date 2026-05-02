import { ObjectId } from 'mongodb'
import { DistanceType, GameSettingsType, GuessType, LocationType, MapType } from '@types'
import User from './user'

type Game = {
  id?: ObjectId
  _id?: ObjectId // replace id with _id throughout app
  mapId: string
  mapName?: string
  userId?: ObjectId
  anonymousId?: string
  notForLeaderboard?: boolean
  userName?: string
  userAvatar?: { emoji: string; color: string }
  gameSettings: GameSettingsType
  /** Standard mode: number of rounds for this game (defaults to rounds.length if missing). */
  totalRounds?: number
  /** Standard mode: no fixed round count; ends when the player finishes early. */
  unlimited?: boolean
  rounds: LocationType[]
  guesses: GuessType[]
  round: number
  totalPoints: number
  totalDistance: DistanceType
  totalTime: number
  difficulty?: 'Normal' | 'Easy' | 'Challenging'
  countryCode?: string
  challengeId?: ObjectId | string | null
  userDetails?: User
  createdAt?: Date
  mapDetails?: MapType
  state: 'started' | 'finished'
  mode: 'standard' | 'streak'
  streak: number
  isDailyChallenge?: boolean
}

export default Game
