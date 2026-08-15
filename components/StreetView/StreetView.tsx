import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Game } from '@backend/models'
import { GameStatus } from '@components/GameStatus'
import { GuessMap } from '@components/GuessMap'
import { StreaksGuessMap } from '@components/StreaksGuessMap'
import { StreetViewControls } from '@components/StreetViewControls'
import { MapIcon } from '@heroicons/react/outline'
import { useAppSelector } from '@redux/hook'
import { GameViewType, GoogleMapsConfigType, LocationType } from '@types'
import { getStreetviewOptions } from '@utils/constants/googleMapOptions'
import { KEY_CODES } from '@utils/constants/keyCodes'
import { WatchersIndicator } from '@components/WatchersIndicator'
import type { WatcherChip } from '@components/WatchersIndicator'
import { DailyQuotaModal } from '@components/modals/DailyQuotaModal'
import { Spinner } from '@components/system'
import { mailman, getMapsKey, googleMapLoaderAsync, showToast } from '@utils/helpers'
import type { StreetViewLiveView } from '@utils/helpers/streetViewLiveView'
import type { GuessMapLive } from '@utils/helpers/guessMapLive'
import { attachStreetViewPanZoomLock } from '@utils/helpers/lockStreetViewPanZoom'
import type { LockedStreetViewPose } from '@utils/helpers/lockStreetViewPanZoom'
import {
  DEFAULT_PIXELATE_LEVEL,
  normalizeVisualRestrictions,
  pixelateFilterCellSize,
} from '@utils/constants/visualRestrictions'
import { StyledStreetView } from './'

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
  /** Friend spectating a solo/streak game — no guess submit. */
  isSpectator?: boolean
  /** Publish live camera pose for spectators (throttled). */
  onLiveViewChange?: (view: StreetViewLiveView) => void
  /** Spectator: force-follow this camera pose. */
  followLiveView?: StreetViewLiveView | null
  onGuessMapLiveChange?: (live: GuessMapLive) => void
  followGuessMapLive?: GuessMapLive | null
  /** Friends currently watching this match (shown to the player). */
  watchers?: WatcherChip[]
  hideExit?: boolean
  hideGuessMap?: boolean
  compactStatus?: boolean
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
  isSpectator = false,
  onLiveViewChange,
  followLiveView = null,
  onGuessMapLiveChange,
  followGuessMapLive = null,
  watchers = [],
  hideExit,
  hideGuessMap = false,
  compactStatus = false,
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
  const [panoReady, setPanoReady] = useState(false)
  const hideExitControl = hideExit ?? isDuel
  const location = gameData.rounds[gameData.round - 1]
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
  const lockPan = !canPan || isSpectator
  const lockZoom = !canZoom || isSpectator
  const fullyFrozenView = (lockPan && lockZoom) || isSpectator
  const visualFx = useMemo(
    () => normalizeVisualRestrictions(gameData.gameSettings.visualRestrictions),
    [gameData.gameSettings.visualRestrictions]
  )
  const liveViewPublishTimerRef = useRef<number | null>(null)
  const followTargetRef = useRef<StreetViewLiveView | null>(null)
  const followPanoKeyRef = useRef('')
  const followRafRef = useRef<number | null>(null)
  const onLiveViewChangeRef = useRef(onLiveViewChange)
  onLiveViewChangeRef.current = onLiveViewChange

  const lockPoseTo = useCallback((heading: number, pitch: number, zoom: number) => {
    if (lockPan || lockZoom) {
      lockedPoseRef.current = { heading, pitch, zoom }
      return
    }
    lockedPoseRef.current = null
  }, [lockPan, lockZoom])

  useEffect(() => {
    if (!panoReady) return

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
  }, [panoReady, visualFx.pixelate, visualFx.pixelateLevel])

  // Publish live camera for spectators (throttled).
  useEffect(() => {
    if (isSpectator || !onLiveViewChange || !panoReady) return
    const pano = panoramaRef.current
    if (!pano) return

    const publish = () => {
      const pov = pano.getPov()
      const pos = pano.getPosition()
      const zoom = pano.getZoom() ?? 0
      const payload: StreetViewLiveView = {
        heading: pov?.heading ?? 0,
        pitch: pov?.pitch ?? 0,
        zoom,
      }
      const panoId = pano.getPano()
      if (panoId) payload.panoId = panoId
      if (pos) {
        payload.lat = pos.lat()
        payload.lng = pos.lng()
      }
      onLiveViewChangeRef.current?.(payload)
    }

    const schedule = () => {
      if (liveViewPublishTimerRef.current != null) return
      liveViewPublishTimerRef.current = window.setTimeout(() => {
        liveViewPublishTimerRef.current = null
        publish()
      }, 180)
    }

    const listeners = [
      pano.addListener('pov_changed', schedule),
      pano.addListener('zoom_changed', schedule),
      pano.addListener('position_changed', schedule),
    ]
    publish()

    return () => {
      listeners.forEach((l) => l.remove())
      if (liveViewPublishTimerRef.current != null) {
        window.clearTimeout(liveViewPublishTimerRef.current)
        liveViewPublishTimerRef.current = null
      }
    }
  }, [isSpectator, onLiveViewChange, panoReady, view, gameData.round])

  // Spectator: smooth-follow the player's camera (lerp POV; jump on pano change).
  useEffect(() => {
    if (!isSpectator || !followLiveView) {
      followTargetRef.current = null
      return
    }
    followTargetRef.current = followLiveView

    const pano = panoramaRef.current
    if (!pano) return

    const placeKey = `${followLiveView.panoId ?? ''}|${followLiveView.lat ?? ''}|${followLiveView.lng ?? ''}`
    if (placeKey !== followPanoKeyRef.current) {
      followPanoKeyRef.current = placeKey
      if (followLiveView.panoId && pano.getPano() !== followLiveView.panoId) {
        pano.setPano(followLiveView.panoId)
      } else if (
        followLiveView.lat != null &&
        followLiveView.lng != null &&
        Number.isFinite(followLiveView.lat) &&
        Number.isFinite(followLiveView.lng)
      ) {
        pano.setPosition({ lat: followLiveView.lat, lng: followLiveView.lng })
      }
    }
  }, [isSpectator, followLiveView])

  useEffect(() => {
    if (!isSpectator || !panoReady) {
      if (followRafRef.current != null) {
        cancelAnimationFrame(followRafRef.current)
        followRafRef.current = null
      }
      return
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const lerpAngle = (from: number, to: number, t: number) => {
      let delta = ((((to - from) % 360) + 540) % 360) - 180
      return from + delta * t
    }

    const tick = () => {
      const pano = panoramaRef.current
      const target = followTargetRef.current
      if (pano && target) {
        const pov = pano.getPov()
        const zoom = pano.getZoom() ?? 0
        const heading = lerpAngle(pov?.heading ?? target.heading, target.heading, 0.22)
        const pitch = lerp(pov?.pitch ?? target.pitch, target.pitch, 0.22)
        const nextZoom = lerp(zoom, target.zoom, 0.22)
        pano.setPov({ heading, pitch })
        pano.setZoom(nextZoom)
        lockPoseTo(heading, pitch, nextZoom)
      }
      followRafRef.current = requestAnimationFrame(tick)
    }

    followRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (followRafRef.current != null) {
        cancelAnimationFrame(followRafRef.current)
        followRafRef.current = null
      }
    }
  }, [isSpectator, panoReady, lockPoseTo])

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
    if (!panoEl) return false

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
    setPanoReady(true)

    loadNewPano()
    return true
  }

  useEffect(() => {
    let cancelled = false
    let quotaTimer: ReturnType<typeof setTimeout> | undefined
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0

    const boot = () => {
      void googleMapLoaderAsync(getMapsKey(user.mapsAPIKey, { allowFallback: false }))
        .then(() => {
          if (cancelled) return
          if (initializeStreetView()) {
            quotaTimer = setTimeout(checkForQuotaExceeded, 300)
            return
          }
          if (attempts >= 12) return
          attempts += 1
          retryTimer = setTimeout(boot, 50)
        })
        .catch(() => {
          if (!cancelled) {
            setLoading(false)
            showToast('error', 'Could not load Street View')
          }
        })
    }

    boot()

    return () => {
      cancelled = true
      if (quotaTimer) clearTimeout(quotaTimer)
      if (retryTimer) clearTimeout(retryTimer)
      detachPanZoomLockRef.current?.()
      detachPanZoomLockRef.current = null
      lockedPoseRef.current = null
      panoramaRef.current = null
      serviceRef.current = null
      setPanoReady(false)
    }
  }, [panoElementId, user.mapsAPIKey])

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
    if (isSpectator) return
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
    if (isSpectator) {
      await router.push('/')
      return
    }

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
    if (view !== 'Game' || !enableGlobalShortcuts || isSpectator) return

    document.addEventListener('keydown', handleSubmitGuessKeys, { once: true })

    return () => {
      document.removeEventListener('keydown', handleSubmitGuessKeys)
    }
  }, [currGuess, countryStreakGuess, view, enableGlobalShortcuts, duelGuessLocked, isSpectator])

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
  }, [fullyFrozenView, view, panoReady])

  const pixelFilterId = `${panoElementId}-pixelate`
  const pixelCell = visualFx.pixelate
    ? pixelateFilterCellSize(
        visualFx.pixelateLevel ?? DEFAULT_PIXELATE_LEVEL,
        visualFx.intensity
      )
    : 0

  return (
    <>
      <StyledStreetView showMap={!loading} $fx={visualFx}>
        <div className="streetview-pano">
          {loading ? (
            <div className="pano-loading" aria-live="polite">
              <Spinner size={40} />
            </div>
          ) : null}
          {visualFx.pixelate ? (
            <svg className="sv-pixelate-defs" aria-hidden>
              <filter id={pixelFilterId} x="0%" y="0%" width="100%" height="100%">
                <feFlood x={pixelCell} y={pixelCell} height="2" width="2" />
                <feComposite width={pixelCell * 2} height={pixelCell * 2} />
                <feTile result="a" />
                <feComposite in="SourceGraphic" in2="a" operator="in" />
                <feMorphology operator="dilate" radius={pixelCell} />
              </filter>
            </svg>
          ) : null}
          <div className="streetview-fx-stack">
            <div className="fx-layer-spin">
              <div className="fx-layer-wander">
                <div className="fx-layer-drunk">
                  <div className="fx-layer-wobble">
                    <div className="fx-layer-zigzag">
                      <div className="fx-layer-bubble">
                        <div className="fx-layer-static">
                          <div
                            className="fx-layer-pixelate"
                            style={
                              visualFx.pixelate
                                ? { filter: `url(#${pixelFilterId})` }
                                : undefined
                            }
                          >
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
              hideExit={hideExitControl}
              hudPrimaryStyle={isDuel}
              handleUndoLastMove={
                !isDuel && !isSpectator && gameData.gameSettings.canMove ? handleUndoLastMove : undefined
              }
              leadingPrimaryControls={primaryControlsLeading}
            />
          </div>
          {isSpectator ? (
            <div className="spectator-banner" data-streetview-ui>
              Spectating
              {typeof gameData.userDetails?.name === 'string' ? ` · ${gameData.userDetails.name}` : ''}
            </div>
          ) : null}
          {!isSpectator && view === 'Game' && watchers.length > 0 ? (
            <WatchersIndicator
              watchers={watchers}
              corner="top-left"
              belowHud={isDuel}
            />
          ) : null}
          {view === 'Game' && !isDuel && (
            <div data-streetview-ui>
              <GameStatus
                gameData={gameData}
                handleSubmitGuess={handleSubmitGuess}
                readOnly={isSpectator}
                compact={compactStatus}
              />
            </div>
          )}

          {!hideGuessMap && gameData.mode === 'standard' && (
            <div data-streetview-ui>
              <GuessMap
                currGuess={currGuess}
                setCurrGuess={updateCurrGuess}
                handleSubmitGuess={handleSubmitGuess}
                mobileMapOpen={followGuessMapLive?.mobileOpen ?? mobileMapOpen}
                closeMobileMap={() => setMobileMapOpen(false)}
                googleMapsConfig={googleMapsConfig}
                setGoogleMapsConfig={setGoogleMapsConfig}
                resetMap={view === 'Game'}
                gameData={gameData}
                duelLayout={isDuel}
                guessLocked={(isDuel && duelGuessLocked) || isSpectator}
                submitLabel={isDuel ? 'Lock in' : undefined}
                isSpectator={isSpectator}
                followGuessMapLive={isSpectator ? followGuessMapLive : null}
                onGuessMapLiveChange={isSpectator ? undefined : onGuessMapLiveChange}
              />
            </div>
          )}

          {!hideGuessMap && gameData.mode === 'streak' && (
            <div data-streetview-ui>
              <StreaksGuessMap
                countryStreakGuess={countryStreakGuess}
                setCountryStreakGuess={setCountryStreakGuess}
                handleSubmitGuess={handleSubmitGuess}
                mobileMapOpen={followGuessMapLive?.mobileOpen ?? mobileMapOpen}
                closeMobileMap={() => setMobileMapOpen(false)}
                googleMapsConfig={googleMapsConfig}
                setGoogleMapsConfig={setGoogleMapsConfig}
                resetMap={view === 'Game'}
                gameData={gameData}
                isSpectator={isSpectator}
                followGuessMapLive={isSpectator ? followGuessMapLive : null}
                onGuessMapLiveChange={isSpectator ? undefined : onGuessMapLiveChange}
              />
            </div>
          )}

          {!isSpectator && !hideGuessMap ? (
            <button
              data-streetview-ui
              className="toggle-map-button"
              onClick={() => setMobileMapOpen(true)}
            >
              <MapIcon />
            </button>
          ) : null}
        </div>
      </StyledStreetView>

      <DailyQuotaModal isOpen={showQuotaModal} closeModal={() => setShowQuotaModal(false)} />
    </>
  )
}

export default Streetview
