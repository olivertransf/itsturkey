import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { PageBackLink } from '@components/PageBackLink'
import { WidthController } from '@components/layout'
import EquitableContinentRowCard from '@components/EquitableContinentRowCard'
import EquitableCountryRowCard from '@components/EquitableCountryRowCard'
import { HomeWorldCard } from '@components/HomeWorldCard'
import MapPreviewCard from '@components/MapPreviewCard/MapPreviewCard'
import { Meta } from '@components/Meta'
import { SkeletonCards } from '@components/skeletons'
import { Tab, Tabs } from '@components/system'
import StyledMapsPage from '@styles/MapsPage.Styled'
import { MapType } from '@types'
import { mailman, showToast } from '@utils/helpers'
import { readRecentMapIds } from '@utils/helpers/recentMapsStorage'

type EquitableCountryMapRow = Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'> & {
  locationCount?: number
}

type EquitableContinentMapRow = Pick<MapType, '_id' | 'name' | 'previewImg'> & { locationCount?: number }

type BrowseTab = 'world' | 'countries' | 'continents' | 'liked' | 'recent'

const parseHomeMapCards = (): Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[] => {
  const raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const rec = item as Record<string, unknown>
        const _id = rec._id
        const name = rec.name
        const previewImg = rec.previewImg
        if (typeof _id !== 'string' || typeof name !== 'string' || typeof previewImg !== 'string') {
          return null
        }
        const description = typeof rec.description === 'string' ? rec.description : ''
        return { _id, name, description, previewImg }
      })
      .filter(Boolean) as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[]
  } catch {
    return []
  }
}

