/** Public Plonk It site; country guides are CC BY-NC-SA 4.0 with attribution required. */
export const PLONKIT_ORIGIN = 'https://www.plonkit.net'

export function plonkitAssetUrl(path: string | undefined | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${PLONKIT_ORIGIN}${path}`
  return `${PLONKIT_ORIGIN}/${path}`
}
