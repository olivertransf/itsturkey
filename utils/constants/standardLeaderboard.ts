/** Single leaderboard bucket for all hub “world” standard maps (Default World*, Equitable World*, legacy official world). */
export const WORLD_STANDARD_LEADERBOARD_KEY = 'standard-world-unified'

export type LeaderboardSettingsBucket = 'moving' | 'no_move' | 'nmpz'

export const LEADERBOARD_SETTINGS_BUCKETS: LeaderboardSettingsBucket[] = ['moving', 'no_move', 'nmpz']

export const LEADERBOARD_BUCKET_LABELS: Record<LeaderboardSettingsBucket, string> = {
  moving: 'Moving',
  no_move: 'No Move',
  nmpz: 'NMPZ',
}
