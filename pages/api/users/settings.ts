import Cryptr from 'cryptr'
/* eslint-disable import/no-anonymous-default-export */
import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, dbConnect, getUserId, throwError } from '@backend/utils'
import { assignFriendCodeIfMissing } from '@backend/utils/friendCode'
import { GUEST_ACCOUNT_ID } from '@utils/constants/random'
import https from 'https'

const ALLOWED_DISTANCE_UNITS = ['metric', 'imperial']
const GOOGLE_MAPS_KEY_LENGTH = 39

const cryptr = new Cryptr(process.env.CRYPTR_SECRET as string)

const validateGoogleMapsKey = async (key: string): Promise<boolean> => {
  if (!key || key.length !== GOOGLE_MAPS_KEY_LENGTH) return false

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=New%20York&key=${encodeURIComponent(key)}`

  return await new Promise<boolean>((resolve) => {
    https
      .get(url, (resp) => {
        let raw = ''
        resp.on('data', (chunk) => {
          raw += String(chunk)
        })
        resp.on('end', () => {
          try {
            const data = JSON.parse(raw) as { status?: string; error_message?: string }
            const status = typeof data.status === 'string' ? data.status : ''
            if (status === 'OK' || status === 'ZERO_RESULTS') return resolve(true)
            if (status === 'REQUEST_DENIED') return resolve(false)
            return resolve(false)
          } catch {
            resolve(false)
          }
        })
      })
      .on('error', () => resolve(false))
  })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()

    if (req.method === 'GET') {
      const userId = await getUserId(req, res)

      if (!userId) {
        return throwError(res, 401, 'Unauthorized')
      }

      const oid = new ObjectId(userId)
      const user = await collections.users?.findOne({ _id: oid })

      if (!user) {
        return throwError(res, 500, 'Failed to get user details.')
      }

      const decrypedMapsAPIKey = user.mapsAPIKey ? cryptr.decrypt(user.mapsAPIKey) : ''

      let friendCode: string
      try {
        friendCode = await assignFriendCodeIfMissing(oid)
      } catch {
        return throwError(res, 500, 'Failed to load account codes.')
      }

      return res.status(200).send({
        distanceUnit: user.distanceUnit,
        mapsAPIKey: decrypedMapsAPIKey,
        friendCode,
      })
    }

    if (req.method === 'POST') {
      const { distanceUnit, mapsAPIKey } = req.body
      const userId = await getUserId(req, res)

      if (!userId) {
        return throwError(res, 401, 'Unauthorized')
      }

      if (userId === GUEST_ACCOUNT_ID) {
        return throwError(res, 401, 'This account is not allowed to modify settings')
      }

      if (mapsAPIKey && typeof mapsAPIKey !== 'string') {
        return throwError(res, 400, 'Invalid Google Maps API key.')
      }

      if (mapsAPIKey && mapsAPIKey.length !== GOOGLE_MAPS_KEY_LENGTH) {
        return throwError(res, 400, `The Google Maps API key should be ${GOOGLE_MAPS_KEY_LENGTH} characters in length.`)
      }

      if (mapsAPIKey) {
        const ok = await validateGoogleMapsKey(mapsAPIKey)
        if (!ok) {
          return throwError(res, 400, 'That Google Maps API key does not appear to work (request denied).')
        }
      }

      if (distanceUnit && !ALLOWED_DISTANCE_UNITS.includes(distanceUnit)) {
        return throwError(res, 400, 'This distance unit is not allowed.')
      }

      const safeDistance = distanceUnit ?? 'metric'
      const safeMapsKey = mapsAPIKey ? cryptr.encrypt(mapsAPIKey) : ''

      const updateSettings = await collections.users?.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            distanceUnit: safeDistance,
            mapsAPIKey: safeMapsKey,
            ...(mapsAPIKey ? { mapsAPIKeyVerifiedAt: new Date() } : { mapsAPIKeyVerifiedAt: null }),
          },
        }
      )

      if (!updateSettings) {
        return throwError(res, 500, 'There was an unexpected problem while updating your settings.')
      }

      res.status(200).send({ status: 'ok' })
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
