import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@components/system'
import { mailman, showToast } from '@utils/helpers'
import { COUNTRY_STREAK_DETAILS, DAILY_CHALLENGE_DETAILS } from '@utils/constants/random'
import StyledHomeOngoingCard from './HomeOngoingCard.Styled'

type UnfinishedGame = {
  _id: string
  mode?: string
  round?: number
  totalRounds?: number
  unlimited?: boolean
  isDailyChallenge?: boolean
  mapName?: string
  mapDetails?: { name?: string }[]
}

type Props = {
  onPrimaryChange?: (game: UnfinishedGame | null) => void
}

const mapLabel = (game: UnfinishedGame) => {
  if (game.mode === 'streak') return COUNTRY_STREAK_DETAILS.name
  if (game.isDailyChallenge) return DAILY_CHALLENGE_DETAILS.name
  return game.mapDetails?.[0]?.name || game.mapName || 'Unfinished game'
}

const roundLabel = (game: UnfinishedGame) => {
  if (game.mode === 'streak') return 'Country streak in progress'
  if (game.unlimited) return `Round ${game.round ?? 1}`
  const total = game.totalRounds
  if (typeof total === 'number' && total > 0) return `Round ${game.round ?? 1} of ${total}`
  return `Round ${game.round ?? 1}`
}

const HomeOngoingCard: FC<Props> = ({ onPrimaryChange }) => {
  const router = useRouter()
  const { status, data: session } = useSession()
  const [game, setGame] = useState<UnfinishedGame | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [countHint, setCountHint] = useState(0)
  const [discarding, setDiscarding] = useState(false)
  const isAuthed = status === 'authenticated' && Boolean(session?.user?.id)

  const load = useCallback(async () => {
    if (!isAuthed) {
      setGame(null)
      onPrimaryChange?.(null)
      return
    }
    const res = await mailman('games/unfinished?page=0')
    if (!res || res.error || !Array.isArray(res.data)) {
      setGame(null)
      onPrimaryChange?.(null)
      return
    }
    const first = (res.data[0] as UnfinishedGame) ?? null
    setGame(first)
    setHasMore(Boolean(res.hasMore) || res.data.length > 1)
    setCountHint(res.data.length)
    onPrimaryChange?.(first)
  }, [isAuthed, onPrimaryChange])

  useEffect(() => {
    void load()
  }, [load])

  const discard = async () => {
    if (!game?._id) return
    if (!window.confirm('Discard this unfinished game?')) return
    setDiscarding(true)
    const res = await mailman(`games/${game._id}`, 'DELETE')
    setDiscarding(false)
    if (res?.error) {
      showToast('error', res.error.message)
      return
    }
    showToast('success', 'Game discarded')
    await load()
  }

  if (!isAuthed || !game) return null

  return (
    <StyledHomeOngoingCard>
      <div className="ongoing-copy">
        <p className="ongoing-kicker">Continue</p>
        <h3 className="ongoing-title">{mapLabel(game)}</h3>
        <p className="ongoing-meta">{roundLabel(game)}</p>
      </div>
      <div className="ongoing-actions">
        <Button variant="primary" onClick={() => void router.push(`/game/${game._id}`)}>
          Resume
        </Button>
        <Button variant="solidGray" disabled={discarding} onClick={() => void discard()}>
          Discard
        </Button>
        {hasMore ? (
          <Link href="/ongoing" className="ongoing-all">
            All ongoing{countHint > 1 ? ` (${countHint}+)` : ''}
          </Link>
        ) : null}
      </div>
    </StyledHomeOngoingCard>
  )
}

export default HomeOngoingCard
