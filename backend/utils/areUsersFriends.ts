import { ObjectId } from 'mongodb'
import type FriendshipEdge from '@backend/models/friendship'
import { collections } from '@backend/utils/dbConnect'

function sortedPair(a: ObjectId, b: ObjectId): { low: ObjectId; high: ObjectId } {
  const as = a.toHexString()
  const bs = b.toHexString()
  return as <= bs ? { low: a, high: b } : { low: b, high: a }
}

export async function areUsersFriends(userIdAHex: string, userIdBHex: string): Promise<boolean> {
  if (!ObjectId.isValid(userIdAHex) || !ObjectId.isValid(userIdBHex)) return false
  const a = new ObjectId(userIdAHex)
  const b = new ObjectId(userIdBHex)
  if (a.equals(b)) return false
  const { low, high } = sortedPair(a, b)
  const edge = await collections.friendships?.findOne<FriendshipEdge>({ low, high })
  return !!edge
}
