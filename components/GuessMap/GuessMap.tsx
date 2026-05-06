import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef, useState } from 'react'
import Game from '@backend/models/game'
import { Marker } from '@components/Marker'
import { Button } from '@components/system'
import { ArrowRightIcon, XIcon } from '@heroicons/react/outline'
import { useAppSelector } from '@redux/hook'
import { GoogleMapsConfigType, LocationType } from '@types'
import { GUESS_MAP_OPTIONS } from '@utils/constants/googleMapOptions'
import useGuessMap from '@utils/hooks/useGuessMap'
import { getMapsKey, googleMapLoaderAsync } from '@utils/helpers'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { StyledGuessMap } from './'
import { LockOpenIcon, LockClosedIcon } from '@heroicons/react/solid'

type Props = {
  currGuess: LocationType | null
  setCurrGuess: any
  mobileMapOpen?: boolean
  closeMobileMap: () => void
  handleSubmitGuess: () => void
  googleMapsConfig: GoogleMapsConfigType | undefined
  setGoogleMapsConfig: (googleMapsConfig: GoogleMapsConfigType) => void
  resetMap?: boolean
  gameData: Game
  /** Duel: full-size idle map, wider wrapper, text-only map controls. */
  duelLayout?: boolean
  /** Duel: after guess is locked server-side, block map interaction and submit. */
  guessLocked?: boolean
}

const GuessMap: FC<Props> = ({
  currGuess,
  setCurrGuess,
  mobileMapOpen,
  closeMobileMap,
  handleSubmitGuess,
  googleMapsConfig,
  setGoogleMapsConfig,
  resetMap,
  gameData,
  duelLayout = false,
  guessLocked = false,
}) => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null)

  const {
    mapHeight,
    mapWidth,
    hovering,
    isPinned,
    setHovering,
    setIsPinned,
    handleMapHover,
    handleMapLeave,
    changeMapSize,
    resetGuessMapDimensions,
  } = useGuessMap()
  const user = useAppSelector((state) => state.user)

  useEffect(() => {
    handleSetupMap()
  }, [googleMapsConfig])

  useEffect(() => {
    handleResetMapState()
  }, [resetMap, googleMapsConfig, gameData])

  const handleSetupMap = () => {
    if (!googleMapsConfig) return

    const { map } = googleMapsConfig

    map.addListener('click', (e: google.maps.MapMouseEvent) => addMarker(e))
  }

  const handleResetMapState = () => {
    if (!resetMap || !googleMapsConfig || !gameData.mapDetails) return

    const { map } = googleMapsConfig

    const { bounds, scoreFactor } = gameData.mapDetails
    const mapIdStr = String(gameData.mapDetails._id ?? '')
    const isVirtualCountryOrContinentMap =
      parseEquitableCountryMapKey(mapIdStr) !== null || parseEquitableContinentMapKey(mapIdStr) !== null

    // Regional / custom maps: fit bounds. Virtual country/continent maps ship bounds + world scoreFactor.
    const shouldFitBounds =
      bounds &&
      ((typeof scoreFactor === 'number' && scoreFactor > 0 && scoreFactor < 1000) || isVirtualCountryOrContinentMap)

    if (shouldFitBounds) {
      const { min, max } = bounds

      const googleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(min.lat, min.lng),
        new google.maps.LatLng(max.lat, max.lng)
      )

      map.setCenter(googleBounds.getCenter())
      map.fitBounds(googleBounds, -100)
    } else {
      map.setCenter({ lat: 0, lng: 0 })
      map.setZoom(1)
    }

    setHovering(false)
    setIsPinned(false)
    resetGuessMapDimensions()
    setCurrGuess(null)
    setMarker(null)
    closeMobileMap()
  }

  const addMarker = (e: google.maps.MapMouseEvent) => {
    if (guessLocked) return
    if (!e.latLng) return

    const location = { lat: e.latLng.lat(), lng: e.latLng.lng() }

    setCurrGuess(location)
    setMarker(location)
  }

  return (
    <StyledGuessMap
      mapHeight={mapHeight}
      mapWidth={mapWidth}
      mobileMapOpen={mobileMapOpen}
      mapDimmed={!mobileMapOpen && !hovering && !isPinned}
      duelLayout={duelLayout}
    >
      <div
        className="guessMapWrapper"
        onMouseOver={guessLocked ? undefined : handleMapHover}
        onMouseLeave={guessLocked ? undefined : handleMapLeave}
        style={{ pointerEvents: guessLocked ? 'none' : undefined }}
      >
        {hovering && !guessLocked && (
          <div className="controls">
            <button
              type="button"
              className={`controlBtn increase ${user.guessMapSize === 4 ? 'disabled' : ''} ${
                duelLayout ? 'duel-glyph' : ''
              }`}
              onClick={() => changeMapSize('increase')}
              disabled={user.guessMapSize === 4}
              aria-label="Larger map"
            >
              {duelLayout ? '+' : <ArrowRightIcon />}
            </button>

            <button
              type="button"
              className={`controlBtn decrease ${user.guessMapSize === 1 ? 'disabled' : ''} ${
                duelLayout ? 'duel-glyph' : ''
              }`}
              onClick={() => changeMapSize('decrease')}
              disabled={user.guessMapSize === 1}
              aria-label="Smaller map"
            >
              {duelLayout ? '−' : <ArrowRightIcon />}
            </button>

            <button
              type="button"
              className={`controlBtn ${duelLayout ? 'duel-glyph' : ''}`}
              onClick={() => setIsPinned(!isPinned)}
              aria-label={isPinned ? 'Unpin map' : 'Pin map'}
            >
              {duelLayout ? (isPinned ? '●' : '○') : isPinned ? <LockClosedIcon /> : <LockOpenIcon />}
            </button>
          </div>
        )}

        <div className="map">
          <GoogleMapReact
            googleMapLoader={googleMapLoaderAsync}
            bootstrapURLKeys={getMapsKey(user.mapsAPIKey)}
            defaultCenter={{ lat: 0, lng: 0 }}
            defaultZoom={1}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => setGoogleMapsConfig({ isLoaded: true, map, mapsApi: maps })}
            options={GUESS_MAP_OPTIONS}
          >
            {marker && (
              <Marker lat={marker.lat} lng={marker.lng} type="guess" userAvatar={user.avatar} isFinalResults={false} />
            )}
          </GoogleMapReact>
        </div>

        <button className="close-map-button" onClick={closeMobileMap}>
          <XIcon />
        </button>

        <div className="submit-button-wrapper">
          <Button
            variant={!currGuess ? 'solidCustom' : 'primary'}
            backgroundColor="var(--background3)"
            color="#fff"
            width="100%"
            disabled={guessLocked || !currGuess}
            onClick={() => handleSubmitGuess()}
          >
            Submit Guess
          </Button>
        </div>
      </div>
    </StyledGuessMap>
  )
}

export default GuessMap
