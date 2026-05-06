import { ObjectId } from 'mongodb'

/** Push invite for a logged-in friend to open/join a duel without typing the code. */
export type DuelFriendInvite = {
  _id?: ObjectId
  /** Raw URL segment for `/duel/[segment]` (short code or ObjectId hex). */
  inviteSegment: string
  duelObjectId: ObjectId
  hostUserId: ObjectId
  recipientUserId: ObjectId
  hostDisplayName: string
  createdAt: Date
  expiresAt: Date
  dismissedAt: Date | null
  consumedAt: Date | null
}

export default DuelFriendInvite
