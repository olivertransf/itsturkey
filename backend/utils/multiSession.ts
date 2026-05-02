import type { Game } from '@backend/models'
import {
  DEFAULT_MULTI_PANEL_COUNT,
  DEFAULT_MULTI_PER_GUESS_SECONDS,
  DEFAULT_TOTAL_ROUNDS,
  MAX_MULTI_PANELS,
  MAX_MULTI_PER_GUESS_SECONDS,
  MAX_TOTAL_ROUNDS,
  MIN_MULTI_PER_GUESS_SECONDS,
  MULTI_COOLDOWN_SECONDS,
} from '@utils/constants/gameModes'

export type MultiSessionSettingsInput = {
  panelCount?: unknown
  totalRoundsPerPanel?: unknown
  perGuessSeconds?: unknown
  cooldownSeconds?: unknown
}

export type NormalizedMultiSessionSettings = {
  panelCount: number
  totalRoundsPerPanel: number
  perGuessSeconds: number
  cooldownSeconds: number
}

const clampInt = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  const finiteValue = Number.isFinite(parsed) ? parsed : fallback

  return Math.min(max, Math.max(min, finiteValue))
}

export const normalizeMultiSessionSettings = ({
  panelCount,
  totalRoundsPerPanel,
  perGuessSeconds,
  cooldownSeconds,
}: MultiSessionSettingsInput): NormalizedMultiSessionSettings => ({
  panelCount: clampInt(panelCount, DEFAULT_MULTI_PANEL_COUNT, 1, MAX_MULTI_PANELS),
  totalRoundsPerPanel: clampInt(totalRoundsPerPanel, DEFAULT_TOTAL_ROUNDS, 1, MAX_TOTAL_ROUNDS),
  perGuessSeconds: clampInt(
    perGuessSeconds,
    DEFAULT_MULTI_PER_GUESS_SECONDS,
    MIN_MULTI_PER_GUESS_SECONDS,
    MAX_MULTI_PER_GUESS_SECONDS
  ),
  cooldownSeconds: clampInt(cooldownSeconds, MULTI_COOLDOWN_SECONDS, 1, 10),
})

export const calculateMultiSessionTotalPoints = (panelGames: Pick<Game, 'totalPoints'>[]) =>
  panelGames.reduce((total, game) => total + (game.totalPoints ?? 0), 0)
