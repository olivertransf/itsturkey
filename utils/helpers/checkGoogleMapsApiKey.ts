/** Google Maps browser keys are typically 39 chars starting with AIza. */
export const GOOGLE_MAPS_KEY_LENGTH = 39

type MapsKeyWindow = Window & {
  gm_authFailure?: () => void
  [key: string]: unknown
}

type StreetViewServiceCtor = new () => {
  getPanorama: (
    request: { location: { lat: number; lng: number }; radius: number },
    callback: (data: unknown, status: string) => void
  ) => void
}

export const normalizeGoogleMapsApiKey = (raw: unknown): string => {
  if (typeof raw !== 'string') return ''
  return raw.trim()
}

export const isPlausibleGoogleMapsApiKey = (key: string): boolean => {
  const k = normalizeGoogleMapsApiKey(key)
  if (k.length !== GOOGLE_MAPS_KEY_LENGTH) return false
  return /^AIza[0-9A-Za-z_-]{35}$/.test(k)
}

export type MapsKeyCheckResult =
  | { ok: true }
  | { ok: false; message: string }

const TIMES_SQUARE = { lat: 40.758, lng: -73.9855 }

const getStreetViewService = (): StreetViewServiceCtor | undefined => {
  const maps = (window as unknown as { google?: { maps?: { StreetViewService?: StreetViewServiceCtor } } }).google
    ?.maps
  return maps?.StreetViewService
}

/**
 * Loads the Maps JavaScript API with the given key in the browser, then
 * probes Street View (what a real game uses). Referrer-restricted keys
 * fail server-side Geocoding checks, so this must stay client-side.
 */
export const checkGoogleMapsApiKeyInBrowser = (rawKey: string): Promise<MapsKeyCheckResult> => {
  const key = normalizeGoogleMapsApiKey(rawKey)

  if (!key) {
    return Promise.resolve({ ok: false, message: 'Enter a Google Maps API key first.' })
  }
  if (!isPlausibleGoogleMapsApiKey(key)) {
    return Promise.resolve({
      ok: false,
      message: `API keys are usually ${GOOGLE_MAPS_KEY_LENGTH} characters and start with AIza.`,
    })
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve({ ok: false, message: 'Key check must run in the browser.' })
  }

  return new Promise((resolve) => {
    const win = window as unknown as MapsKeyWindow
    const timeoutMs = 15000
    let settled = false
    const scriptId = `maps-key-check-${Date.now()}`
    const callbackName = `__geohubMapsKeyOk_${Date.now()}`
    const prevAuthFailure = win.gm_authFailure

    const cleanup = () => {
      const el = document.getElementById(scriptId)
      if (el?.parentNode) el.parentNode.removeChild(el)
      try {
        delete win[callbackName]
      } catch {
        win[callbackName] = undefined
      }
      if (typeof prevAuthFailure === 'function') {
        win.gm_authFailure = prevAuthFailure
      } else {
        try {
          delete win.gm_authFailure
        } catch {
          win.gm_authFailure = undefined
        }
      }
    }

    const finish = (result: MapsKeyCheckResult) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      cleanup()
      resolve(result)
    }

    const probeStreetView = () => {
      const StreetViewService = getStreetViewService()
      if (!StreetViewService) {
        finish({
          ok: false,
          message: 'Maps JavaScript API loaded but Street View is unavailable on this key.',
        })
        return
      }

      const svc = new StreetViewService()
      svc.getPanorama({ location: TIMES_SQUARE, radius: 100 }, (_data, status) => {
        if (status === 'OK' || status === 'ZERO_RESULTS') {
          finish({ ok: true })
          return
        }
        if (status === 'REQUEST_DENIED') {
          finish({
            ok: false,
            message:
              'Maps JS loaded, but Street View was denied. Enable billing and Maps JavaScript API on this key.',
          })
          return
        }
        finish({
          ok: false,
          message: `Street View check failed (${status}). Enable billing, then try again.`,
        })
      })
    }

    win.gm_authFailure = () => {
      finish({
        ok: false,
        message:
          'Google rejected this key. Enable Maps JavaScript API + billing, and allow this site’s referrer if the key is restricted.',
      })
    }

    const timer = window.setTimeout(() => {
      finish({
        ok: false,
        message: 'Timed out checking the key. Check your network, then try again.',
      })
    }, timeoutMs)

    if (getStreetViewService()) {
      probeStreetView()
      return
    }

    win[callbackName] = () => {
      probeStreetView()
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&callback=${callbackName}&v=weekly`
    script.onerror = () => {
      finish({
        ok: false,
        message: 'Could not load the Maps JavaScript API with this key.',
      })
    }
    document.head.appendChild(script)
  })
}
