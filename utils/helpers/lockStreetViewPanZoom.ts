export type LockedStreetViewPose = {
  heading: number
  pitch: number
  zoom: number
}

const POSE_EPSILON = 0.01

const nearlyEqual = (a: number, b: number) => Math.abs(a - b) <= POSE_EPSILON

/**
 * Freezes Street View look-around (POV) and zoom as a backup to the pointer
 * overlay. Google ignores setPov mid-drag, so this alone is not enough — keep
 * the interaction block overlay in StreetView as the primary guard.
 */
export function attachStreetViewPanZoomLock(
  panorama: google.maps.StreetViewPanorama,
  getLockedPose: () => LockedStreetViewPose | null
): () => void {
  let rafId = 0

  const snapToLocked = () => {
    rafId = 0
    const locked = getLockedPose()
    if (!locked) return

    const pov = panorama.getPov()
    const zoom = panorama.getZoom() ?? 0

    if (!nearlyEqual(pov.heading, locked.heading) || !nearlyEqual(pov.pitch, locked.pitch)) {
      panorama.setPov({ heading: locked.heading, pitch: locked.pitch })
    }
    if (!nearlyEqual(zoom, locked.zoom)) {
      panorama.setZoom(locked.zoom)
    }
  }

  const scheduleSnap = () => {
    if (rafId) return
    rafId = requestAnimationFrame(snapToLocked)
  }

  const povListener = panorama.addListener('pov_changed', scheduleSnap)
  const zoomListener = panorama.addListener('zoom_changed', scheduleSnap)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    povListener.remove()
    zoomListener.remove()
  }
}
