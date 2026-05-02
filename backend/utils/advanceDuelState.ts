import type DuelSession from '@backend/models/duelSession'
import { tryResolveCurrentRound } from './duelResolve'
import { ensureNextRoundLocation } from './ensureDuelLocations'

export const advanceDuelState = async (duel: DuelSession): Promise<{ duel: DuelSession; mutated: boolean }> => {
  let mutated = false
  const now = new Date()

  if (duel.status !== 'in_progress' || !duel.guest.joined) {
    return { duel, mutated }
  }

  /* eslint-disable no-await-in-loop */
  while (duel.status === 'in_progress') {
    if (!(await ensureNextRoundLocation(duel))) {
      break
    }

    if (duel.completedRounds >= duel.locations.length) {
      break
    }

    const actual = duel.locations[duel.completedRounds]
    const out = tryResolveCurrentRound(duel, now, actual)

    if (out.type === 'none') {
      break
    }

    mutated = true
  }
  /* eslint-enable no-await-in-loop */

  return { duel, mutated }
}
