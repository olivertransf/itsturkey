import { getGuessMapOptions, isPanZoomEnabled } from '@utils/constants/googleMapOptions'

describe('isPanZoomEnabled', () => {
  test('uses shared value when canPan and canZoom match', () => {
    expect(isPanZoomEnabled({ canPan: true, canZoom: true })).toBe(true)
    expect(isPanZoomEnabled({ canPan: false, canZoom: false })).toBe(false)
  })

  test('treats either flag as enabled for legacy mismatched settings', () => {
    expect(isPanZoomEnabled({ canPan: true, canZoom: false })).toBe(true)
    expect(isPanZoomEnabled({ canPan: false, canZoom: true })).toBe(true)
  })
})

describe('getGuessMapOptions', () => {
  test('disables drag, gestures, and scroll zoom when pan is off', () => {
    expect(getGuessMapOptions({ canPan: false, canZoom: false })).toMatchObject({
      draggable: false,
      gestureHandling: 'none',
      scrollwheel: false,
      disableDoubleClickZoom: true,
    })
  })

  test('keeps greedy gestures when pan is on', () => {
    expect(getGuessMapOptions({ canPan: true, canZoom: true })).toMatchObject({
      draggable: true,
      gestureHandling: 'greedy',
      scrollwheel: true,
      disableDoubleClickZoom: false,
    })
  })
})
