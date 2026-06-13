import { FC } from 'react'
import { Avatar } from '@components/system'
import { FlagIcon } from '@heroicons/react/solid'
import { openStreetViewLocation } from '@utils/helpers/openStreetViewLocation'
import { StyledMarker } from './'

type Props = {
  lat: number
  lng: number
  type: 'guess' | 'actual'
  userAvatar?: { emoji: string; color: string }
  roundNumber?: number
  isFinalResults: boolean
}

const Marker: FC<Props> = ({ lat, lng, type, userAvatar, roundNumber, isFinalResults }) => {
  const handleActualLocationClick = () => {
    openStreetViewLocation(lat, lng)
  }

  const actualLabel =
    isFinalResults && roundNumber != null
      ? `Round ${roundNumber} actual location — open in Street View`
      : 'Actual location — open in Street View'

  return (
    <StyledMarker type={type} onClick={() => type === 'actual' && handleActualLocationClick()}>
      {type === 'guess' && <Avatar size={26} type="user" src={userAvatar?.emoji} backgroundColor={userAvatar?.color} />}

      {type === 'actual' && (
        <div
          className="actual-marker"
          title={actualLabel}
          aria-label={actualLabel}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleActualLocationClick()
            }
          }}
        >
          <FlagIcon />
          {isFinalResults && roundNumber != null && <span className="round-badge">{roundNumber}</span>}
        </div>
      )}
    </StyledMarker>
  )
}

export default Marker