const MapsPage: FC = () => {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const [activeTab, setActiveTab] = useState<BrowseTab>('world')

  const [equitableByCountry, setEquitableByCountry] = useState<EquitableCountryMapRow[]>([])
  const [loadingEquitableCountries, setLoadingEquitableCountries] = useState(true)
  const [equitableCountriesError, setEquitableCountriesError] = useState<string | null>(null)

  const [equitableByContinent, setEquitableByContinent] = useState<EquitableContinentMapRow[]>([])
  const [loadingEquitableContinents, setLoadingEquitableContinents] = useState(true)
  const [equitableContinentsError, setEquitableContinentsError] = useState<string | null>(null)

  const [likedMaps, setLikedMaps] = useState<Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[]>([])
  const [loadingLiked, setLoadingLiked] = useState(false)

  const [recentMaps, setRecentMaps] = useState<Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  const homeMaps = useMemo(() => parseHomeMapCards(), [])

  const getEquitableCountryMaps = async () => {
    const res = await mailman('maps/equitable-by-country')

    if (res?.error) {
      setEquitableCountriesError(res.error.message ?? 'Could not load country maps')
      setEquitableByCountry([])
      setLoadingEquitableCountries(false)
      return
    }

    setEquitableCountriesError(null)
    setEquitableByCountry(Array.isArray(res?.data) ? res.data : [])
    setLoadingEquitableCountries(false)
  }

  const getEquitableContinentMaps = async () => {
    const res = await mailman('maps/equitable-by-continent')

    if (res?.error) {
      setEquitableContinentsError(res.error.message ?? 'Could not load continent maps')
      setEquitableByContinent([])
      setLoadingEquitableContinents(false)
      return
    }

    setEquitableContinentsError(null)
    setEquitableByContinent(Array.isArray(res?.data) ? res.data : [])
    setLoadingEquitableContinents(false)
  }

  const fetchLikedMaps = useCallback(async () => {
    if (!isAuthenticated) {
      setLikedMaps([])
      setLoadingLiked(false)
      return
    }

    setLoadingLiked(true)
    const res = await mailman('likes')

    if (res?.error) {
      showToast('error', res.error.message)
      setLikedMaps([])
      setLoadingLiked(false)
      return
    }

    const rows = Array.isArray(res)
      ? res
          .map((row) => {
            const details = row?.mapDetails
            if (!details || typeof details !== 'object') return null
            const d = details as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
            if (!d._id || !d.name) return null
            return d
          })
          .filter(Boolean)
      : []

    setLikedMaps(rows as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[])
    setLoadingLiked(false)
  }, [isAuthenticated])

  const fetchRecentMaps = useCallback(async () => {
    const ids = readRecentMapIds()
    if (ids.length === 0) {
      setRecentMaps([])
      setLoadingRecent(false)
      return
    }

    setLoadingRecent(true)
    const results = await Promise.all(
      ids.map(async (id) => {
        const res = await mailman(`maps/${encodeURIComponent(id)}`)
        if (res?.error || !res?._id) return null
        return {
          _id: res._id,
          name: res.name,
          description: res.description,
          previewImg: res.previewImg,
        } as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
      })
    )

    setRecentMaps(results.filter(Boolean) as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[])
    setLoadingRecent(false)
  }, [])

  useEffect(() => {
    void getEquitableCountryMaps()
    void getEquitableContinentMaps()
  }, [])

  useEffect(() => {
    if (activeTab === 'liked') void fetchLikedMaps()
  }, [activeTab, fetchLikedMaps])

  useEffect(() => {
    if (activeTab === 'recent') void fetchRecentMaps()
  }, [activeTab, fetchRecentMaps])

  const tabItems: { id: BrowseTab; label: string; hidden?: boolean }[] = [
    { id: 'world', label: 'World' },
    { id: 'countries', label: 'Countries' },
    { id: 'continents', label: 'Continents' },
    { id: 'liked', label: 'Liked', hidden: !isAuthenticated },
    { id: 'recent', label: 'Recent' },
  ]

  return (
    <StyledMapsPage>
      <WidthController>
        <Meta title="Browse Maps" />
        <div className="page-back-toolbar">
          <PageBackLink href="/" label="Back to home" compact />
        </div>

        <div className="browse-tabs-row">
          <Tabs>
            {tabItems
              .filter((t) => !t.hidden)
              .map((t) => (
                <Tab key={t.id} isActive={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </Tab>
              ))}
          </Tabs>
        </div>

        <div className="page-wrapper">
          {activeTab === 'world' && (
            <div id="world-maps">
              <div className="section-title">World maps</div>
              <p className="section-subtext">
                Same featured world maps as the home page. More regions live under Countries and Continents.
              </p>
              {homeMaps.length === 0 ? (
                <p className="section-subtext">No world maps configured — check home or pick a country below.</p>
              ) : (
                <div className="maps-wrapper equitable-countries-grid">
                  {homeMaps.map((map) => (
                    <HomeWorldCard key={String(map._id)} mapId={String(map._id)} name={map.name} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'countries' && (
            <div id="equitable-by-country">
              <div className="section-title">By country</div>

              {loadingEquitableCountries ? (
                <SkeletonCards />
              ) : equitableCountriesError ? (
                <p className="section-subtext" style={{ color: 'var(--text-muted)' }}>
                  {equitableCountriesError}
                </p>
              ) : equitableByCountry.length === 0 ? (
                <p className="section-subtext">No country-tagged pins found for the configured source maps.</p>
              ) : (
                <div className="maps-wrapper equitable-countries-grid">
                  {equitableByCountry.map((map) => (
                    <EquitableCountryRowCard key={String(map._id)} map={map} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'continents' && (
            <div id="equitable-by-continent">
              <div className="section-title">By continent</div>

              {loadingEquitableContinents ? (
                <SkeletonCards />
              ) : equitableContinentsError ? (
                <p className="section-subtext" style={{ color: 'var(--text-muted)' }}>
                  {equitableContinentsError}
                </p>
              ) : equitableByContinent.length === 0 ? (
                <p className="section-subtext">No continent-sized pools found for the configured source maps.</p>
              ) : (
                <div className="maps-wrapper equitable-countries-grid">
                  {equitableByContinent.map((map) => (
                    <EquitableContinentRowCard key={String(map._id)} map={map} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'liked' && isAuthenticated && (
            <div id="liked-maps">
              <div className="section-title">Liked maps</div>
              {loadingLiked ? (
                <SkeletonCards />
              ) : likedMaps.length === 0 ? (
                <p className="section-subtext">Like a map from its page to see it here.</p>
              ) : (
                <div className="maps-wrapper">
                  {likedMaps.map((map) => (
                    <MapPreviewCard key={String(map._id)} map={map} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div id="recent-maps">
              <div className="section-title">Recently viewed</div>
              <p className="section-subtext">Last {8} map pages you opened on this device.</p>
              {loadingRecent ? (
                <SkeletonCards />
              ) : recentMaps.length === 0 ? (
                <p className="section-subtext">Open a map page to build your recent list.</p>
              ) : (
                <div className="maps-wrapper">
                  {recentMaps.map((map) => (
                    <MapPreviewCard key={String(map._id)} map={map} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </WidthController>
    </StyledMapsPage>
  )
}

export default MapsPage
