/* eslint-disable import/no-anonymous-default-export */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { resolveDuelViewerRole } from '@backend/utils/duelParticipant'
import { dbConnect, getExistingAnonymousGameId } from '@backend/utils'
import { getPusherServer } from '@backend/utils/pusherServer'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { authOptions } from '@utils/nextAuthOptions'
import { isValidDuelUrlSegment } from '@utils/helpers/duelInvite'
import { sanitizeChannelSegment } from '@utils/pusherChannels'

export const config = {
  api: {
    bodyParser: true,
  },
}

const PREFIX_USER = 'private-user-'
const PREFIX_DUEL = 'private-duel-'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const pusher = getPusherServer()
    if (!pusher) {
      return res.status(503).end('Realtime not configured')
    }

    const socketId =
      typeof req.body?.socket_id === 'string'
        ? req.body.socket_id
        : typeof req.body?.socketId === 'string'
          ? req.body.socketId
          : ''
    const channelName =
      typeof req.body?.channel_name === 'string'
        ? req.body.channel_name
        : typeof req.body?.channelName === 'string'
          ? req.body.channelName
          : ''

    if (!socketId || !channelName) {
      return res.status(400).end('Bad Request')
    }

    await dbConnect()

    const session = await getServerSession(req, res, authOptions)
    const userId = session?.user?.id
    const anonymousId = getExistingAnonymousGameId(req)

    if (channelName.startsWith(PREFIX_USER)) {
      const suffix = channelName.slice(PREFIX_USER.length)
      if (!userId || sanitizeChannelSegment(userId) !== suffix) {
        return res.status(403).end('Forbidden')
      }
      const auth = pusher.authorizeChannel(socketId, channelName)
      return res.send(auth)
    }

    if (channelName.startsWith(PREFIX_DUEL)) {
      const suffix = channelName.slice(PREFIX_DUEL.length)
      if (!isValidDuelUrlSegment(suffix)) {
        return res.status(403).end('Forbidden')
      }

      const duel = await findDuelSessionByInvite(suffix)
      if (!duel?._id) {
        return res.status(403).end('Forbidden')
      }

      const role = resolveDuelViewerRole(duel, userId, anonymousId, {
        allowSpectator: duel.status === 'in_progress' || duel.status === 'finished',
      })
      if (!role) {
        return res.status(403).end('Forbidden')
      }

      const auth = pusher.authorizeChannel(socketId, channelName)
      return res.send(auth)
    }

    return res.status(403).end('Forbidden')
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}
