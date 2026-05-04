'use client'

import { FC, useEffect, useState } from 'react'
import EquitableContinentRowCard from '@components/EquitableContinentRowCard'
import { MapType } from '@types'
import { mailman } from '@utils/helpers'

type Row = Pick<MapType, '_id' | 'name' | 'previewImg'> & { locationCount?: number }

const HomeEquitableContinentGrid: FC = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const res = await mailman('maps/equitable-by-continent')
      if (cancelled) return
      if (res?.error) {
        setError(res.error.message ?? 'Could not load continent maps')
        setRows([])
        setLoading(false)
        return
      }
      setError(null)
      setRows(Array.isArray(res?.data) ? res.data : [])
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="home-equitable-status">Loading continent maps…</p>
  }

  if (error) {
    return <p className="home-equitable-status home-equitable-status--error">{error}</p>
  }

  if (rows.length === 0) {
    return (
      <p className="home-equitable-status">
        No continent maps yet. Country-tagged pins from your configured equitable source maps are required.
      </p>
    )
  }

  return (
    <div className="home-equitable-grid">
      {rows.map((map) => (
        <EquitableContinentRowCard key={String(map._id)} map={map} />
      ))}
    </div>
  )
}

export default HomeEquitableContinentGrid
