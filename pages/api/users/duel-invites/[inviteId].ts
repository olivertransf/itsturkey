/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import dismissDuelInvite from '@backend/routes/users/dismissDuelInvite'
import { dbConnect } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    const inviteId = typeof req.query.inviteId === 'string' ? req.query.inviteId : ''

    switch (req.method) {
      case 'DELETE':
        return dismissDuelInvite(req, res, inviteId)
      default:
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
