/** Deterministic accent for per-country map cards (home / browse). */
const PALETTE = ['#6366f1', '#7c3aed', '#2563eb', '#0d9488', '#db2777', '#ea580c', '#ca8a04', '#4f46e5']

export function equitableCountryAccentColor(iso2: string): string {
  const c = iso2.toLowerCase()
  let h = 0
  for (let i = 0; i < c.length; i++) h += c.charCodeAt(i)
  return PALETTE[h % PALETTE.length] ?? PALETTE[0]
}
