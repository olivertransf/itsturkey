/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'
import endMultiSession from '@backend/routes/multi/endMultiSession'
import getMultiSession from '@backend/routes/multi/getMultiSession'
import { dbConnect } from '@backend/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    switch (req.method) {
      case 'GET':
        return getMultiSession(req, res)
      case 'PUT':
        return endMultiSession(req, res)
      default:
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({ success: false })
  }
}
