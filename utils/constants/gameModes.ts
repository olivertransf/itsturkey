export const DEFAULT_TOTAL_ROUNDS = 5
export const MAX_TOTAL_ROUNDS = 50
export const UNLIMITED_LOCATION_BATCH = 12
export const DEFAULT_MULTI_PANEL_COUNT = 2
export const ALLOWED_MULTI_PANEL_COUNTS = [2, 4, 8] as const
export type AllowedMultiPanelCount = (typeof ALLOWED_MULTI_PANEL_COUNTS)[number]
/** @deprecated Use ALLOWED_MULTI_PANEL_COUNTS — kept for legacy references. */
export const MAX_MULTI_PANELS = 8
export const DEFAULT_MULTI_PER_GUESS_SECONDS = 60
export const MIN_MULTI_PER_GUESS_SECONDS = 15
export const MAX_MULTI_PER_GUESS_SECONDS = 180
export const MULTI_COOLDOWN_SECONDS = 3
