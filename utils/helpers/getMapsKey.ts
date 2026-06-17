type GetMapsKeyOptions = {
  /**
   * When true, falls back to the site-wide key if the user has not provided one.
   * Gameplay surfaces should set this to false.
   */
  allowFallback?: boolean
}

const getMapsKey = (usersCustomKey: string | undefined, options: GetMapsKeyOptions = {}): { key: string } => {
  const { allowFallback = true } = options
  const GEOHUB_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string

  if (usersCustomKey) {
    return { key: usersCustomKey }
  }

  if (allowFallback && GEOHUB_MAPS_KEY) {
    return { key: GEOHUB_MAPS_KEY }
  }

  return { key: '' }
}

export default getMapsKey
