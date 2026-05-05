import { ObjectId } from 'mongodb'
import { WORLD_STANDARD_LEADERBOARD_KEY } from '@utils/constants/standardLeaderboard'
import { isMongoObjectIdHex24 } from '@utils/helpers/equitableCountryMapId'
import { isEquitableVirtualStandardMapId } from './equitableCountryMap'
import getWorldStandardLeaderboardSourceIds from './worldStandardLeaderboardMapIds'

export type StandardLeaderboardResolution =
  | { kind: 'world' }
  | { kind: 'map'; mapId: ObjectId | string }

function normalizeGameMapId(gameMapId: unknown): string {
  if (gameMapId instanceof ObjectId) return gameMapId.toHexString()
  return String(gameMapId ?? '').trim()
}

/** Where standard-game leaderboard rows and stats should be stored for this game `mapId`. */
export function resolveStandardLeaderboardKey(gameMapId: unknown): StandardLeaderboardResolution {
  const s = normalizeGameMapId(gameMapId)

  if (isEquitableVirtualStandardMapId(s)) {
    return { kind: 'map', mapId: s }
  }

  const worldHex = new Set(getWorldStandardLeaderboardSourceIds().map((id) => id.toHexString()))

  if (isMongoObjectIdHex24(s) && worldHex.has(s.toLowerCase())) {
    return { kind: 'world' }
  }

  if (isMongoObjectIdHex24(s)) {
    return { kind: 'map', mapId: new ObjectId(s) }
  }

  return { kind: 'map', mapId: s }
}

export function leaderboardStorageKey(resolution: StandardLeaderboardResolution): ObjectId | string {
  if (resolution.kind === 'world') return WORLD_STANDARD_LEADERBOARD_KEY
  return resolution.mapId
}

/** Resolve API/map-page id param to `mapLeaderboard.mapId` value. */
export function resolvePublicMapIdToLeaderboardStorageKey(mapIdParam: string): ObjectId | string {
  const trimmed = mapIdParam.trim()

  if (trimmed.startsWith('eqcountry-') || trimmed.startsWith('eqcontinent-')) {
    return trimmed
  }

  if (isMongoObjectIdHex24(trimmed)) {
    const oid = new ObjectId(trimmed)
    const worldIds = getWorldStandardLeaderboardSourceIds()
    if (worldIds.some((id) => id.equals(oid))) {
      return WORLD_STANDARD_LEADERBOARD_KEY
    }
    return oid
  }

  return trimmed
}
