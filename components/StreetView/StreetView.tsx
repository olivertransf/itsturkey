import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Game } from '@backend/models'
import { GameStatus } from '@components/GameStatus'
import { GuessMap } from '@components/GuessMap'
import { LoadingPage } from '@components/layout'
import { StreaksGuessMap } from '@components/StreaksGuessMap'
import { StreetViewControls } from '@components/StreetViewControls'
import { MapIcon } from '@heroicons/react/outline'
import { useAppSelector } from '@redux/hook'
import { GameViewType, GoogleMapsConfigType, LocationType } from '@types'
import { getStreetviewOptions } from '@utils/constants/googleMapOptions'
import { KEY_CODES } from '@utils/constants/keyCodes'
import { mailman, showToast } from '@utils/helpers'
import { attachStreetViewPanZoomLock } from '@utils/helpers/lockStreetViewPanZoom'
import type { LockedStreetViewPose } from '@utils/helpers/lockStreetViewPanZoom'
import { normalizeVisualRestrictions } from '@utils/constants/visualRestrictions'
import { StyledStreetView } from './'
import { DailyQuotaModal } from '@components/modals/DailyQuotaModal'
import { PlonkitGuideLauncher } from '@components/PlonkitCountryGuide'
import { resolvePlonkitGuideCountryIso } from '@utils/helpers/resolvePlonkitGuideCountryIso'

const triggerPanoramaResize = (pano: google.maps.StreetViewPanorama | null) => {
  if (!pano) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      google.maps.event.trigger(pano, 'resize')
    })
  })
}

export type DuelGuessSubmitPayload = {
  guess: LocationType | null
  guessTime: number
  timedOut?: boolean
}

type Props = {
  gameData: Game
  setGameData: (gameData: Game) => void
  view: GameViewType
  setView: (view: GameViewType) => void
  panoElementId?: string
  enableGlobalShortcuts?: boolean
  getGuessTime?: () => number
  /** Duel flow: no undo, no status card, larger guess map, minimal map chrome. */
  isDuel?: boolean
  duelGuessSubmit?: (payload: DuelGuessSubmitPayload) => Promise<void>
  /** Duel: server has locked this viewer’s guess; block further submits and map edits. */
  duelGuessLocked?: boolean
  onGuessCoordinateChange?: (loc: LocationType | null) => void
  /** Duel: chat control rendered above back-to-start in the bottom-left stack. */
  primaryControlsLeading?: ReactNode
}

