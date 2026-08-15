const PALETTE = ['#2f7fff', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#ca8a04', '#e11d48', '#4f46e5']

export function getHomeMapAccentColor(name: string): string {
  if (name.startsWith('Default World')) {
    return '#2563eb'
  }
  if (name.startsWith('Equitable World')) {
    return '#2f7fff'
  }
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length] ?? PALETTE[0]
}
