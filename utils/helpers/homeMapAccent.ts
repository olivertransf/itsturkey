/** Accent for homepage map cards (defaults vs equitable lineup). */
export function getHomeMapAccentColor(name: string): string {
  if (name.startsWith('Default World')) {
    return name.includes('2') ? '#6366f1' : '#2563eb'
  }
  if (name.startsWith('Equitable World')) {
    if (name.includes('III')) return '#d97706'
    if (name.includes('II')) return '#0d9488'
    return '#059669'
  }
  return '#64748b'
}
