export type GuessMapLive = {
  lat: number
  lng: number
  zoom: number
  pinLat?: number
  pinLng?: number
  expanded?: boolean
  mapSize?: number
  mobileOpen?: boolean
  updatedAt?: string
}

export const normalizeGuessMapLive = (raw: unknown): GuessMapLive | null => {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as Record<string, unknown>
  const lat = Number(rec.lat)
  const lng = Number(rec.lng)
  const zoom = Number(rec.zoom)
  if (![lat, lng, zoom].every((n) => Number.isFinite(n))) return null

  const next: GuessMapLive = {
    lat,
    lng,
    zoom: Math.max(1, Math.min(21, zoom)),
  }

  const pinLat = Number(rec.pinLat)
  const pinLng = Number(rec.pinLng)
  if (Number.isFinite(pinLat) && Number.isFinite(pinLng)) {
    next.pinLat = pinLat
    next.pinLng = pinLng
  }
  if (typeof rec.expanded === 'boolean') next.expanded = rec.expanded
  const mapSize = Number(rec.mapSize)
  if (Number.isFinite(mapSize) && mapSize >= 1 && mapSize <= 4) {
    next.mapSize = Math.round(mapSize)
  }
  if (typeof rec.mobileOpen === 'boolean') next.mobileOpen = rec.mobileOpen
  if (typeof rec.updatedAt === 'string') next.updatedAt = rec.updatedAt

  return next
}
