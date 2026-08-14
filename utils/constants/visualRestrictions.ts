export type VisualRestrictions = {
  grayscale?: boolean
  invert?: boolean
  hueShift?: boolean
  blink?: boolean
  pixelate?: boolean
  /** Higher = chunkier pixels. Clamped 2–16. */
  pixelateLevel?: number
  /**
   * Global FX strength. 1 = current “normal” look; 10 = practically unreadable.
   * Only persisted when at least one effect is on.
   */
  intensity?: number
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

export type VisualRestrictionKey = Exclude<keyof VisualRestrictions, 'pixelateLevel' | 'intensity'>

export const DEFAULT_PIXELATE_LEVEL = 6
export const DEFAULT_VISUAL_INTENSITY = 1
export const MIN_VISUAL_INTENSITY = 1
export const MAX_VISUAL_INTENSITY = 10

export const EMPTY_VISUAL_RESTRICTIONS: VisualRestrictions = {}

export type VisualRestrictionMeta = {
  key: VisualRestrictionKey
  label: string
  blurb: string
}

/** Toggleable FX shown in lobbies (pixelateLevel / intensity are sliders). */
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

export const clampVisualIntensity = (n: unknown): number => {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return DEFAULT_VISUAL_INTENSITY
  return Math.min(MAX_VISUAL_INTENSITY, Math.max(MIN_VISUAL_INTENSITY, Math.round(v)))
}

export const visualIntensityLabel = (n: unknown): string => {
  const i = clampVisualIntensity(n)
  if (i <= 1) return 'Normal'
  if (i <= 3) return 'Spicy'
  if (i <= 5) return 'Rough'
  if (i <= 7) return 'Chaos'
  if (i <= 9) return 'Brutal'
  return 'Impossible'
}

/** Derived multipliers for CSS / filters. Intensity 1 ≈ current baseline. */
export const visualIntensityFactors = (intensity: unknown) => {
  const i = clampVisualIntensity(intensity)
  const t = (i - 1) / 9
  return {
    intensity: i,
    /** Motion amplitude (wander / drunk / wobble / zigzag / bubble). */
    motion: 1 + t * 4,
    /** Animation speed multiplier (higher = faster / more frantic). */
    speed: 1 + t * 5,
    /** Blur / RGB / contrast boost. */
    filter: 1 + t * 3.5,
    /** Static noise opacity. */
    noise: Math.min(1, 0.55 + t * 0.5),
    /** Pixel mosaic cell scale. */
    pixel: 1 + t * 2.8,
    /** Flashlight / tunnel / vignette hole shrink (1 = baseline, lower = tinier). */
    aperture: Math.max(0.12, 1 - t * 0.88),
    /** Stretch exaggeration. */
    stretch: 1 + t * 1.4,
  }
}

export type VisualIntensityFactors = ReturnType<typeof visualIntensityFactors>

/** Mosaic cell radius for the SVG pixelate filter (higher level → chunkier). */
export const pixelateFilterCellSize = (level: unknown, intensity: unknown = DEFAULT_VISUAL_INTENSITY): number => {
  const n = clampPixelateLevel(level)
  const { pixel } = visualIntensityFactors(intensity)
  const base = 3 + ((n - 2) * 18) / 14
  return Math.max(2, Math.round(base * pixel))
}

export const normalizeVisualRestrictions = (
  raw?: VisualRestrictions | null
): VisualRestrictions => {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_VISUAL_RESTRICTIONS }
  const next: VisualRestrictions = {}
  for (const { key } of VISUAL_RESTRICTION_CATALOG) {
    if (raw[key]) next[key] = true
  }
  const anyOn = VISUAL_RESTRICTION_CATALOG.some(({ key }) => Boolean(next[key]))
  if (!anyOn) return { ...EMPTY_VISUAL_RESTRICTIONS }

  next.intensity = clampVisualIntensity(raw.intensity ?? DEFAULT_VISUAL_INTENSITY)
  if (next.pixelate) {
    next.pixelateLevel = clampPixelateLevel(raw.pixelateLevel)
  }
  return next
}

export const hasAnyVisualRestriction = (raw?: VisualRestrictions | null): boolean => {
  const v = normalizeVisualRestrictions(raw)
  return VISUAL_RESTRICTION_CATALOG.some(({ key }) => Boolean(v[key]))
}

export const buildStreetViewCssFilter = (
  v: VisualRestrictions,
  intensity: unknown = v.intensity
): string => {
  const f = visualIntensityFactors(intensity ?? DEFAULT_VISUAL_INTENSITY)
  const parts: string[] = []
  if (v.grayscale) parts.push('grayscale(1)')
  if (v.invert) parts.push('invert(1)')
  if (v.sepia) parts.push(`sepia(1) contrast(${(1.15 * (0.85 + f.filter * 0.15)).toFixed(2)}) brightness(0.95)`)
  if (v.blur && v.drunk) parts.push(`blur(${(7 * f.filter).toFixed(1)}px)`)
  else if (v.drunk) parts.push(`blur(${(4.5 * f.filter).toFixed(1)}px)`)
  else if (v.blur) parts.push(`blur(${(6.5 * f.filter).toFixed(1)}px)`)
  if (v.posterize)
    parts.push(
      `contrast(${(2.4 * (0.7 + f.filter * 0.3)).toFixed(2)}) saturate(${(2.1 * (0.7 + f.filter * 0.3)).toFixed(2)}) brightness(1.08)`
    )
  if (v.comic)
    parts.push(
      `contrast(${(2.8 * (0.7 + f.filter * 0.3)).toFixed(2)}) saturate(${(2.4 * (0.7 + f.filter * 0.3)).toFixed(2)}) brightness(1.12)`
    )
  if (v.nightVision)
    parts.push(
      `grayscale(0.2) sepia(0.65) hue-rotate(75deg) saturate(${(3.2 * (0.75 + f.filter * 0.25)).toFixed(2)}) brightness(${(1.35 * (0.9 + f.filter * 0.1)).toFixed(2)}) contrast(${(1.55 * (0.8 + f.filter * 0.2)).toFixed(2)})`
    )
  if (v.deepFry)
    parts.push(
      `contrast(${(3.2 * (0.7 + f.filter * 0.3)).toFixed(2)}) saturate(${(3.6 * (0.7 + f.filter * 0.3)).toFixed(2)}) brightness(1.25) hue-rotate(${Math.round(22 + f.filter * 18)}deg)`
    )
  if (v.rgbSplit) {
    const px = Math.round(7 * f.filter)
    parts.push(
      `drop-shadow(-${px}px 0 0 rgba(255,0,80,0.85)) drop-shadow(${px}px 0 0 rgba(0,220,255,0.8))`
    )
  }
  if (v.hueShift) parts.push(`hue-rotate(var(--sv-hue, 0deg)) saturate(${(1.35 * (0.85 + f.filter * 0.15)).toFixed(2)})`)
  return parts.join(' ')
}
