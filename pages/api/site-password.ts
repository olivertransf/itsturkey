/* eslint-disable import/no-anonymous-default-export */
import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

const SITE_PASSWORD_COOKIE = 'site_password_unlocked'
const THIRTY_DAYS = 60 * 60 * 24 * 30

const getExpectedToken = () =>
  crypto
    .createHash('sha256')
    .update(process.env.SITE_PASSWORD as string)
    .digest('hex')

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!process.env.SITE_PASSWORD) {
    return res.status(200).send({ success: true })
  }

  if (req.body?.password !== process.env.SITE_PASSWORD) {
    return res.status(401).send({ error: { message: 'Incorrect password' } })
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''

  res.setHeader(
    'Set-Cookie',
    `${SITE_PASSWORD_COOKIE}=${getExpectedToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${THIRTY_DAYS}${secure}`
  )
  res.status(200).send({ success: true })
}
