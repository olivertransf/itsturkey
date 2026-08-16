/* eslint-disable @next/next/no-img-element */
import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef, useState } from 'react'
import { Button } from '@components/system'
import { ArrowRightIcon, XIcon } from '@heroicons/react/outline'
import { useAppSelector } from '@redux/hook'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { multiPolygon, polygon } from '@turf/helpers'
import { GoogleMapsConfigType } from '@types'
import countries from '@utils/constants/countries'
import Game from '@backend/models/game'
import { getGuessMapOptions } from '@utils/constants/googleMapOptions'
import { POLYGON_STYLES } from '@utils/constants/polygonStyles'
import { formatPolygon, getMapsKey, googleMapLoaderAsync, triggerMapsEvent } from '@utils/helpers'
import useGuessMap from '@utils/hooks/useGuessMap'
import type { GuessMapLive } from '@utils/helpers/guessMapLive'
import { getGuessMapIdleSize, GUESS_MAP_HOVER_UNIFORM_SCALE, GUESS_MAP_VMIN_MULTIPLIER } from '@utils/helpers/getGuessMapSize'
import { StyledStreaksGuessMap } from './'
import { LockOpenIcon, LockClosedIcon } from '@heroicons/react/solid'

type Props = {
  countryStreakGuess: string
  setCountryStreakGuess: (countryStreakGuess: string) => void
  mobileMapOpen?: boolean
  closeMobileMap: () => void
  handleSubmitGuess: () => void
  googleMapsConfig: GoogleMapsConfigType | undefined
  setGoogleMapsConfig: (googleMapsConfig: GoogleMapsConfigType) => void
  resetMap?: boolean
  gameData: Game
  isSpectator?: boolean
  followGuessMapLive?: GuessMapLive | null
  onGuessMapLiveChange?: (live: GuessMapLive) => void
}

