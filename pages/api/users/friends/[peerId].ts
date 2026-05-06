/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import { removeFriend } from '@backend/routes/users/manageFriends'
import { dbConnect } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    const peerId = typeof req.query.peerId === 'string' ? req.query.peerId : ''

    if (req.method === 'DELETE') {
      return removeFriend(req, res, peerId)
    }

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
