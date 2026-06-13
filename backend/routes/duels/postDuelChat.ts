import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import { collections, getExistingAnonymousGameId, getUserId, throwError } from '@backend/utils'
import getMapFromGame from '@backend/queries/getMapFromGame'
import { duelParticipantRole } from '@backend/utils/duelParticipant'
import { findDuelSessionByInvite } from '@backend/utils/resolveDuelInvite'
import { notifyDuelChat, notifyDuelUpdated } from '@backend/utils/pusherNotify'
import { replyWithDuelPayload } from './buildDuelPayload'

import { MAX_DUEL_CHAT_MESSAGES, MAX_DUEL_CHAT_TEXT } from '@utils/constants/duelChat'

const postDuelChat = async (req: NextApiRequest, res: NextApiResponse) => {
  const duelId = req.query.id as string
  const userId = await getUserId(req, res)
  const anonymousId = getExistingAnonymousGameId(req)

  const raw = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!raw) {
    return throwError(res, 400, 'Message cannot be empty')
  }
  if (raw.length > MAX_DUEL_CHAT_TEXT) {
    return throwError(res, 400, `Message must be at most ${MAX_DUEL_CHAT_TEXT} characters`)
  }

  const duel = (await findDuelSessionByInvite(duelId)) as DuelSession | null
  if (!duel) {
    return throwError(res, 404, 'Duel not found')
  }

  const role = duelParticipantRole(duel, userId, anonymousId)
  if (role !== 'host' && role !== 'guest') {
    return throwError(res, 401, 'Only duel players can chat')
  }

  const createdAt = new Date()
  const entry = { senderRole: role, text: raw, createdAt }

  const existing = duel.chatMessages ?? []
  const next = [...existing, entry].slice(-MAX_DUEL_CHAT_MESSAGES)
  duel.chatMessages = next

  await collections.duelSessions?.replaceOne({ _id: duel._id }, duel)

  const message = {
    senderRole: entry.senderRole,
    text: entry.text,
    createdAt: createdAt.toISOString(),
  }

  void notifyDuelChat(duelId, message)
  void notifyDuelUpdated(duelId, 'chat')

  const mapDetails = await getMapFromGame({ mapId: duel.mapId } as unknown as Game)
  await replyWithDuelPayload(res, duel, role, mapDetails)
}

export default postDuelChat
