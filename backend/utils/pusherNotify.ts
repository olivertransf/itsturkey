import type { Game } from '@backend/models'
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

export async function notifyDuelUpdated(segment: string, reason: DuelPusherReason): Promise<void> {
  await triggerSafe(duelPrivateChannel(segment), 'duel.updated', { inviteSegment: segment, reason })
}

export async function notifyDuelChat(segment: string, message: DuelChatPusherMessage): Promise<void> {
  await triggerSafe(duelPrivateChannel(segment), 'duel.chat', { inviteSegment: segment, message })
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
