import {
  calculateMultiSessionTotalPoints,
  normalizeMultiPanelCount,
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
    panelCount: 8,
    totalRoundsPerPanel: 1,
    perGuessSeconds: 180,
    cooldownSeconds: 3,
  })
})

test('only allows multi panel counts of 2, 4, or 8', () => {
  expect(normalizeMultiPanelCount(2)).toBe(2)
  expect(normalizeMultiPanelCount(4)).toBe(4)
  expect(normalizeMultiPanelCount(8)).toBe(8)
  expect(normalizeMultiPanelCount(3)).toBe(2)
  expect(normalizeMultiPanelCount(5)).toBe(4)
  expect(normalizeMultiPanelCount(6)).toBe(4)
  expect(normalizeMultiPanelCount(7)).toBe(8)
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
