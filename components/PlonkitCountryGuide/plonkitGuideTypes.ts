export type PlonkitGuideAttribution = {
  name: string
  license: string
  siteUrl: string
  guideUrl: string
}

export type PlonkitGuidePayload = {
  attribution: PlonkitGuideAttribution
  meta: { title: string; slug: string; code: string }
  /** Null when returned from `plonkit-guide?random=1&lightweight=1` (meta only). */
  guide: unknown | null
}
