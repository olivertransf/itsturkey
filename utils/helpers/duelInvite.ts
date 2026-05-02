import { normalizeDuelInviteCode } from '@backend/utils/duelShortCode'

/** URL segment for `/duel/[id]`: Mongo ObjectId hex (24) or invite short code (4–8 Crockford chars). */
export function isValidDuelUrlSegment(segment: string | undefined): boolean {
  if (!segment || typeof segment !== 'string') return false
  const s = segment.trim()
  if (s.length < 4) return false
  if (/^[a-f\d]{24}$/i.test(s)) return true
  return normalizeDuelInviteCode(s) !== null
}

/** Parse paste box or URL into path segment for `/duel/:segment`. */
export function parseDuelInviteInput(raw: string): string | null {
  const s = raw.trim()
  const fromUrl = s.match(/\/duel\/([^/?#]+)/i)
  const seg = decodeURIComponent(fromUrl ? fromUrl[1] : s).trim()
  if (!seg) return null
  if (/^[a-f\d]{24}$/i.test(seg)) return seg.toLowerCase()
  return normalizeDuelInviteCode(seg)
}
