import { OFFICIAL_WORLD_ID } from '@utils/constants/random'

export type HomeMapCard = {
  _id: string
  name: string
  description?: string
  previewImg?: string
}

export function parseHomeMapCards(raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS): HomeMapCard[] {
  if (!raw?.trim()) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const cards: HomeMapCard[] = []

    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue

      const rec = item as Record<string, unknown>
      if (typeof rec._id !== 'string' || typeof rec.name !== 'string') continue

      cards.push({
        _id: rec._id,
        name: rec.name,
        description: typeof rec.description === 'string' ? rec.description : undefined,
        previewImg: typeof rec.previewImg === 'string' ? rec.previewImg : undefined,
      })
    }

    return cards
  } catch {
    return []
  }
}

export function getHomeDefaultWorldMapId(raw?: string): string {
  const defaultWorld = parseHomeMapCards(raw).find((card) => card.name.startsWith('Default World'))
  return defaultWorld?._id || OFFICIAL_WORLD_ID
}

export function resolveStandardMapIdForLocations(mapId: string, homeCardsRaw?: string): string {
  if (mapId === OFFICIAL_WORLD_ID) {
    return getHomeDefaultWorldMapId(homeCardsRaw)
  }

  return mapId
}
