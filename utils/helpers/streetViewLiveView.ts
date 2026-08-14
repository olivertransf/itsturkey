export type StreetViewLiveView = {
  heading: number
  pitch: number
  zoom: number
  panoId?: string
  lat?: number
  lng?: number
  updatedAt?: string
}

export const normalizeStreetViewLiveView = (raw: unknown): StreetViewLiveView | null => {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as Record<string, unknown>
  const heading = Number(rec.heading)
  const pitch = Number(rec.pitch)
  const zoom = Number(rec.zoom)
  if (![heading, pitch, zoom].every((n) => Number.isFinite(n))) return null

  const next: StreetViewLiveView = {
    heading,
    pitch: Math.max(-90, Math.min(90, pitch)),
    zoom: Math.max(0, Math.min(5, zoom)),
  }

  if (typeof rec.panoId === 'string' && rec.panoId.trim()) {
    next.panoId = rec.panoId.trim().slice(0, 128)
  }
  const lat = Number(rec.lat)
  const lng = Number(rec.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    next.lat = lat
    next.lng = lng
  }
  if (typeof rec.updatedAt === 'string') next.updatedAt = rec.updatedAt

  return next
}
