import { EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'

/**
 * Duels sample rounds from the equitable-world GeoHub map union (~125k locations),
 * same pool as the Equitable World streak map. The lobby map still drives scoring (`mapScoreFactor`) and UI metadata.
 */
export const DUEL_ROUND_LOCATION_POOL_ID = EQUITABLE_COUNTRY_STREAK_ID

/** GeoGuessr-style ramp: rounds 1–4 → 1×, round 5 → 1.5×, round 6 → 2×, … */
export const duelRoundDamageMultiplier = (roundOneBased: number, enabled: boolean): number => {
  if (!enabled) return 1
  if (roundOneBased < 5) return 1
  return 1 + 0.5 * (roundOneBased - 4)
}

export const DUEL_DEFAULT_HP = 6000
export const DUEL_DEFAULT_REACTIVE_SECONDS = 15
export const DUEL_PIN_MIN_INTERVAL_MS = 900
export const DUEL_DAMAGE_MIN = 50
export const DUEL_DAMAGE_MAX = 3500
/** Pre-drawn rounds for HP duels until KO */
export const DUEL_HP_LOCATION_BATCH = 80
export const DUEL_DISTANCE_TIE_EPSILON_METERS = 3

/** Friend push invites auto-expire; host can re-invite from the lobby. */
export const DUEL_FRIEND_INVITE_TTL_MS = 60 * 1000
