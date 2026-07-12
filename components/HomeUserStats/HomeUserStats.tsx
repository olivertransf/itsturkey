import Link from 'next/link'
import { FC, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatLargeNumber, mailman } from '@utils/helpers'
import StyledHomeUserStats from './HomeUserStats.Styled'

type StatItem = { label: string; data: number }

const SHORT_LABELS: Record<string, string> = {
  'Completed Games': 'Games',
  'Best Game': 'Best score',
  'Average Game Score': 'Avg score',
  'Completed Streak Games': 'Streaks',
  'Best Streak Game': 'Best streak',
  'Daily Challenge Wins': 'Daily wins',
}

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

  if (!isAuthed) return null

  return (
    <StyledHomeUserStats>
      <div className="stats-head">
        <h3 className="stats-title">Your stats</h3>
        {userId ? (
          <Link href={`/user/${encodeURIComponent(String(userId))}`}>
            <a className="stats-link">Profile</a>
          </Link>
        ) : null}
      </div>

      {stats === null ? (
        <div className="stats-loading" aria-hidden>
          <div className="stats-skel" />
          <div className="stats-skel" />
          <div className="stats-skel" />
          <div className="stats-skel" />
        </div>
      ) : (
        <ul className="stats-grid">
          {stats.map((item) => (
            <li key={item.label} className="stats-item">
              <span className="stats-value">{formatLargeNumber(item.data)}</span>
              <span className="stats-label">{SHORT_LABELS[item.label] ?? item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </StyledHomeUserStats>
  )
}

export default HomeUserStats
