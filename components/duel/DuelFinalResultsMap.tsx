import GoogleMapReact from 'google-map-react'
import { FC, ReactNode, useEffect, useMemo, useRef } from 'react'
import { Marker } from '@components/Marker'
import { StyledResultMap } from '@components/ResultMap'
import { useAppSelector } from '@redux/hook'
import type { LocationType } from '@types'
import { RESULT_MAP_OPTIONS } from '@utils/constants/googleMapOptions'
import { createMapPolyline, getMapsKey, googleMapLoaderAsync } from '@utils/helpers'
import type { DuelClientPayload, DuelGuessAvatar } from './duelApiTypes'
import { DUEL_GUESS_MARKER_FALLBACK } from './duelApiTypes'
import styled from 'styled-components'

const MapShell = styled.div<{ $embedded?: boolean }>`
  width: 100%;
  border-radius: ${({ $embedded }) => ($embedded ? '0' : '14px')};
  overflow: hidden;
  border: ${({ $embedded }) => ($embedded ? 'none' : '1px solid rgba(255, 255, 255, 0.14)')};
  background: rgba(0, 0, 0, 0.25);
  box-sizing: border-box;

  .map {
    width: 100%;
    height: ${({ $embedded }) => ($embedded ? '100%' : 'min(52vh, 560px)')};
    min-height: ${({ $embedded }) => ($embedded ? '0' : '320px')};

    @media (max-width: 720px) {
      height: ${({ $embedded }) => ($embedded ? '100%' : 'min(42vh, 420px)')};
      min-height: ${({ $embedded }) => ($embedded ? '0' : '260px')};
    }
  }
`

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  justify-content: center;
  margin: 0 0 10px;
  font-size: 11px;
  color: var(--text-muted);
`

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const Swatch = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
`

type Props = {
  payload: DuelClientPayload
  /** Fill parent map frame (match summary round-summary layout). */
  embedded?: boolean
}

const DuelFinalResultsMap: FC<Props> = ({ payload, embedded = false }) => {
  const user = useAppSelector((state) => state.user)
  const mapRef = useRef<google.maps.Map | null>(null)
  const polylinesRef = useRef<google.maps.Polyline[]>([])

  const hostPin: DuelGuessAvatar = payload.playerAvatars?.host ?? DUEL_GUESS_MARKER_FALLBACK
  const guestPin: DuelGuessAvatar = payload.playerAvatars?.guest ?? DUEL_GUESS_MARKER_FALLBACK

  const rounds = useMemo(() => {
    return payload.roundResults.map((r) => {
      const actual = payload.roundLocations[r.roundIndex] ?? null
      return { result: r, actual }
    })
  }, [payload.roundResults, payload.roundLocations])

  const draw = (map: google.maps.Map) => {
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    const bounds = new google.maps.LatLngBounds()
    let hasPoint = false

    for (const { result, actual } of rounds) {
      if (actual) {
        bounds.extend(actual)
        hasPoint = true
      }
      if (result.hostGuess && !result.hostNoGuess) {
        bounds.extend(result.hostGuess)
        hasPoint = true
        if (actual) {
          polylinesRef.current.push(
            createMapPolyline(
              {
                lat: result.hostGuess.lat,
                lng: result.hostGuess.lng,
                points: 0,
                distance: { metric: 0, imperial: 0 },
                time: 0,
              },
              actual,
              map
            )
          )
        }
      }
      if (result.guestGuess && !result.guestNoGuess) {
        bounds.extend(result.guestGuess)
        hasPoint = true
        if (actual) {
          polylinesRef.current.push(
            createMapPolyline(
              {
                lat: result.guestGuess.lat,
                lng: result.guestGuess.lng,
                points: 0,
                distance: { metric: 0, imperial: 0 },
                time: 0,
              },
              actual,
              map
            )
          )
        }
      }
    }

    if (hasPoint) {
      map.fitBounds(bounds, { top: 36, bottom: 36, left: 36, right: 36 })
    }
  }

  useEffect(() => {
    if (mapRef.current) draw(mapRef.current)
    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.id, rounds.length])

  return (
    <div
      style={
        embedded
          ? { height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }
          : undefined
      }
    >
      <Legend
        style={
          embedded
            ? {
                position: 'absolute',
                zIndex: 2,
                top: 8,
                left: 8,
                right: 8,
                margin: 0,
                padding: '6px 8px',
                borderRadius: 8,
                background: 'rgba(8, 10, 14, 0.72)',
                pointerEvents: 'none',
              }
            : undefined
        }
      >
        <LegendItem>
          <Swatch $color={hostPin.color} />
          {payload.playerNames.host} guesses
        </LegendItem>
        <LegendItem>
          <Swatch $color={guestPin.color} />
          {payload.playerNames.guest} guesses
        </LegendItem>
        <LegendItem>
          <Swatch $color="#f8fafc" />
          Actual (flag + round #)
        </LegendItem>
      </Legend>
      <MapShell $embedded={embedded} style={embedded ? { flex: 1, minHeight: 0, height: '100%' } : undefined}>
        <StyledResultMap>
          <div className="map" style={embedded ? { height: '100%', minHeight: '100%' } : undefined}>
            <GoogleMapReact
              googleMapLoader={googleMapLoaderAsync}
              bootstrapURLKeys={getMapsKey(user.mapsAPIKey, { allowFallback: false })}
              center={{ lat: 20, lng: 0 }}
              zoom={2}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map }) => {
                mapRef.current = map
                draw(map)
              }}
              options={RESULT_MAP_OPTIONS}
            >
              {rounds.flatMap(({ result, actual }) => {
                const n = result.roundIndex + 1
                const nodes: ReactNode[] = []
                if (result.hostGuess && !result.hostNoGuess) {
                  nodes.push(
                    <Marker
                      key={`h-${n}`}
                      type="guess"
                      lat={result.hostGuess.lat}
                      lng={result.hostGuess.lng}
                      userAvatar={{ emoji: hostPin.emoji, color: hostPin.color }}
                      isFinalResults
                      roundNumber={n}
                    />
                  )
                }
                if (result.guestGuess && !result.guestNoGuess) {
                  nodes.push(
                    <Marker
                      key={`g-${n}`}
                      type="guess"
                      lat={result.guestGuess.lat}
                      lng={result.guestGuess.lng}
                      userAvatar={{ emoji: guestPin.emoji, color: guestPin.color }}
                      isFinalResults
                      roundNumber={n}
                    />
                  )
                }
                if (actual) {
                  nodes.push(
                    <Marker
                      key={`a-${n}`}
                      type="actual"
                      lat={(actual as LocationType).lat}
                      lng={(actual as LocationType).lng}
                      isFinalResults
                      roundNumber={n}
                    />
                  )
                }
                return nodes
              })}
            </GoogleMapReact>
          </div>
        </StyledResultMap>
      </MapShell>
    </div>
  )
}

export default DuelFinalResultsMap
