/** Left-edge tint for map picker rows (home cards no longer use accents). */
export function getHomeMapAccentColor(name: string): string {
  if (name.startsWith('Default World')) {
    return name.includes('2') ? '#6366f1' : '#2563eb'
  }
  if (name.startsWith('Equitable World')) {
    if (name.includes('III')) return '#d97706'
    if (name.includes('II')) return '#0d9488'
    return '#2f7fff'
  }
  return '#64748b'
}
