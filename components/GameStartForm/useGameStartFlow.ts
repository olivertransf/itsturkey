import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { resetGameSettings, updateGameSettings, updateStartTime } from '@redux/slices'
import { GameSettingsType, GameType, MapType } from '@types'
import {
  DEFAULT_MULTI_PANEL_COUNT,
  DEFAULT_MULTI_PER_GUESS_SECONDS,
  DEFAULT_TOTAL_ROUNDS,
} from '@utils/constants/gameModes'
import { mailman, showToast } from '@utils/helpers'

export type PlayMode = 'single' | 'unlimited' | 'multiplayer' | 'multi'

export type GameStartFooterMeta = {
  title: string
  actionLabel: string
  cancelLabel: string
}

export type UseGameStartFlowOptions = {
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
  onRequestClose?: () => void
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
  panelCount: number
  perGuessSeconds: number
  showChallengeView: boolean
  sliderVal: number
  challengeId: string
  isSubmitting: boolean
  setPlayMode: (m: PlayMode) => void
  setRoundCount: (n: number) => void
  setPanelCount: (n: number) => void
  setPerGuessSeconds: (n: number) => void
  setSliderVal: (n: number) => void
  setCanMove: (v: boolean) => void
  setCanZoom: (v: boolean) => void
  handleCheck: () => void
  primaryAction: () => Promise<void>
  cancelAction: () => void
  footerMeta: GameStartFooterMeta
}

export function useGameStartFlow({
  mapDetails,
  gameMode,
  onRequestClose,
}: UseGameStartFlowOptions): GameStartFlowApi {
  const user = useAppSelector((state) => state.user)

  const [showDetailedChecked, setShowDetailedChecked] = useState(
    typeof user.gameSettings === 'undefined' ||
      (user.gameSettings?.canMove &&
        user.gameSettings?.canPan &&
        user.gameSettings?.canZoom &&
        user.gameSettings?.timeLimit === 0)
  )
  const [canMove, setCanMove] = useState(user.gameSettings?.canMove ?? true)
  const [canPan, setCanPan] = useState(user.gameSettings?.canPan ?? true)
  const [canZoom, setCanZoom] = useState(user.gameSettings?.canZoom ?? true)
  const [playMode, setPlayMode] = useState<PlayMode>(() => (gameMode === 'streak' ? 'unlimited' : 'single'))
  const [roundCount, setRoundCount] = useState(DEFAULT_TOTAL_ROUNDS)
  const [panelCount, setPanelCount] = useState(DEFAULT_MULTI_PANEL_COUNT)
  const [perGuessSeconds, setPerGuessSeconds] = useState(DEFAULT_MULTI_PER_GUESS_SECONDS)
  const [showChallengeView, setShowChallengeView] = useState(false)
  const [sliderVal, setSliderVal] = useState(user.gameSettings?.timeLimit ?? 0)
  const [challengeId, setChallengeId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (gameMode === 'streak') {
      setPlayMode('unlimited')
    }
  }, [gameMode])

  const footerMeta = useMemo<GameStartFooterMeta>(
    () => ({
      title: showChallengeView ? 'Start Multiplayer' : 'Start Game',
      actionLabel:
        playMode === 'multiplayer' ? (showChallengeView ? 'Start' : 'Invite') : 'Start',
      cancelLabel: showChallengeView ? 'Back' : 'Cancel',
    }),
    [showChallengeView, playMode]
  )

  const cancelAction = useCallback(() => {
    if (showChallengeView) {
      setShowChallengeView(false)
    } else {
      onRequestClose?.()
    }
  }, [showChallengeView, onRequestClose])

  const createChallenge = useCallback(async () => {
    if (!user.id) {
      await router.push('/register')
      return
    }

    setIsSubmitting(true)

    const gameSettings: GameSettingsType = {
      timeLimit: sliderVal * 10,
      canMove,
      canPan,
      canZoom,
    }

    const gameData = {
      mapId: mapDetails._id,
      mapName: mapDetails.name,
      gameSettings,
      mode: gameMode,
      userId: user.id,
      totalRounds: roundCount,
    }

    const res = await mailman('challenges', 'POST', JSON.stringify(gameData))

    setIsSubmitting(false)
    setChallengeId(res)
  }, [
    user.id,
    sliderVal,
    canMove,
    canPan,
    canZoom,
    mapDetails._id,
    mapDetails.name,
    gameMode,
    roundCount,
    router,
  ])

  const handleStartGame = useCallback(async () => {
    setIsSubmitting(true)

    const gameSettings: GameSettingsType = {
      timeLimit: sliderVal * 10,
      canMove,
      canPan,
      canZoom,
    }

    if (playMode === 'multi' && gameMode !== 'streak') {
      const gameData = {
        mapId: mapDetails._id,
        mapName: mapDetails.name,
        gameSettings,
        panelCount,
        totalRoundsPerPanel: roundCount,
        perGuessSeconds,
      }

      const res = await mailman('multi', 'POST', JSON.stringify(gameData))

      if (res.error) {
        setIsSubmitting(false)
        showToast('error', res.error.message)
        return
      }

      await router.push(`/multi/${res._id}`)
      return
    }

    const unlimited = gameMode === 'streak' ? true : playMode === 'unlimited'

    const gameData = {
      mapId: mapDetails._id,
      mapName: mapDetails.name,
      gameSettings,
      mode: gameMode,
      unlimited,
      ...(!unlimited ? { totalRounds: roundCount } : {}),
    }

    dispatch(updateStartTime({ startTime: new Date().getTime() }))

    dispatch(updateGameSettings({ gameSettings: { canMove, canPan, canZoom, timeLimit: sliderVal } }))

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
    playMode,
    panelCount,
    perGuessSeconds,
    mapDetails._id,
    mapDetails.name,
    gameMode,
    roundCount,
    dispatch,
    router,
  ])

  const primaryAction = useCallback(async () => {
    if ((playMode === 'single' || playMode === 'unlimited' || gameMode === 'streak') && !showChallengeView) {
      await handleStartGame()
      return
    }

    if (playMode === 'multi' && !showChallengeView && gameMode !== 'streak') {
      await handleStartGame()
      return
    }

    if (playMode === 'multiplayer' && !showChallengeView && gameMode !== 'streak') {
      await createChallenge()
      setShowChallengeView(true)
      return
    }

    if (playMode === 'multiplayer' && showChallengeView) {
      setIsSubmitting(true)

      dispatch(updateGameSettings({ gameSettings: { canMove, canPan, canZoom, timeLimit: sliderVal } }))

      await router.push(`/challenge/${challengeId}`)
    }
  }, [
    playMode,
    showChallengeView,
    handleStartGame,
    createChallenge,
    dispatch,
    canMove,
    canPan,
    canZoom,
    sliderVal,
    router,
    challengeId,
    gameMode,
  ])

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
      setPanelCount(DEFAULT_MULTI_PANEL_COUNT)
      setPerGuessSeconds(DEFAULT_MULTI_PER_GUESS_SECONDS)
    }
  }, [showDetailedChecked, dispatch])

  return {
    mapDetails,
    gameMode,
    showDetailedChecked,
    canMove,
    canPan,
    canZoom,
    playMode,
    roundCount,
    panelCount,
    perGuessSeconds,
    showChallengeView,
    sliderVal,
    challengeId,
    isSubmitting,
    setPlayMode,
    setRoundCount,
    setPanelCount,
    setPerGuessSeconds,
    setSliderVal,
    setCanMove,
    setCanZoom,
    handleCheck,
    primaryAction,
    cancelAction,
    footerMeta,
  }
}
