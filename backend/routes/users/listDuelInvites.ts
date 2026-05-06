import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getUserId, throwError } from '@backend/utils'

export type DuelInviteClientRow = {
  id: string
  hostName: string
  inviteSegment: string
  createdAt: string
}

const listDuelInvites = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  if (!userId) return throwError(res, 401, 'Unauthorized')

  const now = new Date()
  const me = new ObjectId(userId)

  const rows =
    (await collections.duelFriendInvites
      ?.find({
        recipientUserId: me,
        expiresAt: { $gt: now },
        dismissedAt: null,
        consumedAt: null,
      })
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray()) ?? []

  const seen = new Set<string>()
  const invites: DuelInviteClientRow[] = []

  for (const doc of rows) {
    const seg = typeof doc.inviteSegment === 'string' ? doc.inviteSegment : ''
    if (!seg || seen.has(seg)) continue
    seen.add(seg)
    invites.push({
      id: doc._id.toHexString(),
      hostName: typeof doc.hostDisplayName === 'string' ? doc.hostDisplayName : 'Friend',
      inviteSegment: seg,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date().toISOString(),
    })
  }

  res.status(200).send({ invites })
}

export default listDuelInvites
