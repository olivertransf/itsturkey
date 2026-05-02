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

const omitLoaderExtras = (keys: BootstrapKeys): Omit<LoaderOptions, 'apiKey' | 'libraries'> => {
  const { key: _k, callback: _cb, loading: _ld, libraries: _libs, ...rest } = keys
  return rest as Omit<LoaderOptions, 'apiKey' | 'libraries'>
}

/**
 * Drop-in replacement for google-map-react's default loader (`googleMapLoader` prop).
 */
export default function googleMapLoaderAsync(
  bootstrapURLKeys: BootstrapKeys | undefined,
  heatmapLibrary?: boolean
): Promise<typeof google.maps> {
  if (!bootstrapURLKeys) {
    return unresolvedBoot
  }

  if (loadPromise) {
    return loadPromise
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

  const apiKey = bootstrapURLKeys.key ?? ''
  const loader = new LoaderWithAsync({
    apiKey,
    ...omitLoaderExtras(bootstrapURLKeys),
    libraries: libraries as LoaderOptions['libraries'],
  })

  loadPromise = loader.load().then(() => window.google.maps)
  return loadPromise
}
