import { randomBytes } from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

export const ANONYMOUS_GAME_COOKIE = 'geohub_guest_id'
const ANONYMOUS_GAME_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

type GameOwner = {
  userId?: string | null
  anonymousId?: string | null
}

export const buildAnonymousGameCookie = (anonymousId: string) =>
  `${ANONYMOUS_GAME_COOKIE}=${anonymousId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ANONYMOUS_GAME_COOKIE_MAX_AGE}`

export const getAnonymousGameId = (req: NextApiRequest, res: NextApiResponse) => {
  const existingAnonymousId = req.cookies[ANONYMOUS_GAME_COOKIE]

  if (existingAnonymousId) {
    return existingAnonymousId
  }

  const anonymousId = randomBytes(16).toString('hex')
  res.setHeader('Set-Cookie', buildAnonymousGameCookie(anonymousId))

  return anonymousId
}

export const getExistingAnonymousGameId = (req: NextApiRequest) => req.cookies[ANONYMOUS_GAME_COOKIE]

export const canAccessGame = (game: GameOwner, requester: GameOwner) => {
  if (game.userId && requester.userId) {
    return game.userId.toString() === requester.userId.toString()
  }

  if (game.anonymousId && requester.anonymousId) {
    return game.anonymousId === requester.anonymousId
  }

  return false
}
