export type VisualRestrictions = {
  grayscale?: boolean
  invert?: boolean
  hueShift?: boolean
  blink?: boolean
  pixelate?: boolean
  /** Higher = chunkier pixels. Clamped 2–16. */
  pixelateLevel?: number
  upsideDown?: boolean
  spin?: boolean
  wander?: boolean
  mirror?: boolean
  blur?: boolean
  vignette?: boolean
  drunk?: boolean
  rgbSplit?: boolean
  sepia?: boolean
  posterize?: boolean
  tunnel?: boolean
  wobble?: boolean
  flashlight?: boolean
  staticNoise?: boolean
  comic?: boolean
  nightVision?: boolean
  stretch?: boolean
  zigzag?: boolean
  deepFry?: boolean
  bubble?: boolean
}

export type VisualRestrictionKey = Exclude<keyof VisualRestrictions, 'pixelateLevel'>

export const DEFAULT_PIXELATE_LEVEL = 6

export const EMPTY_VISUAL_RESTRICTIONS: VisualRestrictions = {}

export type VisualRestrictionMeta = {
  key: VisualRestrictionKey
  label: string
  blurb: string
}

/** Toggleable FX shown in lobbies (pixelateLevel is a slider when pixelate is on). */
export const VISUAL_RESTRICTION_CATALOG: VisualRestrictionMeta[] = [
  { key: 'grayscale', label: 'Grayscale', blurb: 'Black and white imagery' },
  { key: 'invert', label: 'Invert', blurb: 'Colors flipped' },
  { key: 'hueShift', label: 'Hue shift', blurb: 'Colors cycle randomly' },
  { key: 'blink', label: 'Blink', blurb: 'Fades to black and back' },
  { key: 'pixelate', label: 'Pixelated', blurb: 'Chunky low-res look' },
  { key: 'upsideDown', label: 'Upside down', blurb: 'World flipped 180°' },
  { key: 'spin', label: 'Spinning', blurb: 'Panorama slowly rotates' },
  { key: 'wander', label: 'Wander', blurb: 'Drifts around the screen' },
  { key: 'mirror', label: 'Mirror', blurb: 'Horizontal flip' },
  { key: 'blur', label: 'Blur', blurb: 'Soft out-of-focus view' },
  { key: 'vignette', label: 'Vignette', blurb: 'Dark edges close in' },
  { key: 'drunk', label: 'Drunk', blurb: 'Wobbly, tipsy camera' },
  { key: 'rgbSplit', label: 'RGB split', blurb: 'Chromatic aberration' },
  { key: 'sepia', label: 'Sepia', blurb: 'Old photo tint' },
  { key: 'posterize', label: 'Posterize', blurb: 'Harsh flat colors' },
  { key: 'tunnel', label: 'Tunnel', blurb: 'Look through a tube' },
  { key: 'wobble', label: 'Wobble', blurb: 'Jelly camera shake' },
  { key: 'flashlight', label: 'Flashlight', blurb: 'Tiny lit circle only' },
  { key: 'staticNoise', label: 'Static', blurb: 'TV snow overlay' },
  { key: 'comic', label: 'Comic', blurb: 'Ink / pop contrast' },
  { key: 'nightVision', label: 'Night vision', blurb: 'Green goggles vibe' },
  { key: 'stretch', label: 'Stretch', blurb: 'Squeezed widescreen' },
  { key: 'zigzag', label: 'Zigzag', blurb: 'Skew bounce' },
  { key: 'deepFry', label: 'Deep fry', blurb: 'Overcooked meme look' },
  { key: 'bubble', label: 'Bubble', blurb: 'Fish-eye warp' },
]

export const clampPixelateLevel = (n: unknown): number => {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return DEFAULT_PIXELATE_LEVEL
  return Math.min(16, Math.max(2, Math.round(v)))
}

export const normalizeVisualRestrictions = (
  raw?: VisualRestrictions | null
): VisualRestrictions => {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_VISUAL_RESTRICTIONS }
  const next: VisualRestrictions = {}
  for (const { key } of VISUAL_RESTRICTION_CATALOG) {
    if (raw[key]) next[key] = true
  }
  if (next.pixelate) {
    next.pixelateLevel = clampPixelateLevel(raw.pixelateLevel)
  }
  return next
}

export const hasAnyVisualRestriction = (raw?: VisualRestrictions | null): boolean => {
  const v = normalizeVisualRestrictions(raw)
  return VISUAL_RESTRICTION_CATALOG.some(({ key }) => Boolean(v[key]))
}

export const buildStreetViewCssFilter = (v: VisualRestrictions): string => {
  const parts: string[] = []
  if (v.grayscale) parts.push('grayscale(1)')
  if (v.invert) parts.push('invert(1)')
  if (v.sepia) parts.push('sepia(0.85)')
  if (v.blur && v.drunk) parts.push('blur(3.6px)')
  else if (v.drunk) parts.push('blur(2.2px)')
  else if (v.blur) parts.push('blur(3.2px)')
  if (v.posterize) parts.push('contrast(1.85) saturate(1.65) brightness(1.05)')
  if (v.comic) parts.push('contrast(2.1) saturate(1.8) brightness(1.08)')
  if (v.nightVision) parts.push('grayscale(0.35) sepia(0.4) hue-rotate(70deg) saturate(2.4) brightness(1.15) contrast(1.25)')
  if (v.deepFry) parts.push('contrast(2.4) saturate(2.8) brightness(1.15) hue-rotate(15deg)')
  if (v.rgbSplit) {
    parts.push(
      'drop-shadow(-3px 0 0 rgba(255,0,80,0.55)) drop-shadow(3px 0 0 rgba(0,220,255,0.5))'
    )
  }
  if (v.hueShift) parts.push('hue-rotate(var(--sv-hue, 0deg))')
  return parts.join(' ')
}
