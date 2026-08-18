export type StreetViewRoundLocation = {
  lat?: number
  lng?: number
  panoId?: string | null
}

export type StreetViewPanoRequest =
  | { pano: string }
  | { location: { lat: number; lng: number }; radius: number }

export const isStreetViewStatusOk = (status: unknown): boolean => {
  if (status === 'OK') return true
  const enumOk =
    typeof google !== 'undefined' ? google.maps?.StreetViewStatus?.OK : undefined
  return enumOk != null && status === enumOk
}

export const panoElementHasSize = (el: Element | null | undefined): boolean => {
  if (!el || !(el instanceof HTMLElement)) return false
  const width = el.clientWidth || el.offsetWidth
  const height = el.clientHeight || el.offsetHeight
  return width > 0 && height > 0
}

export const streetViewPanoramaRequests = (
  loc: StreetViewRoundLocation
): StreetViewPanoRequest[] => {
  const panoId = typeof loc.panoId === 'string' ? loc.panoId.trim() : ''
  const lat = Number(loc.lat)
  const lng = Number(loc.lng)
  const useLatLng = Number.isFinite(lat) && Number.isFinite(lng)

  const requests: StreetViewPanoRequest[] = []
  if (panoId) requests.push({ pano: panoId })
  if (useLatLng) {
    requests.push({ location: { lat, lng }, radius: 150 })
    requests.push({ location: { lat, lng }, radius: 1000 })
  }
  return requests
}
