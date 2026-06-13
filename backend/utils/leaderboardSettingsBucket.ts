import type Game from '@backend/models/game'
import type { GameSettingsType } from '@types'
import type { LeaderboardSettingsBucket } from '@utils/constants/standardLeaderboard'

export type { LeaderboardSettingsBucket } from '@utils/constants/standardLeaderboard'

const BUCKET_SETTINGS_MATCH: Record<LeaderboardSettingsBucket, Record<string, boolean>> = {
  moving: {
    'gameSettings.canMove': true,
    'gameSettings.canPan': true,
    'gameSettings.canZoom': true,
  },
  no_move: {
    'gameSettings.canMove': false,
    'gameSettings.canZoom': true,
  },
  nmpz: {
    'gameSettings.canMove': false,
    'gameSettings.canPan': false,
    'gameSettings.canZoom': false,
  },
}

export function classifyLeaderboardSettingsBucket(
  gameSettings: GameSettingsType | undefined | null
): LeaderboardSettingsBucket | null {
  if (!gameSettings) return null

  const { canMove, canPan, canZoom } = gameSettings

  if (!canMove && !canPan && !canZoom) return 'nmpz'
  if (!canMove && canZoom) return 'no_move'
  if (canMove && canPan && canZoom) return 'moving'

  return null
}

export function isLeaderboardEligibleGame(
  game: Pick<
    Game,
    'mode' | 'state' | 'unlimited' | 'totalRounds' | 'notForLeaderboard' | 'isDailyChallenge' | 'challengeId' | 'gameSettings'
  >
): boolean {
  if (game.mode !== 'standard') return false
  if (game.state !== 'finished') return false
  if (game.unlimited === true) return false
  if (game.totalRounds !== 5) return false
  if (game.notForLeaderboard === true) return false
  if (game.isDailyChallenge === true) return false
  if (game.challengeId != null) return false
  if (classifyLeaderboardSettingsBucket(game.gameSettings) === null) return false
  return true
}

export function leaderboardBucketStorageKey(
  mapKey: string,
  bucket: LeaderboardSettingsBucket
): string {
  return `${mapKey}::${bucket}`
}

export function settingsMatchForLeaderboardBucket(bucket: LeaderboardSettingsBucket): Record<string, boolean> {
  return BUCKET_SETTINGS_MATCH[bucket]
}