const StreaksGuessMap: FC<Props> = ({
  countryStreakGuess,
  setCountryStreakGuess,
  mobileMapOpen,
  closeMobileMap,
  handleSubmitGuess,
  googleMapsConfig,
  setGoogleMapsConfig,
  resetMap,
  gameData,
  isSpectator = false,
  followGuessMapLive = null,
  onGuessMapLiveChange,
}) => {
  const [selectedCountryName, setSelectedCountryName] = useState('')

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
  const prevCountriesRef = useRef<any>(null)

  const mapExpanded = hovering || isPinned || Boolean(mobileMapOpen)
  const tabletTouch = chromeMode === 'tabletTouch'
  const showDesktopControls = mapExpanded && chromeMode !== 'phone' && !isSpectator
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const publishTimerRef = useRef<number | null>(null)
  const onGuessMapLiveChangeRef = useRef(onGuessMapLiveChange)
  onGuessMapLiveChangeRef.current = onGuessMapLiveChange
  const lastFollowPinRef = useRef<string>('')
  const lastClickRef = useRef<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!googleMapsConfig?.map || isSpectator) return
    const map = googleMapsConfig.map
    let cancelled = false
    let listener: google.maps.MapsEventListener | undefined

    void import('@utils/constants/countryBounds.json').then(({ default: countryBounds }) => {
      if (cancelled) return
      listener = map.addListener('click', (e: google.maps.MapMouseEvent) => addCountryPolygon(e, map, countryBounds))
    })

    return () => {
      cancelled = true
      listener?.remove()
    }
  }, [googleMapsConfig, isSpectator])

  useEffect(() => {
    handleResetMapState()
  }, [resetMap, googleMapsConfig])

  useEffect(() => {
    if (!googleMapsConfig?.map) return
    triggerMapsEvent(googleMapsConfig.map, 'resize')
  }, [googleMapsConfig, mapWidth, mapHeight, mapExpanded, mobileMapOpen])

  useEffect(() => {
    if (!tabletTouch || !mapExpanded || mobileMapOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const root = wrapperRef.current
      if (!root) return
      if (e.target instanceof Node && root.contains(e.target)) return
      setIsPinned(false)
      setHovering(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [tabletTouch, mapExpanded, mobileMapOpen, setHovering, setIsPinned])

  const handleResetMapState = () => {
    if (isSpectator) return
    if (!resetMap || !googleMapsConfig?.map) return

    const { map } = googleMapsConfig

    map.setCenter({ lat: 0, lng: 0 })
    map.setZoom(1)

    setHovering(false)
    setIsPinned(false)
    resetGuessMapDimensions()
    setCountryStreakGuess('')
    removeCountryPolygons(map)
    closeMobileMap()
  }

  const addCountryPolygon = (e: google.maps.MapMouseEvent, map: google.maps.Map, countryBounds: Object) => {
    if (!e.latLng) return

    const clickedCoords = [e.latLng.lng(), e.latLng.lat()]
    lastClickRef.current = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    const clickedPoint = formatPolygon(clickedCoords, {}, 'Point')

    Object.entries(countryBounds).map(([code, bounds]) => {
      const poly = bounds.length > 1 ? multiPolygon(bounds.map((x: any) => [x])) : polygon(bounds)

      const isPointInThisCountry = booleanPointInPolygon(clickedPoint as any, poly as any)

      if (isPointInThisCountry) {
        removeCountryPolygons(map)

        const newCountry = map.data.addGeoJson(formatPolygon(bounds, { code }))

        map.data.setStyle(POLYGON_STYLES['guess'])

        prevCountriesRef.current = newCountry

        setSelectedCountryName(countries.find((x) => x.code === code)?.name || '')
        setCountryStreakGuess(code)
      }
    })
  }

  const removeCountryPolygons = (map: google.maps.Map) => {
    prevCountriesRef.current &&
      prevCountriesRef.current.map((feature: any) => {
        map.data.remove(feature)
      })
  }

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
      if (lastClickRef.current) {
        payload.pinLat = lastClickRef.current.lat
        payload.pinLng = lastClickRef.current.lng
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
    mapExpanded,
    mobileMapOpen,
    user.guessMapSize,
    countryStreakGuess,
  ])

  useEffect(() => {
    if (!isSpectator || !followGuessMapLive || !googleMapsConfig?.map) return
    const map = googleMapsConfig.map
    const { lat, lng, zoom } = followGuessMapLive
    map.panTo({ lat, lng })
    map.setZoom(zoom)
    const expanded = followGuessMapLive.expanded !== false
    setIsPinned(expanded)
    setHovering(expanded)
    const size = followGuessMapLive.mapSize ?? 2
    const idle = getGuessMapIdleSize(size)
    const scale = expanded ? GUESS_MAP_HOVER_UNIFORM_SCALE : 1
    const m = GUESS_MAP_VMIN_MULTIPLIER
    setMapWidth(idle.width * m * scale)
    setMapHeight(idle.height * m * scale)

    const pinKey =
      followGuessMapLive.pinLat != null && followGuessMapLive.pinLng != null
        ? `${followGuessMapLive.pinLat.toFixed(4)},${followGuessMapLive.pinLng.toFixed(4)}`
        : ''
    if (pinKey && pinKey !== lastFollowPinRef.current) {
      lastFollowPinRef.current = pinKey
      void import('@utils/constants/countryBounds.json').then((mod) => {
        addCountryPolygon(
          {
            latLng: { lat: () => followGuessMapLive.pinLat as number, lng: () => followGuessMapLive.pinLng as number },
          } as google.maps.MapMouseEvent,
          map,
          mod.default
        )
      })
    }
  }, [
    isSpectator,
    followGuessMapLive,
    googleMapsConfig,
    setHovering,
    setIsPinned,
    setMapWidth,
    setMapHeight,
  ])

  const nudgeZoom = (delta: number) => {
    if (!googleMapsConfig?.map) return
    const map = googleMapsConfig.map
    const next = Math.min(21, Math.max(1, (map.getZoom() ?? 1) + delta))
    map.setZoom(next)
  }

  return (
    <StyledStreaksGuessMap
      mapHeight={mapHeight}
      mapWidth={mapWidth}
      mobileMapOpen={mobileMapOpen}
      mapDimmed={!mobileMapOpen && !hovering && !isPinned}
      tabletTouch={tabletTouch}
      mapExpanded={mapExpanded}
    >
      <div
        ref={wrapperRef}
        className="guessMapWrapper"
        onMouseOver={isSpectator || tabletTouch ? undefined : handleMapHover}
        onMouseLeave={isSpectator || tabletTouch ? undefined : handleMapLeave}
        style={{ pointerEvents: isSpectator ? 'none' : undefined }}
      >
        {showDesktopControls && (
          <div className="controls">
            <button
              type="button"
              className={`controlBtn increase ${user.guessMapSize === 4 ? 'disabled' : ''}`}
              onClick={() => changeMapSize('increase')}
              disabled={user.guessMapSize === 4}
              aria-label="Larger map"
            >
              <ArrowRightIcon />
            </button>

            <button
              type="button"
              className={`controlBtn decrease ${user.guessMapSize === 1 ? 'disabled' : ''}`}
              onClick={() => changeMapSize('decrease')}
              disabled={user.guessMapSize === 1}
              aria-label="Smaller map"
            >
              <ArrowRightIcon />
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
              className="controlBtn"
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
              {isPinned ? <LockClosedIcon /> : <LockOpenIcon />}
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
            options={getGuessMapOptions(gameData.gameSettings)}
          ></GoogleMapReact>

          {countryStreakGuess && selectedCountryName && (
            <div className="selected-country">
              <img
                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryStreakGuess?.toUpperCase()}.svg`}
                alt={countryStreakGuess}
              />
              <span>{selectedCountryName}</span>
            </div>
          )}

          {tabletTouch && !mapExpanded && !isSpectator && (
            <button type="button" className="expand-map-hit" onClick={expandAndPin} aria-label="Expand map" />
          )}
        </div>

        <button className="close-map-button" onClick={closeMobileMap}>
          <XIcon />
        </button>

        {!isSpectator ? (
          <div className="submit-button-wrapper">
            <Button
              variant={!countryStreakGuess ? 'solidCustom' : 'primary'}
              backgroundColor="var(--background3)"
              color="#fff"
              width="100%"
              disabled={!countryStreakGuess}
              onClick={() => handleSubmitGuess()}
            >
              Submit Guess
            </Button>
          </div>
        ) : null}
      </div>
    </StyledStreaksGuessMap>
  )
}

export default StreaksGuessMap
