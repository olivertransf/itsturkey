import {
  calculateMultiSessionTotalPoints,
  normalizeMultiSessionSettings,
} from '@backend/utils/multiSession'

test('normalizes multi-session settings to playable bounds', () => {
  expect(
    normalizeMultiSessionSettings({
      panelCount: 99,
      totalRoundsPerPanel: -1,
      perGuessSeconds: 999,
    })
  ).toEqual({
    panelCount: 4,
    totalRoundsPerPanel: 1,
    perGuessSeconds: 180,
    cooldownSeconds: 3,
  })
})

test('sums points from every panel game', () => {
  expect(
    calculateMultiSessionTotalPoints([
      { totalPoints: 3500 },
      { totalPoints: 0 },
      { totalPoints: 4200 },
    ])
  ).toBe(7700)
})
