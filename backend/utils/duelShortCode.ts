const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const randomDuelShortCode = (length = 6): string => {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}
