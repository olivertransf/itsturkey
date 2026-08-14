import {
  buildStreetViewCssFilter,
  hasAnyVisualRestriction,
  normalizeVisualRestrictions,
} from '@utils/constants/visualRestrictions'

describe('visualRestrictions', () => {
  it('normalizes and keeps multiple flags', () => {
    const v = normalizeVisualRestrictions({
      grayscale: true,
      invert: true,
      spin: true,
      wander: true,
      pixelate: true,
      pixelateLevel: 9,
      fake: true,
    } as any)

    expect(v).toEqual({
      grayscale: true,
      invert: true,
      spin: true,
      wander: true,
      pixelate: true,
      pixelateLevel: 9,
    })
    expect(hasAnyVisualRestriction(v)).toBe(true)
  })

  it('composes css filters for combined color effects', () => {
    const filter = buildStreetViewCssFilter({
      grayscale: true,
      invert: true,
      hueShift: true,
      blur: true,
      drunk: true,
    })

    expect(filter).toContain('grayscale(1)')
    expect(filter).toContain('invert(1)')
    expect(filter).toContain('hue-rotate(var(--sv-hue, 0deg))')
    expect(filter).toContain('blur(3.6px)')
  })
})
