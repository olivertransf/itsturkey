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
import { formatPolygon, getMapsKey, googleMapLoaderAsync } from '@utils/helpers'
import useGuessMap from '@utils/hooks/useGuessMap'
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
  } = useGuessMap()

  const user = useAppSelector((state) => state.user)
  const prevCountriesRef = useRef<any>(null)

  const mapExpanded = hovering || isPinned || Boolean(mobileMapOpen)
  const tabletTouch = chromeMode === 'tabletTouch'
  const showDesktopControls = mapExpanded && chromeMode !== 'phone'
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    handleSetupMap()
  }, [googleMapsConfig])

  useEffect(() => {
    handleResetMapState()
  }, [resetMap, googleMapsConfig])

  useEffect(() => {
    if (!googleMapsConfig?.map || !googleMapsConfig.mapsApi) return
    googleMapsConfig.mapsApi.event.trigger(googleMapsConfig.map, 'resize')
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

  const handleSetupMap = async () => {
    if (!googleMapsConfig) return

    const { map } = googleMapsConfig

    const { default: countryBounds } = await import('@utils/constants/countryBounds.json')

    map.addListener('click', (e: google.maps.MapMouseEvent) => addCountryPolygon(e, map, countryBounds))
  }

  const handleResetMapState = () => {
    if (!resetMap || !googleMapsConfig) return

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
        onMouseOver={tabletTouch ? undefined : handleMapHover}
        onMouseLeave={tabletTouch ? undefined : handleMapLeave}
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
            onGoogleApiLoaded={({ map, maps }) => setGoogleMapsConfig({ isLoaded: true, map, mapsApi: maps })}
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

          {tabletTouch && !mapExpanded && (
            <button type="button" className="expand-map-hit" onClick={expandAndPin} aria-label="Expand map" />
          )}
        </div>

        <button className="close-map-button" onClick={closeMobileMap}>
          <XIcon />
        </button>

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
      </div>
    </StyledStreaksGuessMap>
  )
}

export default StreaksGuessMap
