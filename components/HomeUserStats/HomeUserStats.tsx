import Link from 'next/link'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatLargeNumber, mailman } from '@utils/helpers'
import StyledHomeUserStats from './HomeUserStats.Styled'

type StatItem = { label: string; data: number }

const pick = (stats: StatItem[], label: string) => stats.find((s) => s.label === label)?.data ?? 0

const HomeUserStats: FC = () => {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StatItem[] | null>(null)
  const userId = session?.user?.id
  const isAuthed = status === 'authenticated' && Boolean(userId)

  const fetchStats = useCallback(async () => {
    if (!userId) return
    const res = await mailman(`users/stats?userId=${encodeURIComponent(String(userId))}`)
    if (!Array.isArray(res)) return
    setStats(res as StatItem[])
  }, [userId])

  useEffect(() => {
    if (!isAuthed) {
      setStats(null)
      return
    }
    void fetchStats()
  }, [isAuthed, fetchStats])

  const view = useMemo(() => {
    if (!stats) return null
    const best = pick(stats, 'Best score (pts)')
    const avg = pick(stats, 'Average score (pts)')
    const last5 = pick(stats, 'Last 5 average (pts)')
    const fiveKRate = pick(stats, '5k rate (%)')
    const games = pick(stats, 'Games finished')
    const missKm = pick(stats, 'Average miss (km)')
    const streak = pick(stats, 'Best streak (countries)')
    const duelWins = pick(stats, 'Duel wins')
    const duels = pick(stats, 'Duels finished')
    const duelRate = pick(stats, 'Duel win rate (%)')
    const daily = pick(stats, 'Daily challenge wins')
    const formDelta = last5 - avg
    return {
      best,
      avg,
      last5,
      fiveKRate,
      games,
      missKm,
      streak,
      duelWins,
      duels,
      duelRate,
      daily,
      formDelta,
    }
  }, [stats])

  if (!isAuthed) return null

  return (
    <StyledHomeUserStats>
      <div className="stats-head">
        <h3 className="stats-title">Stats</h3>
        {userId ? (
          <Link href={`/user/${encodeURIComponent(String(userId))}`} className="stats-link">
            All
          </Link>
        ) : null}
      </div>

      {view === null ? (
        <div className="stats-loading" aria-hidden>
          <div className="stats-skel stats-skel--wide" />
          <div className="stats-skel" />
          <div className="stats-skel" />
        </div>
      ) : (
        <>
          <ul className="stats-hero">
            <li>
              <span className="stats-value">{formatLargeNumber(view.best)}</span>
              <span className="stats-label">Best</span>
            </li>
            <li>
              <span className="stats-value">{formatLargeNumber(view.avg)}</span>
              <span className="stats-label">Career avg</span>
            </li>
            <li>
              <span className="stats-value">{formatLargeNumber(view.last5)}</span>
              <span className="stats-label">
                Last 5
                {view.games >= 2 && view.formDelta !== 0 ? (
                  <span className={view.formDelta >= 0 ? 'stats-delta is-up' : 'stats-delta is-down'}>
                    {view.formDelta >= 0 ? '+' : ''}
                    {formatLargeNumber(view.formDelta)}
                  </span>
                ) : null}
              </span>
            </li>
          </ul>

          <div className="stats-meter">
            <div className="stats-meter-head">
              <span>5k rate</span>
              <span>{view.fiveKRate}%</span>
            </div>
            <div className="stats-meter-track" aria-hidden>
              <div className="stats-meter-fill" style={{ width: `${Math.min(100, view.fiveKRate)}%` }} />
            </div>
          </div>

          <dl className="stats-meta">
            <div>
              <dt>Games</dt>
              <dd>{formatLargeNumber(view.games)}</dd>
            </div>
            <div>
              <dt>Avg miss</dt>
              <dd>{formatLargeNumber(view.missKm)} km</dd>
            </div>
            <div>
              <dt>Best streak</dt>
              <dd>{formatLargeNumber(view.streak)}</dd>
            </div>
            <div>
              <dt>Duels</dt>
              <dd>
                {formatLargeNumber(view.duelWins)}/{formatLargeNumber(view.duels)}
                {view.duels > 0 ? ` · ${view.duelRate}%` : ''}
              </dd>
            </div>
            <div>
              <dt>Daily wins</dt>
              <dd>{formatLargeNumber(view.daily)}</dd>
            </div>
          </dl>
        </>
      )}
    </StyledHomeUserStats>
  )
}

export default HomeUserStats
