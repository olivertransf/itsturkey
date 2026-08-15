import Link from 'next/link'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { compareLastUsedDesc, mailman, pickLastUsedAt, showToast } from '@utils/helpers'
import {
  excludeHiddenOngoingGames,
  hideOngoingGame,
  normalizeOngoingGameId,
  readHiddenOngoingIds,
  unhideAllOngoingGames,
} from '@utils/helpers/hiddenOngoingGames'
import { formatMonthDayYearTime } from '@utils/dateHelpers'
import { COUNTRY_STREAK_DETAILS, DAILY_CHALLENGE_DETAILS } from '@utils/constants/random'
import StyledHomeOngoingCard from './HomeOngoingCard.Styled'

type UnfinishedGame = {
  _id: unknown
  mode?: string
  round?: number
  totalRounds?: number
  unlimited?: boolean
  isDailyChallenge?: boolean
  mapName?: string
  mapDetails?: { name?: string }[]
  createdAt?: Date | string
  updatedAt?: Date | string
  lastUsedAt?: Date | string
  liveView?: { updatedAt?: Date | string }
  guessMapLive?: { updatedAt?: Date | string }
}

const VISIBLE_LIMIT = 2
const MAX_PAGES = 5

const gameId = (game: UnfinishedGame) => normalizeOngoingGameId(game._id)

const mapLabel = (game: UnfinishedGame) => {
  if (game.mode === 'streak') return COUNTRY_STREAK_DETAILS.name
  if (game.isDailyChallenge) return DAILY_CHALLENGE_DETAILS.name
  return game.mapDetails?.[0]?.name || game.mapName || 'Unfinished game'
}

const roundLabel = (game: UnfinishedGame) => {
  if (game.mode === 'streak') return 'In progress'
  if (game.unlimited) return `Round ${game.round ?? 1}`
  const total = game.totalRounds
  if (typeof total === 'number' && total > 0) return `Round ${game.round ?? 1} of ${total}`
  return `Round ${game.round ?? 1}`
}

const metaLabel = (game: UnfinishedGame) => {
  const when = formatMonthDayYearTime(pickLastUsedAt(game))
  return when ? `${roundLabel(game)} · ${when}` : roundLabel(game)
}

const HomeOngoingCard: FC = () => {
  const { status, data: session } = useSession()
  const [games, setGames] = useState<UnfinishedGame[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [hiddenTick, setHiddenTick] = useState(0)
  const loadSeq = useRef(0)
  const hiddenIdsRef = useRef<string[]>([])
  const isAuthed = status === 'authenticated' && Boolean(session?.user?.id)

  const hiddenIds = useMemo(() => {
    const ids = readHiddenOngoingIds()
    hiddenIdsRef.current = ids
    return ids
  }, [hiddenTick])

  const applyHidden = useCallback((list: UnfinishedGame[]) => {
    return excludeHiddenOngoingGames(list, hiddenIdsRef.current)
  }, [])

  const load = useCallback(async () => {
    const seq = ++loadSeq.current
    if (!isAuthed) {
      if (seq === loadSeq.current) setGames([])
      return
    }

    hiddenIdsRef.current = readHiddenOngoingIds()
    const collected: UnfinishedGame[] = []
    let page = 0
    let more = true

    while (page < MAX_PAGES && more) {
      const res = await mailman(`games/unfinished?page=${page}`)
      if (seq !== loadSeq.current) return
      if (!res || res.error || !Array.isArray(res.data)) {
        more = false
        break
      }
      collected.push(...(res.data as UnfinishedGame[]))
      more = Boolean(res.hasMore)
      if (applyHidden(collected).length >= VISIBLE_LIMIT) break
      page += 1
    }

    if (seq !== loadSeq.current) return
    hiddenIdsRef.current = readHiddenOngoingIds()
    const nextVisible = applyHidden(collected)
    setGames(nextVisible)
    setHasMore(more && nextVisible.length > 0)
    setHiddenTick((n) => n + 1)
  }, [isAuthed, applyHidden])

  useEffect(() => {
    hiddenIdsRef.current = readHiddenOngoingIds()
    setHiddenTick((n) => n + 1)
    void load()
  }, [load])

  const visible = useMemo(
    () => applyHidden(games).sort(compareLastUsedDesc).slice(0, VISIBLE_LIMIT),
    [games, hiddenIds, applyHidden]
  )

  const hide = (id: unknown) => {
    const normalized = normalizeOngoingGameId(id)
    if (!normalized) return
    hideOngoingGame(normalized)
    hiddenIdsRef.current = Array.from(new Set([...hiddenIdsRef.current, normalized]))
    loadSeq.current += 1
    setGames((prev) => applyHidden(prev).filter((game) => gameId(game) !== normalized))
    setHiddenTick((n) => n + 1)
    showToast('success', 'Successfully hidden')
  }

  const showHidden = () => {
    unhideAllOngoingGames()
    hiddenIdsRef.current = []
    setHiddenTick((n) => n + 1)
    void load()
  }

  if (!isAuthed) return null
  if (visible.length === 0 && hiddenIds.length === 0 && !hasMore) return null

  return (
    <StyledHomeOngoingCard>
      <header className="ongoing-head">
        <h2 className="ongoing-title">Continue</h2>
        <Link href="/ongoing" className="ongoing-link">
          All
        </Link>
      </header>

      {visible.length > 0 ? (
        <ul className="ongoing-list">
          {visible.map((game) => {
            const id = gameId(game)
            return (
              <li key={id || mapLabel(game)} className="ongoing-item">
                <Link href={`/game/${id}`} className="ongoing-row">
                  <div className="ongoing-copy">
                    <span className="ongoing-name">{mapLabel(game)}</span>
                    <span className="ongoing-meta">{metaLabel(game)}</span>
                  </div>
                  <span className="ongoing-resume">Resume</span>
                </Link>
                <button type="button" className="ongoing-hide" onClick={() => hide(id)}>
                  Hide
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="ongoing-empty">
          <p>{hiddenIds.length > 0 ? `${hiddenIds.length} hidden` : 'Nothing to show'}</p>
          {hiddenIds.length > 0 ? (
            <button type="button" className="ongoing-restore" onClick={showHidden}>
              Show again
            </button>
          ) : null}
        </div>
      )}
    </StyledHomeOngoingCard>
  )
}

export default HomeOngoingCard
