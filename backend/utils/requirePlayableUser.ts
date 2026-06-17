import Cryptr from 'cryptr'
import { ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'
import { collections } from './dbConnect'
import getUserId from './getUserId'
import throwError from './throwError'
import { GUEST_ACCOUNT_ID } from '@utils/constants/random'

const cryptr = new Cryptr(process.env.CRYPTR_SECRET as string)

type Result = {
  userId: string
  mapsAPIKey: string
}

export default async function requirePlayableUser(req: NextApiRequest, res: NextApiResponse): Promise<Result> {
  const userId = await getUserId(req, res)

  if (!userId) {
    throwError(res, 401, 'You must be signed in to play')
    throw new Error('Unauthorized')
  }

  if (userId === GUEST_ACCOUNT_ID) {
    throwError(res, 401, 'This account is not allowed to play games')
    throw new Error('Guest account cannot play')
  }

  const user = await collections.users?.findOne({ _id: new ObjectId(userId) })
  const decryptedMapsKey = user?.mapsAPIKey ? cryptr.decrypt(user.mapsAPIKey) : ''

  if (!decryptedMapsKey) {
    throwError(res, 403, 'A Google Maps API key is required to play. Add one in Account settings.')
    throw new Error('Missing maps key')
  }

  return { userId, mapsAPIKey: decryptedMapsKey }
}

