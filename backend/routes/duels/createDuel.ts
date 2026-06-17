import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import type Game from '@backend/models/game'
import type DuelSession from '@backend/models/duelSession'
import getMapFromGame from '@backend/queries/getMapFromGame'
import {
  collections,
  getLocations,
  isUserBanned,
  requirePlayableUser,
  throwError,
} from '@backend/utils'
import { fetchUserDisplayName, sanitizeDuelDisplayName } from '@backend/utils/resolveDuelPlayerNames'
import { DUEL_ROUND_LOCATION_POOL_ID } from '@backend/utils/duelConstants'
import { normalizeCreateDuelBody } from '@backend/utils/normalizeDuelSettings'
import { randomDuelShortCode } from '@backend/utils/duelShortCode'

const createDuel = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = await requirePlayableUser(req, res)

  const { isBanned } = await isUserBanned(userId)

  if (isBanned) {
    return throwError(res, 401, 'You are currently banned from playing games')
  }

  const normalized = normalizeCreateDuelBody(req.body)

  if (!normalized.ok) {
    return throwError(res, 400, normalized.message)
  }

  const cfg = normalized.value

  const locations = await getLocations(DUEL_ROUND_LOCATION_POOL_ID, cfg.locationCount)

  if (!locations) {
    return throwError(res, 400, 'Failed to get locations')
  }

  const mapDetails = await getMapFromGame({ mapId: cfg.mapId } as unknown as Game)
  const md = mapDetails as { scoreFactor?: number } | null | undefined
  const scoreFactor = typeof md?.scoreFactor === 'number' ? md.scoreFactor : undefined

  let shortCode = randomDuelShortCode(4)
  let clash = await collections.duelSessions?.findOne({ shortCode })
  let attempts = 0
  while (clash && attempts < 80) {
    shortCode = randomDuelShortCode(4)
    clash = await collections.duelSessions?.findOne({ shortCode })
    attempts++
  }
  if (clash) {
    return throwError(res, 503, 'Could not allocate a duel code — try again')
  }

  let hostDisplayName: string | undefined
  hostDisplayName = (await fetchUserDisplayName(userId)) ?? sanitizeDuelDisplayName(cfg.displayName)

  const hostSlot = {
    userId: new ObjectId(userId),
    anonymousId: undefined,
    displayName: hostDisplayName,
    hp: cfg.startingHpHost,
    totalPoints: 0,
    joined: true,
  }

  const guestSlot = {
    userId: undefined as ObjectId | undefined,
    anonymousId: undefined as string | undefined,
    displayName: undefined as string | undefined,
    hp: cfg.startingHpGuest,
    totalPoints: 0,
    joined: false,
  }

  const duel: DuelSession = {
    shortCode,
    mapId: cfg.mapId,
    mapName: cfg.mapName ?? mapDetails?.name,
    gameSettings: cfg.gameSettings,
    mode: cfg.mode,
    locations,
    totalRounds: cfg.totalRounds,
    reactiveSeconds: cfg.reactiveSeconds,
    startingHpHost: cfg.startingHpHost,
    startingHpGuest: cfg.startingHpGuest,
    multiplierMode: cfg.multiplierMode,
    hostWinMultiplier: 1,
    guestWinMultiplier: 1,
    status: 'waiting',
    host: hostSlot,
    guest: guestSlot,
    completedRounds: 0,
    roundResults: [],
    roundDeadlineAt: null,
    mapScoreFactor: scoreFactor,
    createdAt: new Date(),
  }

  const result = await collections.duelSessions?.insertOne(duel)

  if (!result?.insertedId) {
    return throwError(res, 500, 'Failed to create duel')
  }

  res.status(201).send({ _id: result.insertedId, shortCode })
}

export default createDuel
