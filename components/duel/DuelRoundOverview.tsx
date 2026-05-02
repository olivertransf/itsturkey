import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef, useState } from 'react'
import { Marker } from '@components/Marker'
import { Button } from '@components/system'
import StyledResultMap from '@components/ResultMap/ResultMap.Styled'
import { useAppSelector } from '@redux/hook'
import type { DuelRoundResultClient } from './duelApiTypes'
import type { GuessType, LocationType } from '@types'
import { RESULT_MAP_OPTIONS } from '@utils/constants/googleMapOptions'
import createMapPolyline from '@utils/helpers/createMapPolyline'
import { formatDistance } from '@utils/helpers'
import { getMapsKey, googleMapLoaderAsync } from '@utils/helpers'
import styled from 'styled-components'

const KM_TO_MI = 0.621371

const toGuess = (lat: number, lng: number, distKm: number): GuessType => ({
  lat,
  lng,
  points: 0,
  distance: { metric: distKm, imperial: distKm * KM_TO_MI },
  time: 0,
})

const Shell = styled.div<{ $variant: 'fullscreen' | 'compact' }>`
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #0a0a0a;
  color: #e5e5e5;
  padding: ${({ $variant }) => ($variant === 'fullscreen' ? '16px 18px 20px' : '14px')};
  flex: ${({ $variant }) => ($variant === 'fullscreen' ? '1' : '0 0 auto')};
  min-height: ${({ $variant }) => ($variant === 'fullscreen' ? '0' : 'auto')};
  overflow: ${({ $variant }) => ($variant === 'fullscreen' ? 'auto' : 'visible')};
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  font-size: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const StatCol = styled.div`
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px 14px;

  h3 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  dl {
    margin: 0;
    display: grid;
    gap: 6px;
  }

  dt {
    opacity: 0.65;
    font-size: 12px;
  }

  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
`

const MapWrap = styled.div<{ $compact: boolean }>`
  flex: ${({ $compact }) => ($compact ? '0 0 auto' : '1')};
  min-height: ${({ $compact }) => ($compact ? '240px' : '200px')};
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;

  .map {
    height: ${({ $compact }) => ($compact ? '240px' : '100%')};
    min-height: 200px;
  }
`

const WinnerLine = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;

  strong {
    color: #fbbf24;
  }
`

type Props = {
  variant: 'fullscreen' | 'compact'
  roundOneBased: number
  mode: 'hp' | 'points'
  actual: LocationType
  result: DuelRoundResultClient
  onContinue?: () => void
}

