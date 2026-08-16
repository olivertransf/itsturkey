import type Game from '@backend/models/game'
import { getGuessMapOptions, getStreetviewOptions, isPanZoomEnabled } from '@utils/constants/googleMapOptions'

describe('isPanZoomEnabled', () => {
  test('is true when either pan or zoom is allowed', () => {
    expect(isPanZoomEnabled({ canPan: true, canZoom: true })).toBe(true)
    expect(isPanZoomEnabled({ canPan: false, canZoom: false })).toBe(false)
    expect(isPanZoomEnabled({ canPan: true, canZoom: false })).toBe(true)
    expect(isPanZoomEnabled({ canPan: false, canZoom: true })).toBe(true)
  })
})

describe('getGuessMapOptions', () => {
  test('always keeps greedy guess-map gestures (independent of street-view NMPZ)', () => {
    expect(getGuessMapOptions({ canPan: false, canZoom: false })).toMatchObject({
      draggable: true,
      gestureHandling: 'greedy',
      scrollwheel: true,
      disableDoubleClickZoom: false,
    })
    expect(getGuessMapOptions({ canPan: true, canZoom: true })).toMatchObject({
      draggable: true,
      gestureHandling: 'greedy',
      scrollwheel: true,
      disableDoubleClickZoom: false,
    })
  })
})

describe('getStreetviewOptions', () => {
  test('does not throw when ControlPosition is missing from google.maps', () => {
    const prev = (global as { google?: unknown }).google
    ;(global as { google?: unknown }).google = { maps: {} }

    const game = {
      gameSettings: { canPan: true, canZoom: true, canMove: true },
    } as Game

    expect(() => getStreetviewOptions(game)).not.toThrow()
    expect(getStreetviewOptions(game).panControlOptions.position).toBe(6)

    ;(global as { google?: unknown }).google = prev
  })
})
