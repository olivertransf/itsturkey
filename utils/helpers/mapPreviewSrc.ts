import { MAP_AVATAR_PATH } from '@utils/constants/random'

/** Default stylized map art used when preview is missing or blank. */
export const DEFAULT_MAP_PREVIEW_FILE = 'default-map.svg'

/** Filenames for map picker in Create Map modal (all ship in repo). */
export const BUILTIN_MAP_THUMB_FILES = [
  DEFAULT_MAP_PREVIEW_FILE,
  'official15.jpg',
  'official8.jpg',
  'official22.jpg',
  'custom-map.svg',
] as const

/** Repo placeholder thumb (SVG includes text); use CSS gradient for large hero instead. */
export const CUSTOM_MAP_PLACEHOLDER_PREVIEW = 'custom-map.svg'

const PLACEHOLDER_PREVIEW_FILES = new Set(
  ['default-map.svg', 'custom-map.svg', 'map-thumb-2.svg', 'map-thumb-3.svg', 'map-thumb-4.svg'].map((f) =>
    f.toLowerCase()
  )
)

export function isCustomMapPlaceholderPreview(previewImg: string | undefined | null): boolean {
  const raw = typeof previewImg === 'string' ? previewImg.trim() : ''
  if (!raw || /^https?:\/\//i.test(raw)) return false
  const base = raw.split('/').pop()?.toLowerCase() ?? ''
  return base === CUSTOM_MAP_PLACEHOLDER_PREVIEW.toLowerCase()
}

/** True when the row should use the stylized CSS thumb instead of a photo. */
export function isGenericMapPreview(previewImg: string | undefined | null): boolean {
  const raw = typeof previewImg === 'string' ? previewImg.trim() : ''
  if (!raw) return true
  if (/^https?:\/\//i.test(raw)) return false
  const base = raw.split('/').pop()?.toLowerCase() ?? ''
  return PLACEHOLDER_PREVIEW_FILES.has(base)
}

/**
 * Resolves stored `previewImg` to a URL usable in `next/image` or CSS `url()`.
 * - Empty → default stylized map SVG
 * - `http(s)://` → unchanged
 * - Otherwise treated as filename under `/images/mapAvatars/`
 */
export function resolveMapImageSrc(previewImg: string | undefined | null): string {
  const raw = typeof previewImg === 'string' ? previewImg.trim() : ''
  if (!raw) return `${MAP_AVATAR_PATH}/${DEFAULT_MAP_PREVIEW_FILE}`
  if (/^https?:\/\//i.test(raw)) return raw
  return `${MAP_AVATAR_PATH}/${raw}`
}
