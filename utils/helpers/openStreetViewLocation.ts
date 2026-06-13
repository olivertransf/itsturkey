/** Opens Google Maps Street View at the given coordinates in a new tab. */
export function openStreetViewLocation(lat: number, lng: number): void {
  window.open(`https://www.google.com/maps?layer=c&cbll=${lat},${lng}`, '_blank', 'noopener,noreferrer')
}
