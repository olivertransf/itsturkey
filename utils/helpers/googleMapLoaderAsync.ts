import { Loader, LoaderOptions } from '@googlemaps/js-api-loader'

const unresolvedBoot = new Promise<typeof google.maps>(() => {})

let loadPromise: Promise<typeof google.maps> | undefined

type BootstrapKeys = Record<string, unknown> & { key?: string; libraries?: LoaderOptions['libraries'] }

type MapsNs = typeof google.maps & {
  importLibrary?: (name: string) => Promise<Record<string, unknown>>
}

const CONSTRUCTOR_KEYS = [
  'LatLng',
  'LatLngBounds',
  'Map',
  'Polyline',
  'OverlayView',
  'StreetViewPanorama',
  'StreetViewService',
  'event',
] as const

const SKIP_KEYS = new Set(['importLibrary', 'then', 'default', '__esModule', 'constructor', 'prototype'])

const eventNamespaceReady = (event: unknown): boolean => {
  if (event == null) return false
  if (typeof event !== 'object' && typeof event !== 'function') return false
  const ns = event as { addListener?: unknown }
  return typeof ns.addListener === 'function'
}

export const mapsApiMissing = (maps: typeof google.maps | undefined): string[] => {
  const missing: string[] = []
  if (typeof maps?.LatLng !== 'function') missing.push('LatLng')
  if (typeof maps?.Map !== 'function') missing.push('Map')
  if (typeof maps?.OverlayView !== 'function') missing.push('OverlayView')
  if (!eventNamespaceReady(maps?.event)) missing.push('event')
  return missing
}

export const mapsApiReady = (maps: typeof google.maps | undefined): maps is typeof google.maps =>
  mapsApiMissing(maps).length === 0

export const streetViewApiReady = (maps: typeof google.maps | undefined): boolean =>
  typeof maps?.StreetViewPanorama === 'function' && typeof maps?.StreetViewService === 'function'

export const triggerMapsEvent = (instance: object | null | undefined, name: string) => {
  if (!instance || typeof window === 'undefined') return
  const trigger = window.google?.maps?.event?.trigger
  if (typeof trigger !== 'function') return
  trigger(instance, name)
}

const readProp = (source: object, key: string): unknown => {
  try {
    return (source as Record<string, unknown>)[key]
  } catch {
    return undefined
  }
}

const sourceKeys = (source: object): string[] => {
  const keys = new Set<string>(CONSTRUCTOR_KEYS)
  try {
    for (const key of Object.getOwnPropertyNames(source)) keys.add(key)
  } catch {
    // ignore
  }
  try {
    for (const key of Object.keys(source)) keys.add(key)
  } catch {
    // ignore
  }
  return [...keys]
}

export const assignMissingMapsExports = (target: object, source: object | undefined) => {
  if (!source) return
  const dest = target as Record<string, unknown>

  const assignKey = (key: string) => {
    if (SKIP_KEYS.has(key)) return
    const incoming = readProp(source, key)
    if (incoming == null) return
    const current = dest[key]
    if (key === 'event' || eventNamespaceReady(incoming)) {
      if (!eventNamespaceReady(current)) dest[key] = incoming
      return
    }
    if (typeof incoming === 'function') {
      dest[key] = incoming
      return
    }
    if (typeof incoming !== 'object') return
    if (current == null) dest[key] = incoming
  }

  for (const key of sourceKeys(source)) assignKey(key)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const hydrateUntilReady = async (
  loadLibs: () => Promise<Array<object | undefined>>
): Promise<typeof google.maps> => {
  const deadline = Date.now() + 8000
  let lastError: unknown

  while (Date.now() <= deadline) {
    const maps = window.google?.maps as MapsNs | undefined
    if (maps) {
      try {
        for (const lib of await loadLibs()) {
          assignMissingMapsExports(maps, lib)
        }
      } catch (err) {
        lastError = err
      }
      if (mapsApiReady(maps)) return maps
    }
    await sleep(50)
  }

  const missing = mapsApiMissing(window.google?.maps).join(', ') || 'LatLng/Map/OverlayView/event'
  const extra = lastError instanceof Error ? ` (${lastError.message})` : ''
  throw new Error(`Google Maps ${missing} are not available${extra}`)
}

const importCoreMaps = async (
  importer: (name: 'core' | 'maps' | 'streetView') => Promise<object>
): Promise<Array<object | undefined>> => {
  const [core, mapsLib] = await Promise.all([importer('core'), importer('maps')])
  let streetView: object | undefined
  try {
    streetView = await importer('streetView')
  } catch {
    // GuessMap only needs core/maps.
  }
  return [core, mapsLib, streetView]
}

const hydrateMapsNamespace = async (): Promise<typeof google.maps> => {
  if (typeof window.google?.maps?.importLibrary !== 'function') {
    throw new Error('Google Maps failed to load')
  }
  return hydrateUntilReady(() =>
    importCoreMaps((name) => window.google.maps.importLibrary(name) as Promise<object>)
  )
}

export const ensureStreetViewLoaded = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  const maps = window.google?.maps as MapsNs | undefined
  if (!maps) return false
  if (streetViewApiReady(maps)) return true
  if (typeof maps.importLibrary !== 'function') return false
  try {
    assignMissingMapsExports(maps, await maps.importLibrary('streetView'))
  } catch {
    return false
  }
  return streetViewApiReady(maps)
}

const omitLoaderExtras = (keys: BootstrapKeys): Omit<LoaderOptions, 'apiKey' | 'libraries'> => {
  const { key: _k, callback: _cb, loading: _ld, libraries: _libs, ...rest } = keys
  return rest as Omit<LoaderOptions, 'apiKey' | 'libraries'>
}

/**
 * Drop-in replacement for google-map-react's default loader (`googleMapLoader` prop).
 * With loading=async, google.maps.LatLng is not a constructor until importLibrary runs.
 */
export default function googleMapLoaderAsync(
  bootstrapURLKeys: BootstrapKeys | undefined,
  heatmapLibrary?: boolean
): Promise<typeof google.maps> {
  if (typeof window !== 'undefined' && mapsApiReady(window.google?.maps)) {
    return Promise.resolve(window.google.maps)
  }

  if (loadPromise) {
    return loadPromise
  }

  if (typeof window !== 'undefined' && typeof window.google?.maps?.importLibrary === 'function') {
    loadPromise = hydrateMapsNamespace().catch((err) => {
      loadPromise = undefined
      throw err
    })
    return loadPromise
  }

  if (!bootstrapURLKeys) {
    return unresolvedBoot
  }

  const apiKey = bootstrapURLKeys.key ?? ''
  if (!apiKey) {
    return unresolvedBoot
  }

  if (process.env.NODE_ENV !== 'production' && 'callback' in bootstrapURLKeys) {
    throw new Error('"callback" key in bootstrapURLKeys is not allowed; use onGoogleApiLoaded instead.')
  }

  let libraries = [...(bootstrapURLKeys.libraries ?? [])]

  if (heatmapLibrary) {
    if (libraries.length === 0 || !libraries.includes('visualization')) {
      libraries.push('visualization')
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        "heatmapLibrary will be deprecated in the future. Please use { libraries: ['visualization'] } in bootstrapURLKeys instead."
      )
    }
  }

  const loader = new Loader({
    apiKey,
    ...omitLoaderExtras(bootstrapURLKeys),
    libraries: libraries as LoaderOptions['libraries'],
  })

  loadPromise = hydrateUntilReady(() => importCoreMaps((name) => loader.importLibrary(name) as Promise<object>)).catch(
    (err) => {
      loadPromise = undefined
      throw err
    }
  )
  return loadPromise
}
