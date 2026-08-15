const STORAGE_KEY = 'geohub.hiddenOngoingGameIds'

const readIds = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

const writeIds = (ids: string[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export const readHiddenOngoingIds = () => readIds()

export const isOngoingGameHidden = (id: string) => readIds().includes(String(id))

export const hideOngoingGame = (id: string) => {
  writeIds(Array.from(new Set([...readIds(), String(id)])))
}

export const unhideOngoingGame = (id: string) => {
  writeIds(readIds().filter((item) => item !== String(id)))
}

export const unhideAllOngoingGames = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
