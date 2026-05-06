import { FC, useEffect, useState } from 'react'
import { PageBackLink } from '@components/PageBackLink'
import { WidthController } from '@components/layout'
import EquitableContinentRowCard from '@components/EquitableContinentRowCard'
import EquitableCountryRowCard from '@components/EquitableCountryRowCard'
import { Meta } from '@components/Meta'
import { SkeletonCards } from '@components/skeletons'
import StyledMapsPage from '@styles/MapsPage.Styled'
import { MapType } from '@types'
import { mailman } from '@utils/helpers'

type EquitableCountryMapRow = Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'> & {
  locationCount?: number
}

type EquitableContinentMapRow = Pick<MapType, '_id' | 'name' | 'previewImg'> & { locationCount?: number }

const MapsPage: FC = () => {
  const [equitableByCountry, setEquitableByCountry] = useState<EquitableCountryMapRow[]>([])
  const [loadingEquitableCountries, setLoadingEquitableCountries] = useState(true)
  const [equitableCountriesError, setEquitableCountriesError] = useState<string | null>(null)

  const [equitableByContinent, setEquitableByContinent] = useState<EquitableContinentMapRow[]>([])
  const [loadingEquitableContinents, setLoadingEquitableContinents] = useState(true)
  const [equitableContinentsError, setEquitableContinentsError] = useState<string | null>(null)

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

  useEffect(() => {
    void getEquitableCountryMaps()
    void getEquitableContinentMaps()
  }, [])

  return (
    <StyledMapsPage>
      <WidthController>
        <Meta title="Browse Maps" />
        <div className="page-back-toolbar">
          <PageBackLink href="/" label="Back to home" compact />
        </div>

        <div className="page-wrapper">
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
        </div>
      </WidthController>
    </StyledMapsPage>
  )
}

export default MapsPage