const Streetview: FC<Props> = ({
  gameData,
  setGameData,
  view,
  setView,
  panoElementId = 'streetview',
  enableGlobalShortcuts = true,
  getGuessTime,
  isDuel = false,
  duelGuessSubmit,
  duelGuessLocked = false,
  onGuessCoordinateChange,
  primaryControlsLeading,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currGuess, setCurrGuess] = useState<LocationType | null>(null)

  const updateCurrGuess = useCallback(
    (loc: LocationType | null) => {
      setCurrGuess(loc)
      onGuessCoordinateChange?.(loc)
    },
    [onGuessCoordinateChange]
  )
  const [countryStreakGuess, setCountryStreakGuess] = useState('')
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [googleMapsConfig, setGoogleMapsConfig] = useState<GoogleMapsConfigType>()
  const [showQuotaModal, setShowQuotaModal] = useState(false)
  const location = gameData.rounds[gameData.round - 1]

  const plonkCountryIsoGame = useMemo(
    () => resolvePlonkitGuideCountryIso(gameData.mapId, location),
    [gameData.mapId, gameData.round, location]
  )

  const countryGuideLeadingControl =
    view === 'Game' && plonkCountryIsoGame && !isDuel ? (
      <PlonkitGuideLauncher
        variant="streetControl"
        countryIso={plonkCountryIsoGame}
        mapLabel={gameData.mapDetails?.name}
      />
    ) : null

  const primaryLeadingControls = (
    <>
      {primaryControlsLeading}
      {countryGuideLeadingControl}
    </>
  )
  const game = useAppSelector((state) => state.game)
  const user = useAppSelector((state) => state.user)

  const serviceRef = useRef<google.maps.StreetViewService | null>(null)
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null)
  const panoContainerRef = useRef<HTMLDivElement | null>(null)
  const lockedPoseRef = useRef<LockedStreetViewPose | null>(null)
  const detachPanZoomLockRef = useRef<(() => void) | null>(null)

  const undoLocRef = useRef<LocationType[]>([])
  const canPan = Boolean(gameData.gameSettings.canPan)
  const canZoom = Boolean(gameData.gameSettings.canZoom)
  const lockPan = !canPan
  const lockZoom = !canZoom
  const fullyFrozenView = lockPan && lockZoom
  const visualFx = useMemo(
    () => normalizeVisualRestrictions(gameData.gameSettings.visualRestrictions),
    [gameData.gameSettings.visualRestrictions]
  )

  const lockPoseTo = useCallback((heading: number, pitch: number, zoom: number) => {
    if (lockPan || lockZoom) {
      lockedPoseRef.current = { heading, pitch, zoom }
      return
    }
    lockedPoseRef.current = null
  }, [lockPan, lockZoom])

  // Initializes Streetview & loads first pano
  useEffect(() => {
    if (!googleMapsConfig) return

    initializeStreetView()

    const timeoutId = setTimeout(checkForQuotaExceeded, 300)

    return () => {
      clearTimeout(timeoutId)
      detachPanZoomLockRef.current?.()
      detachPanZoomLockRef.current = null
      lockedPoseRef.current = null
    }
  }, [googleMapsConfig])

  useEffect(() => {
    if (!googleMapsConfig) return

    const pano = panoramaRef.current
    const el = panoContainerRef.current
    if (!pano || !el || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver(() => {
      google.maps.event.trigger(pano, 'resize')
    })
    ro.observe(el)

    const onWinResize = () => google.maps.event.trigger(pano, 'resize')
    window.addEventListener('resize', onWinResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onWinResize)
    }
  }, [googleMapsConfig])

  // Loads all subsequent panos
  useEffect(() => {
    if (view !== 'Game' || !serviceRef.current) return

    loadNewPano()
  }, [view])

  const checkForQuotaExceeded = () => {
    if (user.quotaModalDismissed || user.mapsAPIKey) {
      return
    }

    const QUOTA_EXCEEDED_MSG = 'For development purposes only'

    const googleMapRootDivs = document.getElementsByClassName('gm-style')

    if (!googleMapRootDivs?.length) {
      return
    }

    Array.from(googleMapRootDivs).map((mapRootDiv) => {
      const innerDivs = mapRootDiv.querySelectorAll('div')

      Array.from(innerDivs).map((innerDiv) => {
        if (innerDiv.innerText.includes(QUOTA_EXCEEDED_MSG)) {
          return setShowQuotaModal(true)
        }
      })
    })
  }

  const initializeStreetView = () => {
    const panoEl = panoContainerRef.current ?? document.getElementById(panoElementId)
    if (!panoEl) return

    const svService = new google.maps.StreetViewService()

    const svPanorama = new google.maps.StreetViewPanorama(panoEl, getStreetviewOptions(gameData))

    svPanorama.addListener('position_changed', trackLocations)

    detachPanZoomLockRef.current?.()
    detachPanZoomLockRef.current = null
    lockedPoseRef.current = null

    if (lockPan || lockZoom) {
      detachPanZoomLockRef.current = attachStreetViewPanZoomLock(
        svPanorama,
        () => lockedPoseRef.current,
        { lockPan, lockZoom }
      )
    }

    serviceRef.current = svService
    panoramaRef.current = svPanorama

    loadNewPano()
  }

  const loadNewPano = async () => {
    setLoading(true)

    const svService = serviceRef.current
    const svPanorama = panoramaRef.current

    if (!svService || !svPanorama) {
      setLoading(false)
      return
    }

    const loc = gameData.rounds[gameData.round - 1]
    if (!loc) {
      setLoading(false)
      showToast('error', 'Missing round location')
      return
    }

    const lat = Number(loc.lat)
    const lng = Number(loc.lng)
    const useLatLng = Number.isFinite(lat) && Number.isFinite(lng)

    if (!loc.panoId && !useLatLng) {
      setLoading(false)
      showToast('error', 'Missing round location')
      return
    }

    const request: google.maps.StreetViewLocationRequest | { pano: string } = loc.panoId
      ? { pano: loc.panoId }
      : { location: { lat, lng }, radius: 150 }

    await new Promise<void>((resolve) => {
      svService.getPanorama(request, (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.pano) {
          showToast('error', 'Could not load streetview for this location')
          setLoading(false)
          resolve()
          return
        }

        const heading = loc.heading ?? 0
        const pitch = loc.pitch ?? 0
        const zoom = loc.zoom ?? 0

        svPanorama.setPano(data.location.pano)
        svPanorama.setPov({ heading, pitch })
        svPanorama.setZoom(zoom)
        svPanorama.setVisible(true)
        lockPoseTo(heading, pitch, zoom)

        undoLocRef.current = []
        triggerPanoramaResize(svPanorama)
        setLoading(false)
        resolve()
      })
    })
  }

  const trackLocations = () => {
    if (!panoramaRef.current) return

    let pos = panoramaRef.current.getPosition()

    if (pos == null) return
    const undo = undoLocRef.current
    const loc: LocationType = {'lat': pos.lat(), 'lng': pos.lng()}
    const compareLocs = (loc1?: LocationType, loc2?: LocationType): boolean => {
      if (!loc1 || !loc2 ) return false

      return loc1.lat === loc2.lat && loc1.lng === loc2.lng;
    }

    // don't store repeated movements (e.g. return to start)
    if (undo.length < 1 || !compareLocs(loc, undo.at(-1))) undo.push(loc)
  }

  const handleSubmitGuess = async (timedOut?: boolean) => {
    if (duelGuessLocked) return

    if (currGuess || countryStreakGuess || timedOut) {
      if (!getGuessTime && !game.startTime) {
        return showToast('error', 'Something went wrong')
      }

      const guessTime = getGuessTime ? getGuessTime() : (new Date().getTime() - (game.startTime as number)) / 1000

      if (duelGuessSubmit) {
        await duelGuessSubmit({
          guess: currGuess,
          guessTime,
          timedOut,
        })
        return
      }

      const body = {
        guess: currGuess || { lat: 0, lng: 0 },
        guessTime,
        localRound: gameData.round,
        timedOut,
        timedOutWithGuess: currGuess !== null,
        streakLocationCode: countryStreakGuess.toLowerCase(),
      }

      const res = await mailman(`games/${gameData._id}`, 'PUT', JSON.stringify(body))

      if (res.error) {
        return showToast('error', res.error.message)
      }

      setGameData({ ...res.game, mapDetails: res.mapDetails, userDetails: gameData.userDetails })
      setView('Result')
    }
  }

  const handleBackToStart = () => {
    if (!panoramaRef.current) return

    const heading = location.heading || 0
    const pitch = location.pitch || 0
    const zoom = panoramaRef.current.getZoom() ?? location.zoom ?? 0

    panoramaRef.current.setPosition(location)
    panoramaRef.current.setPov({ heading, pitch })
    lockPoseTo(heading, pitch, zoom)
  }

  const handleExitGame = async () => {
    const mapId = gameData.mapDetails?._id?.toString?.() ?? gameData.mapId

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    if (mapId) {
      await router.push(`/map/${mapId}`)
      return
    }

    await router.push('/ongoing')
  }

  const handleBackToStartKeys = (e: KeyboardEvent) => {
    const backToStartKeys = ['r']

    if (backToStartKeys.includes(e.key)) {
      handleBackToStart()
    }
  }

  useEffect(() => {
    if (view !== 'Game' || !enableGlobalShortcuts) return

    document.addEventListener('keydown', handleBackToStartKeys)

    return () => {
      document.removeEventListener('keydown', handleBackToStartKeys)
    }
  }, [view, enableGlobalShortcuts])

  const handleUndoLastMove = () => {
    if (!panoramaRef.current) return

    if (undoLocRef.current.length > 1) {
      undoLocRef.current.pop() // drop current location
      panoramaRef.current.setPosition(undoLocRef.current[undoLocRef.current.length-1]); // set to last location
    }
  }

  const handleUndoLastMoveKeys = (e: KeyboardEvent) => {
    const undoMoveKeys = ['z']

    if (undoMoveKeys.includes(e.key) && gameData.gameSettings.canMove) {
      handleUndoLastMove()
    }
  }

  useEffect(() => {
    if (view !== 'Game' || !enableGlobalShortcuts || isDuel) return

    document.addEventListener('keydown', handleUndoLastMoveKeys)

    return () => {
      document.removeEventListener('keydown', handleUndoLastMoveKeys)
    }
  }, [view, enableGlobalShortcuts, isDuel])

  const handleSubmitGuessKeys = async (e: KeyboardEvent) => {
    const submitGuessKeys = [KEY_CODES.SPACE, KEY_CODES.SPACE_IE11, KEY_CODES.ENTER]

    if (submitGuessKeys.includes(e.key)) {
      await handleSubmitGuess()
    }
  }

  useEffect(() => {
    if (view !== 'Game' || !enableGlobalShortcuts) return

    document.addEventListener('keydown', handleSubmitGuessKeys, { once: true })

    return () => {
      document.removeEventListener('keydown', handleSubmitGuessKeys)
    }
  }, [currGuess, countryStreakGuess, view, enableGlobalShortcuts, duelGuessLocked])

  const handleRestrictedViewKeys = (e: KeyboardEvent) => {
    const movingKeys = [
      KEY_CODES.ARROW_DOWN,
      KEY_CODES.ARROW_DOWN_IE11,
      KEY_CODES.ARROW_UP,
      KEY_CODES.ARROW_UP_IE11,
      'w',
      's',
    ]
    const panKeys = [
      KEY_CODES.ARROW_LEFT,
      KEY_CODES.ARROW_LEFT_IE11,
      KEY_CODES.ARROW_RIGHT,
      KEY_CODES.ARROW_RIGHT_IE11,
      'a',
      'd',
    ]
    const zoomKeys = ['+', '=', '-', '_']

    if (!gameData.gameSettings.canMove && movingKeys.includes(e.key)) {
      e.stopPropagation()
      e.preventDefault()
    }

    if (!canPan && panKeys.includes(e.key)) {
      e.stopPropagation()
      e.preventDefault()
    }

    if (!canZoom && zoomKeys.includes(e.key)) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (view !== 'Game' || !enableGlobalShortcuts) return

    document.addEventListener('keydown', handleRestrictedViewKeys, { capture: true })

    return () => {
      document.removeEventListener('keydown', handleRestrictedViewKeys, { capture: true })
    }
  }, [view, enableGlobalShortcuts, canPan, canZoom, gameData.gameSettings.canMove])

  useEffect(() => {
    if (!fullyFrozenView || view !== 'Game') return
    const root = panoContainerRef.current
    if (!root) return

    const isStreetViewUi = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('[data-streetview-ui]'))

    const blockInteraction = (e: Event) => {
      if (isStreetViewUi(e.target)) return
      e.preventDefault()
      e.stopPropagation()
    }

    const opts: AddEventListenerOptions = { capture: true, passive: false }
    const types = [
      'pointerdown',
      'pointermove',
      'touchstart',
      'touchmove',
      'wheel',
      'mousedown',
      'mousemove',
      'dblclick',
      'contextmenu',
    ] as const

    for (const type of types) {
      root.addEventListener(type, blockInteraction, opts)
    }

    return () => {
      for (const type of types) {
        root.removeEventListener(type, blockInteraction, opts)
      }
    }
  }, [fullyFrozenView, view, googleMapsConfig])

  return (
    <>
      <StyledStreetView showMap={!loading} $fx={visualFx}>
        {loading && <LoadingPage />}

        <div className="streetview-pano">
          <div className="streetview-fx-stack">
            <div className="fx-layer-spin">
              <div className="fx-layer-wander">
                <div className="fx-layer-drunk">
                  <div className="fx-layer-wobble">
                    <div className="fx-layer-zigzag">
                      <div className="fx-layer-bubble">
                        <div className="fx-layer-static">
                          <div
                            ref={panoContainerRef}
                            id={panoElementId}
                            className="streetview-fx-target"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fx-blink-veil" aria-hidden />
          <div className="fx-vignette-veil" aria-hidden />
          <div className="fx-noise-veil" aria-hidden />

          {fullyFrozenView && view === 'Game' ? (
            <div
              className="streetview-interaction-block"
              aria-hidden
              onContextMenu={(e) => e.preventDefault()}
              onWheel={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          ) : null}
          <div data-streetview-ui>
            <StreetViewControls
              handleBackToStart={handleBackToStart}
              handleExitGame={handleExitGame}
              hideExit={isDuel}
              hudPrimaryStyle={isDuel}
              handleUndoLastMove={
                !isDuel && gameData.gameSettings.canMove ? handleUndoLastMove : undefined
              }
              leadingPrimaryControls={primaryLeadingControls}
            />
          </div>
          {view === 'Game' && !isDuel && (
            <div data-streetview-ui>
              <GameStatus gameData={gameData} handleSubmitGuess={handleSubmitGuess} />
            </div>
          )}

          {gameData.mode === 'standard' && (
            <div data-streetview-ui>
              <GuessMap
                currGuess={currGuess}
                setCurrGuess={updateCurrGuess}
                handleSubmitGuess={handleSubmitGuess}
                mobileMapOpen={mobileMapOpen}
                closeMobileMap={() => setMobileMapOpen(false)}
                googleMapsConfig={googleMapsConfig}
                setGoogleMapsConfig={setGoogleMapsConfig}
                resetMap={view === 'Game'}
                gameData={gameData}
                duelLayout={isDuel}
                guessLocked={isDuel && duelGuessLocked}
                submitLabel={isDuel ? 'Lock in' : undefined}
              />
            </div>
          )}

          {gameData.mode === 'streak' && (
            <div data-streetview-ui>
              <StreaksGuessMap
                countryStreakGuess={countryStreakGuess}
                setCountryStreakGuess={setCountryStreakGuess}
                handleSubmitGuess={handleSubmitGuess}
                mobileMapOpen={mobileMapOpen}
                closeMobileMap={() => setMobileMapOpen(false)}
                googleMapsConfig={googleMapsConfig}
                setGoogleMapsConfig={setGoogleMapsConfig}
                resetMap={view === 'Game'}
                gameData={gameData}
              />
            </div>
          )}

          <button
            data-streetview-ui
            className="toggle-map-button"
            onClick={() => setMobileMapOpen(true)}
          >
            <MapIcon />
          </button>
        </div>
      </StyledStreetView>

      <DailyQuotaModal isOpen={showQuotaModal} closeModal={() => setShowQuotaModal(false)} />
    </>
  )
}

export default Streetview
