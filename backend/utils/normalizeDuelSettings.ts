import { z } from 'zod'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import {
  DUEL_DAMAGE_MAX,
  DUEL_DAMAGE_MIN,
  DUEL_DEFAULT_HP,
  DUEL_DEFAULT_REACTIVE_SECONDS,
  DUEL_HP_LOCATION_BATCH,
} from './duelConstants'

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
  damageMultiplierHost: z.number().min(0.1).max(10).optional(),
  damageMultiplierGuest: z.number().min(0.1).max(10).optional(),
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
  damageMultiplierHost: number
  damageMultiplierGuest: number
  useRoundRamp: boolean
  displayName?: string
}

export const normalizeCreateDuelBody = (raw: unknown): { ok: true; value: NormalizedCreateDuelBody } | { ok: false; message: string } => {
  const parsed = createDuelBodySchema.safeParse(raw)

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ') || 'Invalid duel settings'
    return { ok: false, message: msg }
  }

  const data = parsed.data

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
        damageMultiplierHost: data.damageMultiplierHost ?? 1,
        damageMultiplierGuest: data.damageMultiplierGuest ?? 1,
        useRoundRamp: data.useRoundRamp ?? true,
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
      damageMultiplierHost: data.damageMultiplierHost ?? 1,
      damageMultiplierGuest: data.damageMultiplierGuest ?? 1,
      useRoundRamp: data.useRoundRamp ?? true,
      ...(data.displayName != null && data.displayName !== ''
        ? { displayName: data.displayName }
        : {}),
    },
  }
}

export const clampDamage = (raw: number): number =>
  Math.min(DUEL_DAMAGE_MAX, Math.max(DUEL_DAMAGE_MIN, Math.round(raw)))
