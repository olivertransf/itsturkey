export type LastUsedSource = {
  lastUsedAt?: unknown
  updatedAt?: unknown
  createdAt?: unknown
  liveView?: { updatedAt?: unknown }
  guessMapLive?: { updatedAt?: unknown }
}

export const parseTimestamp = (value: unknown): Date | undefined => {
  if (value == null) return undefined
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  if (typeof value === 'object' && value !== null && '$date' in value) {
    return parseTimestamp((value as { $date: unknown }).$date)
  }
  return undefined
}

const latest = (values: unknown[]) => {
  const dates = values.map(parseTimestamp).filter((date): date is Date => Boolean(date))
  if (dates.length === 0) return undefined
  return dates.reduce((max, date) => (date > max ? date : max))
}

export const pickLastUsedAt = (game: LastUsedSource): Date | undefined => {
  const explicit = parseTimestamp(game.lastUsedAt)
  if (explicit) return explicit
  return latest([game.updatedAt, game.liveView?.updatedAt, game.guessMapLive?.updatedAt, game.createdAt])
}

export const compareLastUsedDesc = (left: LastUsedSource, right: LastUsedSource) => {
  const leftAt = pickLastUsedAt(left)?.getTime() ?? 0
  const rightAt = pickLastUsedAt(right)?.getTime() ?? 0
  return rightAt - leftAt
}
