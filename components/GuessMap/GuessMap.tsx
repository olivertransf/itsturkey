import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef, useState } from 'react'
import Game from '@backend/models/game'
import { Marker } from '@components/Marker'
import { Button } from '@components/system'
import { ArrowRightIcon, XIcon } from '@heroicons/react/outline'
import { useAppSelector } from '@redux/hook'
import { GoogleMapsConfigType, LocationType } from '@types'
import { getGuessMapOptions } from '@utils/constants/googleMapOptions'
import useGuessMap from '@utils/hooks/useGuessMap'
import { getMapsKey, googleMapLoaderAsync, triggerMapsEvent } from '@utils/helpers'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { getGuessMapIdleSize, GUESS_MAP_HOVER_UNIFORM_SCALE, GUESS_MAP_VMIN_MULTIPLIER } from '@utils/helpers/getGuessMapSize'
import type { GuessMapLive } from '@utils/helpers/guessMapLive'
import { locationFromGuessMapClick } from '@utils/helpers/guessMapClick'
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
  /** Primary guess button label (duel uses "Lock in"). */
  submitLabel?: string
  isSpectator?: boolean
  followGuessMapLive?: GuessMapLive | null
  onGuessMapLiveChange?: (live: GuessMapLive) => void
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
  submitLabel = 'Submit Guess',
  isSpectator = false,
  followGuessMapLive = null,
  onGuessMapLiveChange,
}) => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null)

  const {
    mapHeight,
    mapWidth,
    hovering,
    isPinned,
    chromeMode,
    setHovering,
    setIsPinned,
    handleMapHover,
    handleMapLeave,
    expandAndPin,
    changeMapSize,
    resetGuessMapDimensions,
    setMapWidth,
    setMapHeight,
  } = useGuessMap()
  const user = useAppSelector((state) => state.user)

  const mapExpanded = hovering || isPinned || Boolean(mobileMapOpen)
  const tabletTouch = chromeMode === 'tabletTouch'
  const locked = guessLocked || isSpectator
  const showDesktopControls = mapExpanded && chromeMode !== 'phone' && !locked
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const publishTimerRef = useRef<number | null>(null)
  const onGuessMapLiveChangeRef = useRef(onGuessMapLiveChange)
  onGuessMapLiveChangeRef.current = onGuessMapLiveChange

  useEffect(() => {
    if (!googleMapsConfig?.map || isSpectator) return
    const listener = googleMapsConfig.map.addListener('click', (e: google.maps.MapMouseEvent) => placePin(e))
    return () => listener.remove()
  }, [googleMapsConfig, isSpectator])

  useEffect(() => {
    handleResetMapState()
  }, [resetMap, googleMapsConfig, gameData])

  useEffect(() => {
    if (!googleMapsConfig?.map) return
    triggerMapsEvent(googleMapsConfig.map, 'resize')
  }, [googleMapsConfig, mapWidth, mapHeight, mapExpanded, mobileMapOpen])

  useEffect(() => {
    if (!tabletTouch || !mapExpanded || locked || mobileMapOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const root = wrapperRef.current
      if (!root) return
      if (e.target instanceof Node && root.contains(e.target)) return
      setIsPinned(false)
      setHovering(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [tabletTouch, mapExpanded, locked, mobileMapOpen, setHovering, setIsPinned])

  useEffect(() => {
    if (isSpectator || !onGuessMapLiveChange || !googleMapsConfig?.map) return
    const map = googleMapsConfig.map

    const publish = () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      if (!center || zoom == null) return
      const payload: GuessMapLive = {
        lat: center.lat(),
        lng: center.lng(),
        zoom,
        expanded: mapExpanded,
        mapSize: Number(user.guessMapSize) || 2,
        mobileOpen: Boolean(mobileMapOpen),
      }
      if (marker) {
        payload.pinLat = marker.lat
        payload.pinLng = marker.lng
      }
      onGuessMapLiveChangeRef.current?.(payload)
    }

    const schedule = () => {
      if (publishTimerRef.current != null) return
      publishTimerRef.current = window.setTimeout(() => {
        publishTimerRef.current = null
        publish()
      }, 180)
    }

    const idleL = map.addListener('idle', schedule)
    const centerL = map.addListener('center_changed', schedule)
    const zoomL = map.addListener('zoom_changed', schedule)
    publish()

    return () => {
      idleL.remove()
      centerL.remove()
      zoomL.remove()
      if (publishTimerRef.current != null) {
        window.clearTimeout(publishTimerRef.current)
        publishTimerRef.current = null
      }
    }
  }, [
    isSpectator,
    onGuessMapLiveChange,
    googleMapsConfig,
    marker,
    mapExpanded,
    mobileMapOpen,
    user.guessMapSize,
  ])

  useEffect(() => {
    if (!isSpectator || !followGuessMapLive || !googleMapsConfig?.map) return
    const map = googleMapsConfig.map
    const { lat, lng, zoom } = followGuessMapLive
    const cur = map.getCenter()
    const curZoom = map.getZoom() ?? zoom
    const dLat = cur ? Math.abs(cur.lat() - lat) : 99
    const dLng = cur ? Math.abs(cur.lng() - lng) : 99
    const dZoom = Math.abs(curZoom - zoom)
    if (dLat > 8 || dLng > 8 || dZoom > 3) {
      map.setCenter({ lat, lng })
      map.setZoom(zoom)
    } else {
      map.panTo({ lat, lng })
      if (dZoom > 0.05) map.setZoom(zoom)
    }

    if (followGuessMapLive.pinLat != null && followGuessMapLive.pinLng != null) {
      setMarker({ lat: followGuessMapLive.pinLat, lng: followGuessMapLive.pinLng })
      setCurrGuess({ lat: followGuessMapLive.pinLat, lng: followGuessMapLive.pinLng })
    } else {
      setMarker(null)
    }

    const expanded = followGuessMapLive.expanded !== false
    setIsPinned(expanded)
    setHovering(expanded)

    const size = followGuessMapLive.mapSize ?? 2
    const idle = getGuessMapIdleSize(size)
    const scale = expanded ? GUESS_MAP_HOVER_UNIFORM_SCALE : 1
    const m = GUESS_MAP_VMIN_MULTIPLIER
    setMapWidth(idle.width * m * scale)
    setMapHeight(idle.height * m * scale)
  }, [
    isSpectator,
    followGuessMapLive,
    googleMapsConfig,
    setCurrGuess,
    setHovering,
    setIsPinned,
    setMapWidth,
    setMapHeight,
  ])

  const handleResetMapState = () => {
    if (isSpectator) return
    if (!resetMap || !googleMapsConfig?.map || !gameData.mapDetails) return

    const { map } = googleMapsConfig

    const { bounds, scoreFactor } = gameData.mapDetails
    const mapIdStr = String(gameData.mapDetails._id ?? '')
    const isVirtualCountryOrContinentMap =
      parseEquitableCountryMapKey(mapIdStr) !== null || parseEquitableContinentMapKey(mapIdStr) !== null

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

  const placePin = (event: { lat?: number; lng?: number; latLng?: google.maps.LatLng | null }) => {
    if (locked) return
    const location = locationFromGuessMapClick(event)
    if (!location) return

    setCurrGuess(location)
    setMarker(location)
  }

  const nudgeZoom = (delta: number) => {
    if (!googleMapsConfig?.map || locked) return
    const map = googleMapsConfig.map
    const next = Math.min(21, Math.max(1, (map.getZoom() ?? 1) + delta))
    map.setZoom(next)
  }

  return (
    <StyledGuessMap
      mapHeight={mapHeight}
      mapWidth={mapWidth}
      mobileMapOpen={mobileMapOpen}
      mapDimmed={!mobileMapOpen && !hovering && !isPinned}
      duelLayout={duelLayout}
      tabletTouch={tabletTouch}
      mapExpanded={mapExpanded}
    >
      <div
        ref={wrapperRef}
        className="guessMapWrapper"
        onMouseOver={locked || tabletTouch ? undefined : handleMapHover}
        onMouseLeave={locked || tabletTouch ? undefined : handleMapLeave}
        style={{ pointerEvents: locked ? 'none' : undefined }}
      >
        {showDesktopControls && (
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

            {tabletTouch && (
              <>
                <button type="button" className="controlBtn zoom-glyph" onClick={() => nudgeZoom(1)} aria-label="Zoom in">
                  +
                </button>
                <button type="button" className="controlBtn zoom-glyph" onClick={() => nudgeZoom(-1)} aria-label="Zoom out">
                  −
                </button>
              </>
            )}

            <button
              type="button"
              className={`controlBtn ${duelLayout ? 'duel-glyph' : ''}`}
              onClick={() => {
                if (tabletTouch && isPinned) {
                  setIsPinned(false)
                  setHovering(false)
                  return
                }
                setIsPinned(!isPinned)
              }}
              aria-label={isPinned ? 'Collapse map' : 'Pin map'}
            >
              {duelLayout ? (isPinned ? '●' : '○') : isPinned ? <LockClosedIcon /> : <LockOpenIcon />}
            </button>
          </div>
        )}

        <div className="map">
          <GoogleMapReact
            googleMapLoader={googleMapLoaderAsync}
            bootstrapURLKeys={getMapsKey(user.mapsAPIKey, { allowFallback: false })}
            defaultCenter={{ lat: 0, lng: 0 }}
            defaultZoom={1}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => {
              if (!map || !maps) return
              setGoogleMapsConfig({ isLoaded: true, map, mapsApi: maps })
            }}
            onClick={({ lat, lng }) => placePin({ lat, lng })}
            options={getGuessMapOptions(gameData.gameSettings)}
          >
            {marker && (
              <Marker lat={marker.lat} lng={marker.lng} type="guess" userAvatar={user.avatar} isFinalResults={false} />
            )}
          </GoogleMapReact>

          {tabletTouch && !mapExpanded && !locked && (
            <button type="button" className="expand-map-hit" onClick={expandAndPin} aria-label="Expand map" />
          )}
        </div>

        <button className="close-map-button" onClick={closeMobileMap}>
          <XIcon />
        </button>

        {!isSpectator ? (
          <div className="submit-button-wrapper">
            <Button
              variant={!currGuess ? 'solidCustom' : 'primary'}
              backgroundColor="var(--background3)"
              color="#fff"
              width="100%"
              disabled={guessLocked || !currGuess}
              onClick={() => handleSubmitGuess()}
            >
              {submitLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </StyledGuessMap>
  )
}

export default GuessMap
