// Guess map uses two layouts:
// - idle: small wide strip when you're not interacting
// - expanded: larger rectangle while hovered/pinned (or mobile sheet open)
//
// Important: idle sizing is intentionally NOT a uniform scale of expanded sizing,
// so tuning hover size doesn't change the idle footprint.
//
// Width is scaled below viewport-relative height so the corner map stays less wide.

/** Applied in useGuessMap: both table axes use vmin so aspect ratio is stable across viewports. */
export const GUESS_MAP_VMIN_MULTIPLIER = 0.94

/** Hard cap (px) on corner-map width; height follows via CSS aspect-ratio. */
export const GUESS_MAP_MAX_WIDTH_PX = 580

/** Hover/pin: scale idle width+height by this (same aspect ratio as uncovered). */
export const GUESS_MAP_HOVER_UNIFORM_SCALE = 2.05

/** Table width vs height: lower = narrower strip (same hover/idle behavior). */
const MAP_WIDTH_SCALE = 0.68

const IDLE_SIZES = [
  { width: 15, height: 15 },
  { width: 34, height: 15 },
  { width: 42, height: 17 },
  { width: 52, height: 20 },
]

const EXPANDED_SIZES = [
  { width: 15, height: 15 },
  { width: 58, height: 40 },
  { width: 74, height: 50 },
  { width: 94, height: 64 },
]

const scaleWidth = (box: { width: number; height: number }) => ({
  width: box.width * MAP_WIDTH_SCALE,
  height: box.height,
})

const clampSizeIndex = (size: number) => {
  if (!Number.isFinite(size)) return 1
  const rounded = Math.round(size)
  return Math.min(4, Math.max(1, rounded))
}

export const getGuessMapIdleSize = (size: number) => scaleWidth(IDLE_SIZES[clampSizeIndex(size) - 1])

export const getGuessMapExpandedSize = (size: number) => scaleWidth(EXPANDED_SIZES[clampSizeIndex(size) - 1])

// Back-compat: existing callers mean "expanded/workspace" sizing
const getGuessMapSize = (size: number) => getGuessMapExpandedSize(size)

export default getGuessMapSize
