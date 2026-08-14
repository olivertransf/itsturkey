import {
  buildStreetViewCssFilter,
  clampVisualIntensity,
  hasAnyVisualRestriction,
  normalizeVisualRestrictions,
  visualIntensityFactors,
  visualIntensityLabel,
} from '@utils/constants/visualRestrictions'

describe('visualRestrictions', () => {
  it('normalizes and keeps multiple flags with default intensity', () => {
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
      intensity: 1,
    })
    expect(hasAnyVisualRestriction(v)).toBe(true)
  })

  it('clamps intensity and labels extremes', () => {
    expect(clampVisualIntensity(0)).toBe(1)
    expect(clampVisualIntensity(99)).toBe(10)
    expect(visualIntensityLabel(1)).toBe('Normal')
    expect(visualIntensityLabel(10)).toBe('Impossible')
    const soft = visualIntensityFactors(1)
    const hard = visualIntensityFactors(10)
    expect(hard.motion).toBeGreaterThan(soft.motion)
    expect(hard.speed).toBeGreaterThan(soft.speed)
    expect(hard.filter).toBeGreaterThan(soft.filter)
    expect(hard.aperture).toBeLessThan(soft.aperture)
  })

  it('composes css filters for combined color effects', () => {
    const filter = buildStreetViewCssFilter({
      grayscale: true,
      invert: true,
      hueShift: true,
      blur: true,
      drunk: true,
      intensity: 1,
    })

    expect(filter).toContain('grayscale(1)')
    expect(filter).toContain('invert(1)')
    expect(filter).toContain('hue-rotate(var(--sv-hue, 0deg))')
    expect(filter).toContain('blur(7.0px)')
  })

  it('scales blur with intensity', () => {
    const soft = buildStreetViewCssFilter({ blur: true, intensity: 1 })
    const hard = buildStreetViewCssFilter({ blur: true, intensity: 10 })
    expect(soft).toContain('blur(6.5px)')
    expect(hard).not.toContain('blur(6.5px)')
    expect(hard).toMatch(/blur\([0-9.]+px\)/)
  })
})
