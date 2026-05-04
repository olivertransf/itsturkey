/** ISO 3166-1 alpha-2 → regional-indicator flag emoji. Returns empty string if invalid. */
export function flagEmojiFromIsoAlpha2(code: string): string {
  const c = code.trim().toUpperCase()
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return ''
  const base = 0x1f1e6
  const cp = (ch: string) => base + (ch.charCodeAt(0) - 65)
  return String.fromCodePoint(cp(c[0]), cp(c[1]))
}
