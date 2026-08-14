import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { resetGameSettings, updateGameSettings, updateMapsAPIKey, updateStartTime } from '@redux/slices'
import { GameSettingsType, GameType, MapType } from '@types'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import {
  EMPTY_VISUAL_RESTRICTIONS,
  hasAnyVisualRestriction,
  normalizeVisualRestrictions,
} from '@utils/constants/visualRestrictions'
import type { VisualRestrictions } from '@utils/constants/visualRestrictions'
import { mailman, showToast } from '@utils/helpers'
import { loadMapPickerOptions } from '@utils/loadMapPickerOptions'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'

export type PlayMode = 'single' | 'unlimited'

export type GameStartFooterMeta = {
  title: string
  actionLabel: string
  cancelLabel: string
}

export type UseGameStartFlowOptions = {
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
  onRequestClose?: () => void
  initialPlayMode?: PlayMode
  allowHomeMapPicker?: boolean
}

export type GameStartFlowApi = {
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
  showDetailedChecked: boolean
  canMove: boolean
  canPan: boolean
  canZoom: boolean
  playMode: PlayMode
  roundCount: number
  sliderVal: number
  visualRestrictions: VisualRestrictions
  isSubmitting: boolean
  allowHomeMapPicker: boolean
  mapPickerOptions: MapPickerRow[]
  mapPickerLoading: boolean
  pickMapById: (id: string) => void
  setPlayMode: (m: PlayMode) => void
  setRoundCount: (n: number) => void
  setSliderVal: (n: number) => void
  setCanMove: (v: boolean) => void
  setCanPan: (v: boolean) => void
  setCanZoom: (v: boolean) => void
  setVisualRestrictions: (v: VisualRestrictions) => void
  handleCheck: () => void
  primaryAction: () => Promise<void>
  cancelAction: () => void
  footerMeta: GameStartFooterMeta
}

