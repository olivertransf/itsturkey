export type PlonkitGuideAttribution = {
  name: string
  license: string
  siteUrl: string
  guideUrl: string
}

export type PlonkitInlineVariant = 'default' | 'settings'

export type PlonkitGuidePayload = {
  attribution: PlonkitGuideAttribution
  meta: { title: string; slug: string; code: string }
  guide: unknown
}
