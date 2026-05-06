import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getUserId, throwError } from '@backend/utils'
import { notifyUserDuelInviteRemoved } from '@backend/utils/pusherNotify'

const dismissDuelInvite = async (req: NextApiRequest, res: NextApiResponse, inviteHex: string) => {
  const userId = await getUserId(req, res)
  if (!userId) return throwError(res, 401, 'Unauthorized')

  if (!ObjectId.isValid(inviteHex)) {
    return throwError(res, 400, 'Invalid invite')
  }

  const me = new ObjectId(userId)
  const oid = new ObjectId(inviteHex)

  const result = await collections.duelFriendInvites?.updateOne(
    {
      _id: oid,
      recipientUserId: me,
      consumedAt: null,
    },
    { $set: { dismissedAt: new Date() } }
  )

  if (!result?.matchedCount) {
    return throwError(res, 404, 'Invite not found')
  }

  void notifyUserDuelInviteRemoved(userId, inviteHex)

  res.status(200).send({ ok: true })
}

export default dismissDuelInvite
