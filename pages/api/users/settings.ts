import Cryptr from 'cryptr'
/* eslint-disable import/no-anonymous-default-export */
import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, dbConnect, getUserId, throwError } from '@backend/utils'
import { assignFriendCodeIfMissing } from '@backend/utils/friendCode'
import { GUEST_ACCOUNT_ID } from '@utils/constants/random'
import {
  GOOGLE_MAPS_KEY_LENGTH,
  isPlausibleGoogleMapsApiKey,
  normalizeGoogleMapsApiKey,
} from '@utils/helpers/checkGoogleMapsApiKey'

const ALLOWED_DISTANCE_UNITS = ['metric', 'imperial']

const cryptr = new Cryptr(process.env.CRYPTR_SECRET as string)

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
      const { distanceUnit } = req.body
      const mapsAPIKey = normalizeGoogleMapsApiKey(req.body?.mapsAPIKey)
      const clientVerified = req.body?.mapsAPIKeyClientVerified === true
      const userId = await getUserId(req, res)

      if (!userId) {
        return throwError(res, 401, 'Unauthorized')
      }

      if (userId === GUEST_ACCOUNT_ID) {
        return throwError(res, 401, 'This account is not allowed to modify settings')
      }

      if (mapsAPIKey) {
        if (!isPlausibleGoogleMapsApiKey(mapsAPIKey)) {
          return throwError(
            res,
            400,
            `The Google Maps API key should be ${GOOGLE_MAPS_KEY_LENGTH} characters and start with AIza.`
          )
        }

        // Real Maps JS / referrer-restricted keys must be verified in the browser.
        // Server Geocoding probes false-fail those keys.
        if (!clientVerified) {
          return throwError(
            res,
            400,
            'Test the API key in Settings before saving (browser check required).'
          )
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
