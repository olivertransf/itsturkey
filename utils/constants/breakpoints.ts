/**
 * Shared CSS media queries for responsive / touch layouts.
 *
 * In-game guess map:
 * - Phones (≤600px): bottom sheet + floating map button
 * - iPad / touch tablets: corner map with tap-to-expand (not the phone sheet)
 */

/** Phones — denser hub layouts and bottom-sheet guess map. */
export const PHONE_MQ = '(max-width: 600px)'

/** Bottom-sheet guess map + floating map toggle (phones only). */
export const PHONE_GUESS_MAP_MQ = '(max-width: 600px)'

/**
 * @deprecated Use PHONE_GUESS_MAP_MQ for the sheet, or touch expand for tablets.
 * Kept as an alias so older imports keep compiling during the iPad UX switch.
 */
export const MOBILE_GUESS_MAP_MQ = PHONE_GUESS_MAP_MQ

/** Primary input is a finger (iPhone / iPad without relying on width alone). */
export const TOUCH_PRIMARY_MQ = '(hover: none) and (pointer: coarse)'

/** Compact hub chrome / bottom nav style layouts. */
export const TABLET_DOWN_MQ = '(max-width: 1024px)'
