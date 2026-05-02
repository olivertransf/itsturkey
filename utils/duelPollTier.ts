import type { DuelClientPayload } from '@components/duel/duelApiTypes'

export type DuelPollTier = 'bootstrap' | 'lobby' | 'quiet_play' | 'active_play' | 'finished'

/** Derives polling cadence: slow when nothing time-sensitive; faster during reactive countdown / locks. */
export const duelPollTier = (p: DuelClientPayload | undefined): DuelPollTier => {
  if (!p) return 'bootstrap'
  if (p.status === 'finished') return 'finished'
  if (p.status === 'waiting') return 'lobby'
  if (p.status !== 'in_progress') return 'lobby'

  const deadline = !!p.roundDeadlineAt
  const anyLocked = p.flags.youLocked || p.flags.opponentLocked
  if (deadline || anyLocked) return 'active_play'
  return 'quiet_play'
}

export const DUEL_POLL_MS: Record<DuelPollTier, number> = {
  bootstrap: 1200,
  lobby: 4500,
  quiet_play: 2800,
  active_play: 900,
  finished: 12000,
}
