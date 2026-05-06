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
  createdAt?: Date
  isAdmin?: boolean
}

export default User
