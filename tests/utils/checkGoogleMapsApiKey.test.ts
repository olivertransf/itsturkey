import {
  GOOGLE_MAPS_KEY_LENGTH,
  isPlausibleGoogleMapsApiKey,
  normalizeGoogleMapsApiKey,
} from '@utils/helpers/checkGoogleMapsApiKey'

describe('checkGoogleMapsApiKey helpers', () => {
  it('trims and validates plausible Maps keys', () => {
    const key = `AIza${'a'.repeat(35)}`
    expect(key).toHaveLength(GOOGLE_MAPS_KEY_LENGTH)
    expect(normalizeGoogleMapsApiKey(`  ${key}  `)).toBe(key)
    expect(isPlausibleGoogleMapsApiKey(key)).toBe(true)
    expect(isPlausibleGoogleMapsApiKey('short')).toBe(false)
    expect(isPlausibleGoogleMapsApiKey(`BIza${'a'.repeat(35)}`)).toBe(false)
  })
})
