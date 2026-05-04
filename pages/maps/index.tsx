import { FC, useEffect, useState } from 'react'
import { PageBackLink } from '@components/PageBackLink'
import { WidthController } from '@components/layout'
import EquitableContinentRowCard from '@components/EquitableContinentRowCard'
import EquitableCountryRowCard from '@components/EquitableCountryRowCard'
import { MapPreviewCard } from '@components/MapPreviewCard'
import { Meta } from '@components/Meta'
import { SkeletonCards } from '@components/skeletons'
import StyledMapsPage from '@styles/MapsPage.Styled'
import { MapType } from '@types'
import { mailman, showToast } from '@utils/helpers'

type EquitableCountryMapRow = Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'> & {
  locationCount?: number
}

type EquitableContinentMapRow = Pick<MapType, '_id' | 'name' | 'previewImg'> & { locationCount?: number }

const MapsPage: FC = () => {
  const [officialMaps, setOfficialMaps] = useState<MapType[]>([])
  const [officialMapsPage, setOfficialMapsPage] = useState(0)
  const [officialMapsHasMore, setOfficialMapsHasMore] = useState(false)
  const [loadingOfficial, setLoadingOfficial] = useState(true)

  const [equitableByCountry, setEquitableByCountry] = useState<EquitableCountryMapRow[]>([])
  const [loadingEquitableCountries, setLoadingEquitableCountries] = useState(true)
  const [equitableCountriesError, setEquitableCountriesError] = useState<string | null>(null)

  const [equitableByContinent, setEquitableByContinent] = useState<EquitableContinentMapRow[]>([])
  const [loadingEquitableContinents, setLoadingEquitableContinents] = useState(true)
  const [equitableContinentsError, setEquitableContinentsError] = useState<string | null>(null)

  const [communityMaps, setCommunityMaps] = useState<MapType[]>([])
  const [communityMapsPage, setCommunityMapsPage] = useState(0)
  const [communityMapsHasMore, setCommunityMapsHasMore] = useState(false)
  const [loadingCommunity, setLoadingCommunity] = useState(true)

  const getOfficialMaps = async () => {
    const res = await mailman(`maps/browse/official?page=${officialMapsPage}`)

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setOfficialMaps((prev) => [...prev, ...res.data])
    setOfficialMapsHasMore(res.hasMore)
    setLoadingOfficial(false)
  }

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

  const getCommunityMaps = async () => {
    const res = await mailman(`maps/browse/custom?page=${communityMapsPage}`)

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setCommunityMaps((prev) => [...prev, ...res.data])
    setCommunityMapsHasMore(res.hasMore)
    setLoadingCommunity(false)
  }

  useEffect(() => {
    getOfficialMaps()
  }, [officialMapsPage])

  useEffect(() => {
    void getEquitableCountryMaps()
    void getEquitableContinentMaps()
  }, [])

  useEffect(() => {
    getCommunityMaps()
  }, [communityMapsPage])

  return (
    <StyledMapsPage>
      <WidthController>
        <Meta title="Browse Maps" />
        <div className="page-back-toolbar">
          <PageBackLink href="/" label="Back to home" compact />
        </div>

        <div className="page-wrapper">
          <div>
            <div className="section-title">Official Maps</div>

            {loadingOfficial ? (
              <SkeletonCards />
            ) : (
              <div className="maps-wrapper">
                {officialMaps.map((map, idx) => (
                  <MapPreviewCard key={idx} map={map} showDescription />
                ))}
              </div>
            )}

            {officialMapsHasMore && (
              <div className="more-btn-wrapper">
                <button onClick={() => setOfficialMapsPage((prev) => prev + 1)}>Show More...</button>
              </div>
            )}
          </div>

          <div id="equitable-by-country">
            <div className="section-title">By country</div>
            <p className="section-subtext">
              Standard maps: each card is one country; rounds sample only pins located there.
            </p>

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

          <div id="equitable-by-continent">
            <div className="section-title">By continent</div>
            <p className="section-subtext">
              Standard maps: each card is one continent; rounds sample pins from any country in that continent (same
              equitable pool as By country).
            </p>

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

          <div>
            <div className="section-title">Community Maps</div>

            {loadingCommunity ? (
              <SkeletonCards />
            ) : (
              <div className="maps-wrapper">
                {communityMaps.map((map, idx) => (
                  <MapPreviewCard key={idx} map={map} />
                ))}
              </div>
            )}

            {communityMapsHasMore && (
              <div className="more-btn-wrapper">
                <button onClick={() => setCommunityMapsPage((prev) => prev + 1)}>Show More...</button>
              </div>
            )}
          </div>
        </div>
      </WidthController>
    </StyledMapsPage>
  )
}

export default MapsPage
