'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import EquitableCountryRowCard from '@components/EquitableCountryRowCard'
import { MapType } from '@types'
import { HOME_SPOTLIGHT_COUNTRY_CODES } from '@utils/constants/majorCountryCodes'
import { mailman } from '@utils/helpers'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

type Row = Pick<MapType, '_id' | 'name' | 'previewImg'> & { locationCount?: number }

type Props = {
  /** Home: only spotlight majors (subset). Maps browse: full list. */
  variant?: 'spotlight' | 'full'
}

const HomeEquitableCountryGrid: FC<Props> = ({ variant = 'full' }) => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const res = await mailman('maps/equitable-by-country')
      if (cancelled) return
      if (res?.error) {
        setError(res.error.message ?? 'Could not load country maps')
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

  const displayedRows = useMemo(() => {
    if (variant !== 'spotlight') return rows
    const byCode = new Map<string, Row>()
    for (const r of rows) {
      const code = parseEquitableCountryMapKey(String(r._id))
      if (code) byCode.set(code, r)
    }
    const ordered: Row[] = []
    for (const code of HOME_SPOTLIGHT_COUNTRY_CODES) {
      const hit = byCode.get(code)
      if (hit) ordered.push(hit)
    }
    return ordered
  }, [rows, variant])

  if (loading) {
    return <p className="home-equitable-status">Loading country maps…</p>
  }

  if (error) {
    return <p className="home-equitable-status home-equitable-status--error">{error}</p>
  }

  if (rows.length === 0) {
    return (
      <p className="home-equitable-status">
        No country maps yet. Set <code>EQUITABLE_COUNTRY_STREAK_MAP_IDS</code> or{' '}
        <code>NEXT_PUBLIC_HOME_MAP_CARDS</code> (Equitable World entries) so pins with country codes are available.
      </p>
    )
  }

  if (variant === 'spotlight' && displayedRows.length === 0) {
    return (
      <p className="home-equitable-status">
        None of the spotlight countries have pins in the pool yet. Use <strong>All countries</strong> below for the
        full list.
      </p>
    )
  }

  return (
    <div className="home-equitable-grid">
      {displayedRows.map((map) => (
        <EquitableCountryRowCard key={String(map._id)} map={map} />
      ))}
    </div>
  )
}

export default HomeEquitableCountryGrid
