export type GuessMapClickLike = {
  lat?: number
  lng?: number
  latLng?: { lat: () => number; lng: () => number } | null
}

export function locationFromGuessMapClick(event: GuessMapClickLike): { lat: number; lng: number } | null {
  if (typeof event.lat === 'number' && typeof event.lng === 'number') {
    if (Number.isFinite(event.lat) && Number.isFinite(event.lng)) {
      return { lat: event.lat, lng: event.lng }
    }
  }

  const latLng = event.latLng
  if (!latLng) return null

  const lat = latLng.lat()
  const lng = latLng.lng()
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return { lat, lng }
}
