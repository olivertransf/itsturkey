/* eslint-disable react-hooks/exhaustive-deps */
import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef, useState } from 'react'
import { Marker } from '@components/Marker'
import { useAppSelector } from '@redux/hook'
import { GuessType, LocationType } from '@types'
import { RESULT_MAP_OPTIONS } from '@utils/constants/googleMapOptions'
import { createMapPolyline } from '@utils/helpers'
import { getMapsKey, googleMapLoaderAsync } from '@utils/helpers'
import { StyledResultMap } from './'

type Props = {
  guessedLocations: GuessType[]
  actualLocations: LocationType[]
  round: number
  isFinalResults?: boolean
  isLeaderboard?: boolean
  userAvatar?: { emoji: string; color: string }
  resetMap?: boolean
}

const isPlottable = (loc: { lat?: number; lng?: number } | null | undefined): loc is LocationType =>
  loc != null && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lng))

const ResultMap: FC<Props> = ({
  guessedLocations,
  actualLocations,
  round,
  isFinalResults,
  isLeaderboard,
  userAvatar,
  resetMap,
}) => {
  const [guessMarkers, setGuessMarkers] = useState<GuessType[]>([])
  const [actualMarkers, setActualMarkers] = useState<LocationType[]>([])

  const resultMapRef = useRef<google.maps.Map | null>(null)
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const user = useAppSelector((state) => state.user)

  useEffect(() => {
    if (!resultMapRef.current || !guessedLocations.length) return

    loadMapMarkers(resultMapRef.current)
  }, [guessedLocations, actualLocations])

  useEffect(() => {
    if (resetMap && resultMapRef.current && guessedLocations.length > 0) {
      loadMapMarkers(resultMapRef.current)
      getMapBounds(resultMapRef.current)
    }
  }, [resetMap, isFinalResults])

  const clearOverlays = () => {
    setGuessMarkers([])
    setActualMarkers([])
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    polylinesRef.current = []
  }

  const getMapBounds = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds()
    let hasPoint = false

    const extend = (loc: { lat?: number; lng?: number } | undefined) => {
      if (!isPlottable(loc)) return
      bounds.extend(loc)
      hasPoint = true
    }

    if (isFinalResults) {
      for (let i = 0; i < guessedLocations.length; i++) {
        extend(guessedLocations[i])
        extend(actualLocations[i])
      }
    } else {
      const idx = Math.max(0, guessedLocations.length - 1)
      extend(guessedLocations[idx])
      extend(actualLocations[idx] ?? actualLocations[round - 2])
    }

    if (!hasPoint) return

    map.setCenter(bounds.getCenter())
    map.fitBounds(bounds, { bottom: 20 })
  }

  const loadMapMarkers = (map: google.maps.Map) => {
    clearOverlays()

    if (isFinalResults) {
      const guesses: GuessType[] = []
      const actuals: LocationType[] = []

      for (let i = 0; i < guessedLocations.length; i++) {
        const guess = guessedLocations[i]
        const actual = actualLocations[i]
        if (!isPlottable(guess) || !isPlottable(actual)) continue
        guesses.push(guess)
        actuals.push(actual)
        polylinesRef.current.push(createMapPolyline(guess, actual, map))
      }

      setGuessMarkers(guesses)
      setActualMarkers(actuals)
      return
    }

    const idx = guessedLocations.length - 1
    const guessedLocation = guessedLocations[idx]
    const actualLocation = actualLocations[idx] ?? actualLocations[round - 2]
    if (!isPlottable(guessedLocation) || !isPlottable(actualLocation)) return

    setGuessMarkers([guessedLocation])
    setActualMarkers([actualLocation])
    polylinesRef.current.push(createMapPolyline(guessedLocation, actualLocation, map))
  }

  return (
    <StyledResultMap>
      <div className="map">
        <GoogleMapReact
          googleMapLoader={googleMapLoaderAsync}
          bootstrapURLKeys={getMapsKey(user.mapsAPIKey)}
          center={{ lat: 0, lng: 0 }}
          zoom={2}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            resultMapRef.current = map
            if (!guessedLocations.length) return
            loadMapMarkers(map)
            getMapBounds(map)
          }}
          options={RESULT_MAP_OPTIONS}
        >
          {guessMarkers.filter(isPlottable).map((marker, idx) => (
            <Marker
              key={`guess-${idx}`}
              type="guess"
              lat={marker.lat}
              lng={marker.lng}
              userAvatar={userAvatar ?? user.avatar}
              isFinalResults={!!isFinalResults}
            />
          ))}

          {actualMarkers.filter(isPlottable).map((marker, idx) => (
            <Marker
              key={`actual-${idx}`}
              type="actual"
              lat={marker.lat}
              lng={marker.lng}
              roundNumber={idx + 1}
              isFinalResults={!!isFinalResults}
            />
          ))}
        </GoogleMapReact>
      </div>
    </StyledResultMap>
  )
}
export default ResultMap
