import type { NextApiResponse } from 'next'
import type { LocationType, MapType } from '@types'
import type { DuelSession, DuelSide } from '@backend/models/duelSession'
import type { DuelGuessAvatar } from '@backend/utils/resolveDuelPlayerNames'
import { resolveDuelPlayerAvatars, resolveDuelPlayerNames } from '@backend/utils/resolveDuelPlayerNames'

export type DuelClientPayload = {
  id: string
  shortCode: string
  status: DuelSession['status']
  mode: DuelSession['mode']
  outcome?: DuelSession['outcome']
  mapId: DuelSession['mapId']
  mapDetails: MapType | null
  gameSettings: DuelSession['gameSettings']
  viewerRole: DuelSide | 'spectator' | null
  guestJoined: boolean
  host: { hp: number; totalPoints: number }
  guest: { hp: number; totalPoints: number }
  startingHpHost: number
  startingHpGuest: number
  completedRounds: number
  totalRounds?: number
  reactiveSeconds: number
  roundDeadlineAt: string | null
  flags: { youLocked: boolean; opponentLocked: boolean }
  currentLocation: DuelSession['locations'][number] | null
  lastRoundResult: DuelSession['roundResults'][number] | null
  roundResults: DuelSession['roundResults']
  roundLocations: LocationType[]
  lastRoundActualLocation: LocationType | null
  recapAckRoundIndex: number
  multiplierMode: DuelSession['multiplierMode']
  hostWinMultiplier: number
  guestWinMultiplier: number
  rematchReady: { host: boolean; guest: boolean }
  playerNames: { host: string; guest: string }
  playerAvatars: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  chatMessages?: { senderRole: DuelSide; text: string; createdAt: string }[]
}

export const buildDuelPayload = (
  duel: DuelSession,
  role: DuelSide | 'spectator' | null,
  mapDetailsRaw: unknown,
  playerNames: { host: string; guest: string },
  playerAvatars: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
): DuelClientPayload => {
  const mapDetails = (mapDetailsRaw as MapType | null | undefined) ?? null

  const playing = duel.status === 'in_progress'
  const idx = duel.completedRounds
  const loc = playing && role && idx < duel.locations.length ? duel.locations[idx] ?? null : null

  const hostLocked = !!duel.hostLockedGuess
  const guestLocked = !!duel.guestLockedGuess

  const youLocked = role === 'host' ? hostLocked : role === 'guest' ? guestLocked : role === 'spectator' ? hostLocked : false
  const oppLocked = role === 'host' ? guestLocked : role === 'guest' ? hostLocked : role === 'spectator' ? guestLocked : false

  const last =
    duel.roundResults.length > 0 ? duel.roundResults[duel.roundResults.length - 1] ?? null : null

  const lastRoundActualLocation =
    last && last.roundIndex < duel.locations.length ? duel.locations[last.roundIndex] ?? null : null

  const multiplierMode = duel.multiplierMode ?? 'round_ramp'

  return {
    id: duel._id?.toString() ?? '',
    shortCode: duel.shortCode,
    status: duel.status,
    mode: duel.mode,
    outcome: duel.outcome,
    mapId: duel.mapId,
    mapDetails,
    gameSettings: duel.gameSettings,
    viewerRole: role,
    guestJoined: duel.guest.joined,
    host: { hp: duel.host.hp, totalPoints: duel.host.totalPoints },
    guest: { hp: duel.guest.hp, totalPoints: duel.guest.totalPoints },
    startingHpHost: duel.startingHpHost,
    startingHpGuest: duel.startingHpGuest,
    completedRounds: duel.completedRounds,
    totalRounds: duel.totalRounds,
    reactiveSeconds: duel.reactiveSeconds,
    roundDeadlineAt: duel.roundDeadlineAt ? new Date(duel.roundDeadlineAt).toISOString() : null,
    flags: { youLocked, opponentLocked: oppLocked },
    currentLocation: loc,
    lastRoundResult: last,
    roundResults: duel.roundResults,
    roundLocations: duel.locations,
    lastRoundActualLocation,
    recapAckRoundIndex: duel.recapAckRoundIndex ?? -1,
    multiplierMode,
    hostWinMultiplier: duel.hostWinMultiplier ?? 1,
    guestWinMultiplier: duel.guestWinMultiplier ?? 1,
    rematchReady: {
      host: !!duel.rematchReadyHost,
      guest: !!duel.rematchReadyGuest,
    },
    playerNames,
    playerAvatars,
    ...(duel.chatMessages?.length
      ? {
          chatMessages: duel.chatMessages.map((m) => ({
            senderRole: m.senderRole,
            text: m.text,
            createdAt: new Date(m.createdAt).toISOString(),
          })),
        }
      : {}),
  }
}

export async function replyWithDuelPayload(
  res: NextApiResponse,
  duel: DuelSession,
  role: DuelSide | 'spectator' | null,
  mapDetailsRaw: unknown,
  statusCode = 200
) {
  const [playerNames, playerAvatars] = await Promise.all([
    resolveDuelPlayerNames(duel),
    resolveDuelPlayerAvatars(duel),
  ])
  res.status(statusCode).send(buildDuelPayload(duel, role, mapDetailsRaw, playerNames, playerAvatars))
}
