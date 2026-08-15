import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game, MultiSession } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { areUsersFriends } from '@backend/utils/areUsersFriends'
import { canAccessGame, collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import {
  PRESENCE_ONLINE_WINDOW_MS,
  normalizePresenceSession,
} from '@utils/friends/friendPresence'

const redactGameForSpectator = (game: Game): Game => {
  if (game.state === 'finished') return game
  const rounds = Array.isArray(game.rounds) ? game.rounds : []
  const guessesLen = Array.isArray(game.guesses) ? game.guesses.length : 0
  const keep = Math.min(rounds.length, Math.max(guessesLen + 1, game.round || 1))
  return { ...game, rounds: rounds.slice(0, keep) }
}

const getMultiSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)
  const spectate = req.query.spectate === '1'

  if (sessionId.length !== 24) {
    return throwError(res, 404, 'Failed to find multi session')
  }

  const session = (await collections.multiSessions?.findOne({ _id: new ObjectId(sessionId) })) as MultiSession

  if (!session) {
    return throwError(res, 404, 'Failed to find multi session')
  }

  const sessionBelongsToUser = canAccessGame(
    { userId: session.userId?.toString(), anonymousId: session.anonymousId },
    { userId, anonymousId }
  )

  if (spectate) {
    if (!userId) {
      return throwError(res, 401, 'Sign in to spectate')
    }
    if (!sessionBelongsToUser) {
      if (!session.userId) {
        return throwError(res, 403, 'This session cannot be spectated')
      }
      const friends = await areUsersFriends(userId, session.userId.toString())
      if (!friends) {
        return throwError(res, 403, 'Only friends can spectate this game')
      }
    }
  } else if (!sessionBelongsToUser) {
    return throwError(res, 401, 'You are not authorized to view this multi session')
  }

  const games = (await collections.games
    ?.find({ _id: { $in: session.panelGameIds } })
    .toArray()) as Game[]
  const gameById = new Map(games.map((game) => [game._id?.toString(), game]))
  const panelGames = session.panelGameIds
    .map((gameId) => gameById.get(gameId.toString()))
    .filter(Boolean) as Game[]
  const mapDetails = panelGames[0] ? await getMapFromGame(panelGames[0]) : null
  const panelMapDetails = await Promise.all(panelGames.map((game) => getMapFromGame(game)))

  panelGames.forEach((game, index) => {
    if (panelMapDetails[index]) {
      game.mapDetails = panelMapDetails[index] as Game['mapDetails']
    }
  })

  const asSpectator = Boolean(spectate && !sessionBelongsToUser)
  const safePanels = asSpectator ? panelGames.map(redactGameForSpectator) : panelGames

  let ownerLive
  if (asSpectator && session.userId) {
    const owner = await collections.users?.findOne(
      { _id: session.userId },
      { projection: { lastSeenAt: 1, presenceActivity: 1, presenceSession: 1 } }
    )
    const lastSeenAt =
      owner?.lastSeenAt instanceof Date
        ? owner.lastSeenAt.toISOString()
        : owner?.lastSeenAt
          ? new Date(owner.lastSeenAt as Date).toISOString()
          : null
    const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0
    const ownerOnline = lastSeenMs > 0 && Date.now() - lastSeenMs < PRESENCE_ONLINE_WINDOW_MS
    ownerLive = {
      userId: session.userId.toString(),
      activity: ownerOnline
        ? typeof owner?.presenceActivity === 'string'
          ? owner.presenceActivity
          : 'browsing'
        : 'browsing',
      lastSeenAt,
      online: ownerOnline,
      presenceSession: ownerOnline
        ? normalizePresenceSession((owner as { presenceSession?: unknown } | null)?.presenceSession)
        : undefined,
    }
  }

  res.status(200).send({
    session,
    panels: safePanels,
    mapDetails,
    isSpectator: asSpectator,
    ...(ownerLive ? { ownerLive } : {}),
  })
}

export default getMultiSession
