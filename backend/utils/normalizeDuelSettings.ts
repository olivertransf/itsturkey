import { z } from 'zod'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { normalizeVisualRestrictions } from '@utils/constants/visualRestrictions'
import { DUEL_DEFAULT_HP, DUEL_DEFAULT_REACTIVE_SECONDS, DUEL_HP_LOCATION_BATCH } from './duelConstants'
import type { DuelMultiplierMode } from '@backend/models/duelSession'

const visualRestrictionsSchema = z
  .object({
    grayscale: z.boolean().optional(),
    invert: z.boolean().optional(),
    hueShift: z.boolean().optional(),
    blink: z.boolean().optional(),
    pixelate: z.boolean().optional(),
    pixelateLevel: z.number().min(2).max(16).optional(),
    intensity: z.number().min(1).max(10).optional(),
    upsideDown: z.boolean().optional(),
    spin: z.boolean().optional(),
    wander: z.boolean().optional(),
    mirror: z.boolean().optional(),
    blur: z.boolean().optional(),
    vignette: z.boolean().optional(),
    drunk: z.boolean().optional(),
    rgbSplit: z.boolean().optional(),
    sepia: z.boolean().optional(),
    posterize: z.boolean().optional(),
    tunnel: z.boolean().optional(),
    wobble: z.boolean().optional(),
    flashlight: z.boolean().optional(),
    staticNoise: z.boolean().optional(),
    comic: z.boolean().optional(),
    nightVision: z.boolean().optional(),
    stretch: z.boolean().optional(),
    zigzag: z.boolean().optional(),
    deepFry: z.boolean().optional(),
    bubble: z.boolean().optional(),
  })
  .optional()

export const gameSettingsSchema = z.object({
  timeLimit: z.number(),
  canMove: z.boolean(),
  canPan: z.boolean(),
  canZoom: z.boolean(),
  visualRestrictions: visualRestrictionsSchema,
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
  const fx = normalizeVisualRestrictions(data.gameSettings.visualRestrictions)
  const gameSettings = {
    timeLimit: data.gameSettings.timeLimit,
    canMove: data.gameSettings.canMove,
    canPan: data.gameSettings.canPan,
    canZoom: data.gameSettings.canZoom,
    ...(Object.keys(fx).length ? { visualRestrictions: fx } : {}),
  }

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
        gameSettings,
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
      gameSettings,
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
