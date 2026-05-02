const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Crockford-like subset; 4-char gives ~923k combos (case-insensitive via normalize). */
export const DUEL_INVITE_CODE_REGEX = /^[A-HJ-NP-Z2-9]{4,8}$/i

export function normalizeDuelInviteCode(raw: string): string | null {
  const s = raw.trim().toUpperCase()
  if (!DUEL_INVITE_CODE_REGEX.test(s)) return null
  return s
}

export const randomDuelShortCode = (length = 4): string => {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}
