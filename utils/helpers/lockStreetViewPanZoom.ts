export type LockedStreetViewPose = {
  heading: number
  pitch: number
  zoom: number
}

const POSE_EPSILON = 0.01

const nearlyEqual = (a: number, b: number) => Math.abs(a - b) <= POSE_EPSILON

export type StreetViewLockOptions = {
  lockPan: boolean
  lockZoom: boolean
}

/**
 * Freezes Street View look-around (POV) and/or zoom as a backup to the pointer
 * overlay. Google ignores setPov mid-drag, so this alone is not enough when both
 * are locked — keep the interaction block overlay in StreetView as the primary guard.
 */
export function attachStreetViewPanZoomLock(
  panorama: google.maps.StreetViewPanorama,
  getLockedPose: () => LockedStreetViewPose | null,
  options: StreetViewLockOptions = { lockPan: true, lockZoom: true }
): () => void {
  let rafId = 0
  const { lockPan, lockZoom } = options

  if (!lockPan && !lockZoom) {
    return () => undefined
  }

  const snapToLocked = () => {
    rafId = 0
    const locked = getLockedPose()
    if (!locked) return

    const pov = panorama.getPov()
    const zoom = panorama.getZoom() ?? 0

    if (
      lockPan &&
      (!nearlyEqual(pov.heading, locked.heading) || !nearlyEqual(pov.pitch, locked.pitch))
    ) {
      panorama.setPov({ heading: locked.heading, pitch: locked.pitch })
    }
    if (lockZoom && !nearlyEqual(zoom, locked.zoom)) {
      panorama.setZoom(locked.zoom)
    }
  }

  const scheduleSnap = () => {
    if (rafId) return
    rafId = requestAnimationFrame(snapToLocked)
  }

  const listeners: google.maps.MapsEventListener[] = []
  if (lockPan) listeners.push(panorama.addListener('pov_changed', scheduleSnap))
  if (lockZoom) listeners.push(panorama.addListener('zoom_changed', scheduleSnap))

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    listeners.forEach((l) => l.remove())
  }
}
