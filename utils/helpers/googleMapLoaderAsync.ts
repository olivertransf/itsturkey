import { Loader, LoaderOptions } from '@googlemaps/js-api-loader'

/**
 * Extends the stock Loader URL with `loading=async` (Maps JS API ≥3.55) so the
 * browser console warning about synchronous bootstrap goes away. google-map-react
 * uses js-api-loader v1, which omits this query param by default.
 */
class LoaderWithAsync extends Loader {
  createUrl(): string {
    const url = super.createUrl()
    return url.includes('loading=') ? url : `${url}&loading=async`
  }
}

const unresolvedBoot = new Promise<typeof google.maps>(() => {})

let loadPromise: Promise<typeof google.maps> | undefined

type BootstrapKeys = Record<string, unknown> & { key?: string; libraries?: LoaderOptions['libraries'] }

type MapsNs = typeof google.maps & {
  importLibrary?: (name: string) => Promise<Record<string, unknown>>
}

const CONSTRUCTOR_KEYS = ['LatLng', 'LatLngBounds', 'Map', 'Polyline', 'OverlayView', 'StreetViewPanorama', 'StreetViewService'] as const

const mapsApiReady = (maps: typeof google.maps | undefined): maps is typeof google.maps =>
  typeof maps?.LatLng === 'function' && typeof maps?.Map === 'function'

const assignMissingConstructors = (target: MapsNs, source: object | undefined) => {
  if (!source) return
  const rec = source as Record<string, unknown>
  const dest = target as unknown as Record<string, unknown>
  for (const key of CONSTRUCTOR_KEYS) {
    if (typeof dest[key] !== 'function' && typeof rec[key] === 'function') {
      dest[key] = rec[key]
    }
  }
}

const hydrateMapsNamespace = async (): Promise<typeof google.maps> => {
  const maps = window.google?.maps as MapsNs | undefined
  if (!maps) {
    throw new Error('Google Maps failed to load')
  }

  if (typeof maps.importLibrary === 'function') {
    const [core, mapsLib, streetView] = await Promise.all([
      maps.importLibrary('core'),
      maps.importLibrary('maps'),
      maps.importLibrary('streetView'),
    ])
    assignMissingConstructors(maps, core)
    assignMissingConstructors(maps, mapsLib)
    assignMissingConstructors(maps, streetView)
  }

  if (!mapsApiReady(maps)) {
    throw new Error('Google Maps LatLng/Map constructors are not available')
  }

  return maps
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

  const loader = new LoaderWithAsync({
    apiKey,
    ...omitLoaderExtras(bootstrapURLKeys),
    libraries: libraries as LoaderOptions['libraries'],
  })

  loadPromise = loader
    .load()
    .then(() => hydrateMapsNamespace())
    .catch((err) => {
      loadPromise = undefined
      throw err
    })
  return loadPromise
}
