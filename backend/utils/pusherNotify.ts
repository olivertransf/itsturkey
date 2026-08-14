import type { Game } from '@backend/models'
import type { ObjectId } from 'mongodb'
import {
  leaderboardStorageKey,
  resolveStandardLeaderboardKey,
} from '@backend/utils/resolveStandardLeaderboardKey'
import {
  duelPrivateChannel,
  mapScoresPublicChannel,
  userPrivateChannel,
} from '@utils/pusherChannels'
import {
  COUNTRY_STREAKS_ID,
  DAILY_CHALLENGE_ID,
  EQUITABLE_COUNTRY_STREAK_ID,
  OFFICIAL_WORLD_ID,
} from '@utils/constants/random'
import { WORLD_STANDARD_LEADERBOARD_KEY } from '@utils/constants/standardLeaderboard'
import { normalizeDuelInviteCode } from './duelShortCode'
import { findDuelSessionByInvite } from './resolveDuelInvite'
import { triggerSafe } from './pusherServer'

export type DuelPusherReason =
  | 'join'
  | 'start'
  | 'guess'
  | 'pin_state'
  | 'forfeit'
  | 'recap_dismiss'
  | 'rematch'
  | 'chat'

export type DuelChatPusherMessage = {
  senderRole: 'host' | 'guest'
  text: string
  createdAt: string
}

type DuelChannelRef = {
  _id?: ObjectId | string
  shortCode?: string
}

/** All URL segments clients may subscribe on for one duel (code + ObjectId + request path). */
export function collectDuelChannelSegments(
  requestSegment: string,
  duel?: DuelChannelRef | null
): string[] {
  const segs = new Set<string>()
  const add = (raw?: string | null) => {
    const s = typeof raw === 'string' ? raw.trim() : ''
    if (s) segs.add(s)
  }

  add(requestSegment)
  if (duel?.shortCode) {
    add(normalizeDuelInviteCode(duel.shortCode) ?? duel.shortCode.trim().toUpperCase())
  }
  if (duel?._id) {
    add(typeof duel._id === 'string' ? duel._id : duel._id.toHexString())
  }
  return Array.from(segs)
}

async function resolveDuelChannelRef(
  segment: string,
  duel?: DuelChannelRef | null
): Promise<DuelChannelRef | null> {
  if (duel?._id && duel.shortCode) return duel
  const found = await findDuelSessionByInvite(segment)
  if (!found) return duel ?? null
  return {
    _id: found._id,
    shortCode: found.shortCode,
  }
}

export async function notifyDuelUpdated(
  segment: string,
  reason: DuelPusherReason,
  duel?: DuelChannelRef | null
): Promise<void> {
  const ref = await resolveDuelChannelRef(segment, duel)
  const segments = collectDuelChannelSegments(segment, ref)
  await Promise.all(
    segments.map((s) =>
      triggerSafe(duelPrivateChannel(s), 'duel.updated', { inviteSegment: s, reason })
    )
  )
}

export async function notifyDuelChat(
  segment: string,
  message: DuelChatPusherMessage,
  duel?: DuelChannelRef | null
): Promise<void> {
  const ref = await resolveDuelChannelRef(segment, duel)
  const segments = collectDuelChannelSegments(segment, ref)
  await Promise.all(
    segments.map((s) =>
      triggerSafe(duelPrivateChannel(s), 'duel.chat', { inviteSegment: s, message })
    )
  )
}

export async function notifyUserDuelInviteCreated(
  recipientUserIdHex: string,
  row: { id: string; hostName: string; inviteSegment: string; createdAt: string; expiresAt?: string }
): Promise<void> {
  await triggerSafe(userPrivateChannel(recipientUserIdHex), 'duel_invite.created', row as unknown as Record<
    string,
    unknown
  >)
}

export async function notifyUserDuelInviteRemoved(
  recipientUserIdHex: string,
  inviteRowId: string
): Promise<void> {
  await triggerSafe(userPrivateChannel(recipientUserIdHex), 'duel_invite.removed', { id: inviteRowId })
}

/** Host user channel — opponent accepted / joined the waiting room. */
export async function notifyUserDuelOpponentJoined(
  hostUserIdHex: string,
  row: { inviteSegment: string; guestName: string; duelObjectId: string }
): Promise<void> {
  await triggerSafe(userPrivateChannel(hostUserIdHex), 'duel.opponent_joined', row as unknown as Record<
    string,
    unknown
  >)
}

async function notifyMapScoresKeys(keys: string[]): Promise<void> {
  const seen = new Set<string>()
  for (const k of keys) {
    const s = typeof k === 'string' ? k.trim() : ''
    if (!s || seen.has(s)) continue
    seen.add(s)
    await triggerSafe(mapScoresPublicChannel(s), 'leaderboard.updated', {
      mapKey: s,
    })
  }
}

/** After standard map leaderboard writes for `game`. */
export async function notifyStandardLeaderboardUpdated(game: Game): Promise<void> {
  const resolution = resolveStandardLeaderboardKey(game.mapId)
  const dbKey = leaderboardStorageKey(resolution)
  const keys = new Set<string>()
  keys.add(String(game.mapId))
  keys.add(typeof dbKey === 'string' ? dbKey : dbKey.toHexString())
  if (resolution.kind === 'world') {
    keys.add(WORLD_STANDARD_LEADERBOARD_KEY)
    keys.add(OFFICIAL_WORLD_ID)
  }
  await notifyMapScoresKeys(Array.from(keys))
}

export async function notifyStreakLeaderboardUpdated(game: Game): Promise<void> {
  const mapId =
    game.mapId === EQUITABLE_COUNTRY_STREAK_ID ? EQUITABLE_COUNTRY_STREAK_ID : COUNTRY_STREAKS_ID
  await notifyMapScoresKeys([mapId])
}

export async function notifyDailyChallengeLeaderboardUpdated(): Promise<void> {
  await notifyMapScoresKeys([DAILY_CHALLENGE_ID])
}