export function useGameStartFlow({
  mapDetails,
  gameMode,
  onRequestClose,
  initialPlayMode,
  allowHomeMapPicker = false,
}: UseGameStartFlowOptions): GameStartFlowApi {
  const user = useAppSelector((state) => state.user)

  const [activeMapDetails, setActiveMapDetails] = useState(mapDetails)
  const [mapPickerOptions, setMapPickerOptions] = useState<MapPickerRow[]>([])
  const [mapPickerLoading, setMapPickerLoading] = useState(false)

  const [showDetailedChecked, setShowDetailedChecked] = useState(
    typeof user.gameSettings === 'undefined' ||
      (user.gameSettings?.canMove &&
        user.gameSettings?.canPan &&
        user.gameSettings?.canZoom &&
        user.gameSettings?.timeLimit === 0)
  )
  const [canMove, setCanMove] = useState(user.gameSettings?.canMove ?? true)
  const [canPan, setCanPan] = useState(user.gameSettings?.canPan ?? true)
  const [canZoom, setCanZoom] = useState(user.gameSettings?.canZoom ?? user.gameSettings?.canPan ?? true)
  const [playMode, setPlayMode] = useState<PlayMode>(() => {
    if (gameMode === 'streak') return 'unlimited'
    return initialPlayMode === 'unlimited' ? 'unlimited' : 'single'
  })
  const [roundCount, setRoundCount] = useState(DEFAULT_TOTAL_ROUNDS)
  const [sliderVal, setSliderVal] = useState(user.gameSettings?.timeLimit ?? 0)
  const [visualRestrictions, setVisualRestrictions] = useState<VisualRestrictions>(
    () => normalizeVisualRestrictions(user.gameSettings?.visualRestrictions)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (gameMode === 'streak') {
      setPlayMode('unlimited')
    }
  }, [gameMode])

  useEffect(() => {
    setActiveMapDetails(mapDetails)
  }, [mapDetails._id, mapDetails.name, mapDetails.description, mapDetails.previewImg])

  useEffect(() => {
    if (!allowHomeMapPicker) {
      setMapPickerOptions([])
      setMapPickerLoading(false)
      return
    }

    let cancelled = false
    setMapPickerLoading(true)

    void loadMapPickerOptions({ includeAllMapsOption: true }).then((opts) => {
      if (cancelled) return
      setMapPickerOptions(opts)
      setMapPickerLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [allowHomeMapPicker])

  const pickMapById = useCallback(
    (id: string) => {
      const next = mapPickerOptions.find((m) => String(m._id) === id)
      if (next) setActiveMapDetails(next)
    },
    [mapPickerOptions]
  )

  const footerMeta = useMemo<GameStartFooterMeta>(
    () => ({
      title: 'Start game',
      actionLabel: 'Start',
      cancelLabel: 'Cancel',
    }),
    []
  )

  const cancelAction = useCallback(() => {
    onRequestClose?.()
  }, [onRequestClose])

  const handleStartGame = useCallback(async () => {
    if (!user?.id) {
      showToast('error', 'Sign in to play')
      const callbackUrl = `/map/${encodeURIComponent(String(activeMapDetails._id))}`
      await router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }

    let mapsKey = user.mapsAPIKey || ''
    if (!mapsKey) {
      const settings = await mailman('users/settings')
      const fromDb =
        settings && typeof settings === 'object' && !Array.isArray(settings) && typeof settings.mapsAPIKey === 'string'
          ? settings.mapsAPIKey
          : ''
      if (fromDb) {
        mapsKey = fromDb
        dispatch(updateMapsAPIKey(fromDb))
      }
    }

    if (!mapsKey) {
      showToast('error', 'Add a Google Maps API key in Account settings to play')
      await router.push('/account')
      return
    }

    setIsSubmitting(true)

    const fx = normalizeVisualRestrictions(visualRestrictions)
    const gameSettings: GameSettingsType = {
      timeLimit: sliderVal * 10,
      canMove,
      canPan,
      canZoom,
      ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
    }

    const unlimited = gameMode === 'streak' ? true : playMode === 'unlimited'

    const gameData = {
      mapId: activeMapDetails._id,
      mapName: activeMapDetails.name,
      gameSettings,
      mode: gameMode,
      unlimited,
      ...(!unlimited ? { totalRounds: roundCount } : {}),
    }

    dispatch(updateStartTime({ startTime: new Date().getTime() }))

    dispatch(
      updateGameSettings({
        gameSettings: {
          canMove,
          canPan,
          canZoom,
          timeLimit: sliderVal,
          ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
        },
      })
    )

    const res = await mailman('games', 'POST', JSON.stringify(gameData))

    if (res.error) {
      setIsSubmitting(false)
      showToast('error', res.error.message)
      return
    }

    await router.push(`/game/${res._id}`)
  }, [
    sliderVal,
    canMove,
    canPan,
    canZoom,
    visualRestrictions,
    playMode,
    activeMapDetails._id,
    activeMapDetails.name,
    gameMode,
    roundCount,
    dispatch,
    router,
    user?.id,
    user?.mapsAPIKey,
  ])

  const primaryAction = useCallback(async () => {
    await handleStartGame()
  }, [handleStartGame])

  const handleCheck = useCallback(() => {
    if (showDetailedChecked) {
      setShowDetailedChecked(false)
    } else {
      dispatch(resetGameSettings())
      setShowDetailedChecked(true)
      setCanMove(true)
      setCanPan(true)
      setCanZoom(true)
      setSliderVal(0)
      setRoundCount(DEFAULT_TOTAL_ROUNDS)
      setVisualRestrictions({ ...EMPTY_VISUAL_RESTRICTIONS })
      setActiveMapDetails(mapDetails)
    }
  }, [showDetailedChecked, dispatch, mapDetails])

  return {
    mapDetails: activeMapDetails,
    gameMode,
    showDetailedChecked,
    canMove,
    canPan,
    canZoom,
    playMode,
    roundCount,
    sliderVal,
    visualRestrictions,
    isSubmitting,
    allowHomeMapPicker,
    mapPickerOptions,
    mapPickerLoading,
    pickMapById,
    setPlayMode,
    setRoundCount,
    setSliderVal,
    setCanMove,
    setCanPan,
    setCanZoom,
    setVisualRestrictions,
    handleCheck,
    primaryAction,
    cancelAction,
    footerMeta,
  }
}
