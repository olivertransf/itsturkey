import { randomBytes } from 'crypto'
import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'

/** Uppercase alphanumeric, easy to read (no I/O/0/1 ambiguity beyond hex). */
export function randomFriendCode(): string {
  return randomBytes(5).toString('hex').toUpperCase().slice(0, 10)
}

export async function reserveUniqueFriendCode(): Promise<string> {
  for (let i = 0; i < 60; i++) {
    const code = randomFriendCode()
    const clash = await collections.users?.findOne({ friendCode: code }, { projection: { _id: 1 } })
    if (!clash) return code
  }
  throw new Error('Could not allocate friend code')
}

/** Ensures `friendCode` exists on the user document; returns the code. */
export async function assignFriendCodeIfMissing(userId: ObjectId): Promise<string> {
  const existing = await collections.users?.findOne({ _id: userId }, { projection: { friendCode: 1 } })
  const fc = existing?.friendCode
  if (typeof fc === 'string' && fc.trim().length > 0) {
    return fc.trim().toUpperCase()
  }

  for (let attempt = 0; attempt < 60; attempt++) {
    const code = await reserveUniqueFriendCode()
    const res = await collections.users?.updateOne(
      { _id: userId, $or: [{ friendCode: { $exists: false } }, { friendCode: '' }] },
      { $set: { friendCode: code } }
    )
    if (res?.modifiedCount) return code
    const again = await collections.users?.findOne({ _id: userId }, { projection: { friendCode: 1 } })
    if (typeof again?.friendCode === 'string' && again.friendCode.trim()) {
      return again.friendCode.trim().toUpperCase()
    }
  }

  throw new Error('Could not assign friend code')
}
