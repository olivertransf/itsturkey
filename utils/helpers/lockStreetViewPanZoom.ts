export type LockedStreetViewPose = {
  heading: number
  pitch: number
  zoom: number
}

const POSE_EPSILON = 0.001

const nearlyEqual = (a: number, b: number) => Math.abs(a - b) <= POSE_EPSILON

/**
 * Freezes Street View look-around (POV) and zoom. Google Maps has no native
 * disable-drag flag for panoramas; re-apply the locked pose on change events.
 */
export function attachStreetViewPanZoomLock(
  panorama: google.maps.StreetViewPanorama,
  getLockedPose: () => LockedStreetViewPose | null
): () => void {
  const povListener = panorama.addListener('pov_changed', () => {
    const locked = getLockedPose()
    if (!locked) return

    const pov = panorama.getPov()
    if (!nearlyEqual(pov.heading, locked.heading) || !nearlyEqual(pov.pitch, locked.pitch)) {
      panorama.setPov({ heading: locked.heading, pitch: locked.pitch })
    }
  })

  const zoomListener = panorama.addListener('zoom_changed', () => {
    const locked = getLockedPose()
    if (!locked) return

    const zoom = panorama.getZoom() ?? 0
    if (!nearlyEqual(zoom, locked.zoom)) {
      panorama.setZoom(locked.zoom)
    }
  })

  return () => {
    povListener.remove()
    zoomListener.remove()
  }
}
