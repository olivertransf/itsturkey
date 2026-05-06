import { ObjectId } from 'mongodb'

/** Undirected edge: `low` & `high` are the two user ids sorted lexically by hex string. */
export type FriendshipEdge = {
  _id?: ObjectId
  low: ObjectId
  high: ObjectId
  createdAt: Date
}

export default FriendshipEdge
