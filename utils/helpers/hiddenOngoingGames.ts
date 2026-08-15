const STORAGE_KEY = 'geohub.hiddenOngoingGameIds'

export const normalizeOngoingGameId = (value: unknown): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '[object Object]' ? '' : trimmed
  }
  if (value && typeof value === 'object') {
    const rec = value as { $oid?: unknown; _id?: unknown; toHexString?: () => string }
    if (typeof rec.$oid === 'string') return rec.$oid
    if (typeof rec._id === 'string') return rec._id
    if (typeof rec.toHexString === 'function') {
      const hex = rec.toHexString()
      if (hex && hex !== '[object Object]') return hex
    }
  }
  if (value != null) {
    const asString = String(value)
    if (asString && asString !== '[object Object]') return asString
  }
  return ''
}

const readIds = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.map(normalizeOngoingGameId).filter(Boolean)
      : []
  } catch {
    return []
  }
}

const writeIds = (ids: string[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(ids.map(normalizeOngoingGameId).filter(Boolean))
  )
}

export const readHiddenOngoingIds = () => readIds()

export const isOngoingGameHidden = (id: unknown) => {
  const normalized = normalizeOngoingGameId(id)
  return Boolean(normalized) && readIds().includes(normalized)
}

export const hideOngoingGame = (id: unknown) => {
  const normalized = normalizeOngoingGameId(id)
  if (!normalized) return
  writeIds(Array.from(new Set([...readIds(), normalized])))
}

export const unhideOngoingGame = (id: unknown) => {
  const normalized = normalizeOngoingGameId(id)
  writeIds(readIds().filter((item) => item !== normalized))
}

export const unhideAllOngoingGames = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export const excludeHiddenOngoingGames = <T extends { _id?: unknown }>(
  games: T[],
  hiddenIds: string[] = readIds()
) =>
  games.filter((game) => {
    const id = normalizeOngoingGameId(game._id)
    return Boolean(id) && !hiddenIds.includes(id)
  })
