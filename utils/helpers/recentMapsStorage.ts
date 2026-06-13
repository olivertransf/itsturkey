export const RECENT_MAPS_STORAGE_KEY = 'geohub-recent-maps'
export const RECENT_MAPS_MAX = 8

/** Persist map id at front of recent list (deduped, capped). No-op on server or invalid ids. */
export function recordRecentMapId(mapId: string | undefined | null): void {
  if (typeof window === 'undefined') return
  const id = typeof mapId === 'string' ? mapId.trim() : ''
  if (!id) return

  try {
    const raw = window.localStorage.getItem(RECENT_MAPS_STORAGE_KEY)
    const prev = raw ? (JSON.parse(raw) as unknown) : []
    const list = Array.isArray(prev) ? prev.filter((x): x is string => typeof x === 'string' && x.length > 0) : []
    const next = [id, ...list.filter((x) => x !== id)].slice(0, RECENT_MAPS_MAX)
    window.localStorage.setItem(RECENT_MAPS_STORAGE_KEY, JSON.stringify(next))
  } catch {
    window.localStorage.setItem(RECENT_MAPS_STORAGE_KEY, JSON.stringify([id]))
  }
}

export function readRecentMapIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(RECENT_MAPS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
  } catch {
    return []
  }
}
