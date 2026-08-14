import { ObjectId } from 'mongodb'

type User = {
  id: ObjectId
  name: string
  bio?: string
  email: string
  password: string
  avatar: { emoji: string; color: string }
  /** Stable invite-style code for adding friends (unique). */
  friendCode?: string
  lastSeenAt?: Date
  presenceActivity?: 'idle' | 'browsing' | 'in_game' | 'in_duel'
  /** Optional live session pointer for friends Watch (cleared when not in a match). */
  presenceSession?: { kind: 'duel' | 'game' | 'multi'; id: string }
  createdAt?: Date
  isAdmin?: boolean
  mapsAPIKey?: string
  mapsAPIKeyVerifiedAt?: Date | null
}

export default User
