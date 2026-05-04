import type { ContinentSlug } from '@utils/constants/iso2ContinentSlug'

const BY_CONTINENT: Record<ContinentSlug, string> = {
  af: '#22c55e',
  an: '#94a3b8',
  as: '#f472b6',
  eu: '#60a5fa',
  na: '#fb923c',
  oc: '#2dd4bf',
  sa: '#eab308',
}

export function equitableContinentAccentColor(slug: ContinentSlug): string {
  return BY_CONTINENT[slug] ?? '#6366f1'
}