const DuelRoundOverview: FC<Props> = ({
  variant,
  roundOneBased,
  mode,
  actual,
  result,
  onContinue,
}) => {
  const user = useAppSelector((state) => state.user)
  const mapRef = useRef<google.maps.Map | null>(null)
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const [hostGuess, setHostGuess] = useState<GuessType | null>(null)
  const [guestGuess, setGuestGuess] = useState<GuessType | null>(null)
  const [actualMarkers, setActualMarkers] = useState<LocationType[]>([])

  const fitAndDraw = (map: google.maps.Map) => {
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    const hg =
      result.hostGuess && !result.hostNoGuess
        ? toGuess(result.hostGuess.lat, result.hostGuess.lng, result.hostDistanceMetric)
        : null
    const gg =
      result.guestGuess && !result.guestNoGuess
        ? toGuess(result.guestGuess.lat, result.guestGuess.lng, result.guestDistanceMetric)
        : null

    setHostGuess(hg)
    setGuestGuess(gg)
    setActualMarkers([actual])

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(actual)
    if (hg) bounds.extend(hg)
    if (gg) bounds.extend(gg)

    map.fitBounds(bounds, { top: 24, bottom: 24, left: 24, right: 24 })

    if (hg) {
      polylinesRef.current.push(createMapPolyline(hg, actual, map))
    }
    if (gg) {
      polylinesRef.current.push(createMapPolyline(gg, actual, map))
    }
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    fitAndDraw(map)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw when ledger fields change
  }, [
    actual.lat,
    actual.lng,
    result.roundIndex,
    result.hostPoints,
    result.guestPoints,
    result.damageToHost,
    result.damageToGuest,
    result.hostNoGuess,
    result.guestNoGuess,
    result.hostGuess?.lat,
    result.hostGuess?.lng,
    result.guestGuess?.lat,
    result.guestGuess?.lng,
  ])

  useEffect(() => {
    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
    }
  }, [])

  const hostDistLabel = formatDistance(
    { metric: result.hostDistanceMetric, imperial: result.hostDistanceMetric * KM_TO_MI },
    'metric'
  )
  const guestDistLabel = formatDistance(
    { metric: result.guestDistanceMetric, imperial: result.guestDistanceMetric * KM_TO_MI },
    'metric'
  )

  const winLabel =
    result.winner === 'tie'
      ? 'Tie — equal distance'
      : result.winner === 'host'
      ? 'Host won the round'
      : 'Guest won the round'

  return (
    <Shell $variant={variant === 'compact' ? 'compact' : 'fullscreen'}>
      <Title>Round {roundOneBased} results</Title>
      <WinnerLine>
        <strong>{winLabel}</strong>
      </WinnerLine>

      <StatsGrid>
        <StatCol>
          <h3 style={{ color: '#60a5fa' }}>Host</h3>
          <dl>
            <dt>Distance</dt>
            <dd>{result.hostNoGuess ? 'No guess' : hostDistLabel}</dd>
            <dt>Round points</dt>
            <dd>{result.hostPoints}</dd>
            {mode === 'hp' && (
              <>
                <dt>Damage taken</dt>
                <dd>{result.damageToHost}</dd>
                <dt>HP after</dt>
                <dd>{result.hostHpAfter}</dd>
              </>
            )}
          </dl>
        </StatCol>
        <StatCol>
          <h3 style={{ color: '#c084fc' }}>Guest</h3>
          <dl>
            <dt>Distance</dt>
            <dd>{result.guestNoGuess ? 'No guess' : guestDistLabel}</dd>
            <dt>Round points</dt>
            <dd>{result.guestPoints}</dd>
            {mode === 'hp' && (
              <>
                <dt>Damage taken</dt>
                <dd>{result.damageToGuest}</dd>
                <dt>HP after</dt>
                <dd>{result.guestHpAfter}</dd>
              </>
            )}
          </dl>
        </StatCol>
      </StatsGrid>

      <MapWrap $compact={variant === 'compact'}>
        <StyledResultMap>
          <div className="map">
            <GoogleMapReact
              googleMapLoader={googleMapLoaderAsync}
              bootstrapURLKeys={getMapsKey(user.mapsAPIKey)}
              center={{ lat: actual.lat, lng: actual.lng }}
              zoom={3}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map }) => {
                mapRef.current = map
                fitAndDraw(map)
              }}
              options={RESULT_MAP_OPTIONS}
            >
              {hostGuess && (
                <Marker
                  key="host-g"
                  type="guess"
                  lat={hostGuess.lat}
                  lng={hostGuess.lng}
                  userAvatar={{ emoji: 'H', color: '#2563eb' }}
                  isFinalResults={false}
                />
              )}
              {guestGuess && (
                <Marker
                  key="guest-g"
                  type="guess"
                  lat={guestGuess.lat}
                  lng={guestGuess.lng}
                  userAvatar={{ emoji: 'G', color: '#9333ea' }}
                  isFinalResults={false}
                />
              )}
              {actualMarkers.map((m, idx) => (
                <Marker key={`a-${idx}`} type="actual" lat={m.lat} lng={m.lng} isFinalResults={false} />
              ))}
            </GoogleMapReact>
          </div>
        </StyledResultMap>
      </MapWrap>

      {onContinue && (
        <Button variant="primary" size="sm" style={{ alignSelf: 'flex-start' }} onClick={onContinue}>
          Next round
        </Button>
      )}
    </Shell>
  )
}

export default DuelRoundOverview
