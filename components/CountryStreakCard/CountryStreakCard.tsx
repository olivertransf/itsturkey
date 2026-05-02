import Link from 'next/link'
import { FC } from 'react'
import StyledCountryStreakCard from './CountryStreakCard.Styled'

const CountryStreakCard: FC = () => {
  return (
    <StyledCountryStreakCard>
      <div className="large-card-wrapper">
        <div className="map-avatar" aria-hidden />
        <div className="contentWrapper">
          <div className="mapNameWrapper">
            <span className="map-accent-dot" aria-hidden />
            <h2 className="mapName">Country Streak</h2>
          </div>
          <p className="mapDescription">
            Guess the country from Street View — Equitable World coverage only. Keep your streak going.
          </p>
          <div className="playWrapper">
            <Link href="/equitable-streaks">
              <a className="mapPlayBtn">Play</a>
            </Link>
          </div>
        </div>
      </div>
    </StyledCountryStreakCard>
  )
}

export default CountryStreakCard
