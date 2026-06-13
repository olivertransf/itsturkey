import type { LeaderboardSettingsBucket } from './leaderboardSettingsBucket'
import { settingsMatchForLeaderboardBucket } from './leaderboardSettingsBucket'

/** Shared filters for hub standard games that count toward public map leaderboards. */
export const STANDARD_LEADERBOARD_GAME_MATCH = {
  state: 'finished' as const,
  mode: 'standard' as const,
  isDailyChallenge: { $ne: true },
  $or: [{ challengeId: { $exists: false } }, { challengeId: null }],
}

export function buildStandardLeaderboardMatch(bucket: LeaderboardSettingsBucket) {
  return {
    ...STANDARD_LEADERBOARD_GAME_MATCH,
    unlimited: { $ne: true },
    totalRounds: 5,
    notForLeaderboard: { $ne: true },
    ...settingsMatchForLeaderboardBucket(bucket),
  }
}

export const MAP_LEADERBOARD_TOP_N = 5
