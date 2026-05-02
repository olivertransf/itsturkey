import Link from 'next/link'
import { FC } from 'react'
import StyledHomeWorldCard from './HomeWorldCard.Styled'

type Props = {
  mapId: string
  name: string
  description?: string
  accentColor: string
}

const DEFAULT_TAGLINE = 'Street View geography — find yourself on the map.'

const HomeWorldCard: FC<Props> = ({ mapId, name, description, accentColor }) => {
  const subtitle = description?.trim() || DEFAULT_TAGLINE

  return (
    <StyledHomeWorldCard $accent={accentColor}>
      <div className="large-card-wrapper">
        <div className="map-avatar" aria-hidden />
        <div className="contentWrapper">
          <div className="mapNameWrapper">
            <span className="map-accent-dot" aria-hidden />
            <h2 className="mapName">{name}</h2>
          </div>
          <p className="mapDescription">{subtitle}</p>
          <div className="playWrapper">
            <Link href={`/map/${mapId}`}>
              <a className="mapPlayBtn">Play</a>
            </Link>
          </div>
        </div>
      </div>
    </StyledHomeWorldCard>
  )
}

export default HomeWorldCard
