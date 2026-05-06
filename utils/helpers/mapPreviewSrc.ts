import { MAP_AVATAR_PATH } from '@utils/constants/random'

/** Default world image used when preview is missing or blank. */
export const DEFAULT_MAP_PREVIEW_FILE = 'official15.jpg'

/** Filenames for map picker in Create Map modal (all ship in repo). */
export const BUILTIN_MAP_THUMB_FILES = [
  DEFAULT_MAP_PREVIEW_FILE,
  'map-thumb-2.svg',
  'map-thumb-3.svg',
  'map-thumb-4.svg',
  'custom-map.svg',
] as const

/** Repo placeholder thumb (SVG includes text); use CSS gradient for large hero instead. */
export const CUSTOM_MAP_PLACEHOLDER_PREVIEW = 'custom-map.svg'

export function isCustomMapPlaceholderPreview(previewImg: string | undefined | null): boolean {
  const raw = typeof previewImg === 'string' ? previewImg.trim() : ''
  if (!raw || /^https?:\/\//i.test(raw)) return false
  const base = raw.split('/').pop()?.toLowerCase() ?? ''
  return base === CUSTOM_MAP_PLACEHOLDER_PREVIEW.toLowerCase()
}

/**
 * Resolves stored `previewImg` to a URL usable in `next/image` or CSS `url()`.
 * - Empty → world thumbnail
 * - `http(s)://` → unchanged
 * - Otherwise treated as filename under `/images/mapAvatars/`
 */
export function resolveMapImageSrc(previewImg: string | undefined | null): string {
  const raw = typeof previewImg === 'string' ? previewImg.trim() : ''
  if (!raw) return `${MAP_AVATAR_PATH}/${DEFAULT_MAP_PREVIEW_FILE}`
  if (/^https?:\/\//i.test(raw)) return raw
  return `${MAP_AVATAR_PATH}/${raw}`
}
