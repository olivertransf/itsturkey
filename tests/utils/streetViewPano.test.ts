import {
  isStreetViewStatusOk,
  panoElementHasSize,
  streetViewPanoramaRequests,
} from '@utils/helpers/streetViewPano'

describe('isStreetViewStatusOk', () => {
  test('accepts the string OK even when StreetViewStatus is missing', () => {
    const prev = (global as { google?: unknown }).google
    ;(global as { google?: unknown }).google = { maps: {} }

    expect(isStreetViewStatusOk('OK')).toBe(true)
    expect(isStreetViewStatusOk('ZERO_RESULTS')).toBe(false)

    ;(global as { google?: unknown }).google = prev
  })

  test('accepts the StreetViewStatus enum value', () => {
    const prev = (global as { google?: unknown }).google
    ;(global as { google?: unknown }).google = { maps: { StreetViewStatus: { OK: 'OK' } } }

    expect(isStreetViewStatusOk('OK')).toBe(true)

    ;(global as { google?: unknown }).google = prev
  })
})

describe('streetViewPanoramaRequests', () => {
  test('tries pano id first, then lat/lng with a wider fallback radius', () => {
    expect(streetViewPanoramaRequests({ lat: 10, lng: 20, panoId: 'abc' })).toEqual([
      { pano: 'abc' },
      { location: { lat: 10, lng: 20 }, radius: 150 },
      { location: { lat: 10, lng: 20 }, radius: 1000 },
    ])
  })

  test('skips pano id when it is empty and still retries a wider radius', () => {
    expect(streetViewPanoramaRequests({ lat: 1, lng: 2, panoId: '  ' })).toEqual([
      { location: { lat: 1, lng: 2 }, radius: 150 },
      { location: { lat: 1, lng: 2 }, radius: 1000 },
    ])
  })

  test('returns no requests when the round has no usable location', () => {
    expect(streetViewPanoramaRequests({ panoId: null })).toEqual([])
  })
})

describe('panoElementHasSize', () => {
  test('is false for a 0x0 box and true once the pano has layout', () => {
    const empty = document.createElement('div')
    Object.defineProperty(empty, 'clientWidth', { value: 0 })
    Object.defineProperty(empty, 'clientHeight', { value: 0 })
    expect(panoElementHasSize(empty)).toBe(false)

    const ready = document.createElement('div')
    Object.defineProperty(ready, 'clientWidth', { value: 390 })
    Object.defineProperty(ready, 'clientHeight', { value: 700 })
    expect(panoElementHasSize(ready)).toBe(true)
  })
})
