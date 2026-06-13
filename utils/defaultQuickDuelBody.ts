import { EQUITABLE_COUNTRY_STREAK_DETAILS, EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'

/** Defaults aligned with `/duel` lobby HP preset for one-tap invites from profile. */
export function defaultQuickDuelBody(opts?: { displayName?: string }) {
  return {
    mapId: EQUITABLE_COUNTRY_STREAK_ID,
    mapName: EQUITABLE_COUNTRY_STREAK_DETAILS.name,
    gameSettings: {
      timeLimit: 90,
      canMove: true,
      canPan: true,
      canZoom: true,
    },
    mode: 'hp' as const,
    startingHpHost: 6000,
    startingHpGuest: 6000,
    multiplierMode: 'round_ramp' as const,
    ...(opts?.displayName ? { displayName: opts.displayName } : {}),
  }
}
