import {
  classifyLeaderboardSettingsBucket,
  isLeaderboardEligibleGame,
  leaderboardBucketStorageKey,
} from '@backend/utils/leaderboardSettingsBucket'
import { buildStandardLeaderboardMatch } from '@backend/utils/standardLeaderboardGameMatch'

const movingSettings = { timeLimit: 0, canMove: true, canPan: true, canZoom: true }
const noMoveSettings = { timeLimit: 0, canMove: false, canPan: true, canZoom: true }
const nmpzSettings = { timeLimit: 0, canMove: false, canPan: false, canZoom: false }

describe('classifyLeaderboardSettingsBucket', () => {
  test('classifies moving, no move, and nmpz', () => {
    expect(classifyLeaderboardSettingsBucket(movingSettings)).toBe('moving')
    expect(classifyLeaderboardSettingsBucket(noMoveSettings)).toBe('no_move')
    expect(classifyLeaderboardSettingsBucket(nmpzSettings)).toBe('nmpz')
  })

  test('returns null for mixed settings', () => {
    expect(classifyLeaderboardSettingsBucket({ ...movingSettings, canZoom: false })).toBeNull()
  })
})

describe('isLeaderboardEligibleGame', () => {
  const baseEligible = {
    mode: 'standard' as const,
    state: 'finished' as const,
    unlimited: false,
    totalRounds: 5,
    notForLeaderboard: false,
    isDailyChallenge: false,
    challengeId: null,
    gameSettings: movingSettings,
  }

  test('accepts eligible moving 5-round games', () => {
    expect(isLeaderboardEligibleGame(baseEligible)).toBe(true)
  })

  test('rejects unlimited and non-5-round games', () => {
    expect(isLeaderboardEligibleGame({ ...baseEligible, unlimited: true })).toBe(false)
    expect(isLeaderboardEligibleGame({ ...baseEligible, totalRounds: 10 })).toBe(false)
  })

  test('rejects challenges and daily games', () => {
    expect(isLeaderboardEligibleGame({ ...baseEligible, challengeId: 'abc' })).toBe(false)
    expect(isLeaderboardEligibleGame({ ...baseEligible, isDailyChallenge: true })).toBe(false)
  })
})

describe('leaderboardBucketStorageKey', () => {
  test('returns composite key', () => {
    expect(leaderboardBucketStorageKey('eqcountry-us', 'nmpz')).toBe('eqcountry-us::nmpz')
  })
})

describe('buildStandardLeaderboardMatch', () => {
  test('includes bucket settings and 5-round filter', () => {
    expect(buildStandardLeaderboardMatch('nmpz')).toMatchObject({
      mode: 'standard',
      totalRounds: 5,
      unlimited: { $ne: true },
      'gameSettings.canMove': false,
      'gameSettings.canPan': false,
      'gameSettings.canZoom': false,
    })
  })
})
