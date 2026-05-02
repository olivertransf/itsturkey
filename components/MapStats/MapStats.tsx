import { FC } from 'react'
import { LocationMarkerIcon } from '@heroicons/react/outline'
import { MapType } from '@types'
import formatApproxLocations from '@utils/helpers/formatApproxLocations'
import { StyledMapStats } from './'

type Props = {
  map: MapType
}

const MapStats: FC<Props> = ({ map }) => {
  const raw =
    typeof map.locationCount !== 'undefined' ? map.locationCount : map.locations?.length

  return (
    <StyledMapStats>
      <span className="locations-eyebrow">Locations</span>
      <div className="locations-line">
        <div className="locations-icon">
          <LocationMarkerIcon />
        </div>
        <span className="locations-text">{formatApproxLocations(raw)}</span>
      </div>
    </StyledMapStats>
  )
}

export default MapStats
