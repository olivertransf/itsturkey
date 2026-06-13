import { z } from 'zod'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { DUEL_DEFAULT_HP, DUEL_DEFAULT_REACTIVE_SECONDS, DUEL_HP_LOCATION_BATCH } from './duelConstants'
import type { DuelMultiplierMode } from '@backend/models/duelSession'

export const gameSettingsSchema = z.object({
  timeLimit: z.number(),
  canMove: z.boolean(),
  canPan: z.boolean(),
  canZoom: z.boolean(),
})

export const createDuelBodySchema = z.object({
  mapId: z.string().min(1),
  mapName: z.string().optional(),
  gameSettings: gameSettingsSchema,
  mode: z.enum(['hp', 'points']),
  totalRounds: z.number().int().optional(),
  reactiveSeconds: z.number().min(5).max(120).optional(),
  startingHpHost: z.number().min(100).max(500000).optional(),
  startingHpGuest: z.number().min(100).max(500000).optional(),
  multiplierMode: z.enum(['round_ramp', 'win_streak']).optional(),
  /** @deprecated Use multiplierMode */
  useRoundRamp: z.boolean().optional(),
  /** Shown as room creator when hosting without an account */
  displayName: z.string().max(32).optional(),
})

export type NormalizedCreateDuelBody = {
  mapId: string
  mapName?: string
  gameSettings: z.infer<typeof gameSettingsSchema>
  mode: 'hp' | 'points'
  locationCount: number
  totalRounds?: number
  reactiveSeconds: number
  startingHpHost: number
  startingHpGuest: number
  multiplierMode: DuelMultiplierMode
  displayName?: string
}

const resolveMultiplierMode = (data: z.infer<typeof createDuelBodySchema>): DuelMultiplierMode => {
  if (data.multiplierMode) return data.multiplierMode
  return 'round_ramp'
}

export const normalizeCreateDuelBody = (raw: unknown): { ok: true; value: NormalizedCreateDuelBody } | { ok: false; message: string } => {
  const parsed = createDuelBodySchema.safeParse(raw)

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ') || 'Invalid duel settings'
    return { ok: false, message: msg }
  }

  const data = parsed.data
  const multiplierMode = resolveMultiplierMode(data)

  if (data.mode === 'points') {
    let tr = data.totalRounds
    if (tr === undefined || !Number.isFinite(tr)) {
      tr = DEFAULT_TOTAL_ROUNDS
    }
    const totalRounds = Math.min(MAX_TOTAL_ROUNDS, Math.max(1, Math.floor(tr)))

    return {
      ok: true,
      value: {
        mapId: data.mapId,
        mapName: data.mapName,
        gameSettings: data.gameSettings,
        mode: 'points',
        locationCount: totalRounds,
        totalRounds,
        reactiveSeconds: data.reactiveSeconds ?? DUEL_DEFAULT_REACTIVE_SECONDS,
        startingHpHost: data.startingHpHost ?? DUEL_DEFAULT_HP,
        startingHpGuest: data.startingHpGuest ?? DUEL_DEFAULT_HP,
        multiplierMode,
        ...(data.displayName != null && data.displayName !== ''
          ? { displayName: data.displayName }
          : {}),
      },
    }
  }

  return {
    ok: true,
    value: {
      mapId: data.mapId,
      mapName: data.mapName,
      gameSettings: data.gameSettings,
      mode: 'hp',
      locationCount: DUEL_HP_LOCATION_BATCH,
      reactiveSeconds: data.reactiveSeconds ?? DUEL_DEFAULT_REACTIVE_SECONDS,
      startingHpHost: data.startingHpHost ?? DUEL_DEFAULT_HP,
      startingHpGuest: data.startingHpGuest ?? DUEL_DEFAULT_HP,
      multiplierMode,
      ...(data.displayName != null && data.displayName !== ''
        ? { displayName: data.displayName }
        : {}),
    },
  }
}
