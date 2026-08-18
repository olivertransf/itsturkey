import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import Game from '@backend/models/game'
import { NotFound } from '@components/errorViews'
import { StandardGameView, StreakGameView } from '@components/gameViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import type { WatcherChip } from '@components/WatchersIndicator'
import { useAppDispatch } from '@redux/hook'
import { updateRecentlyPlayed } from '@redux/slices'
import StyledGamePage from '@styles/GamePage.Styled'
import { GameViewType, PageType } from '@types'
import { mailman } from '@utils/helpers'
import { usePlayViewportLock } from '@utils/hooks/usePlayViewportLock'
import { usePresenceHeartbeat } from '@utils/hooks/usePresenceHeartbeat'
import { useVisibleInterval } from '@utils/useVisibleInterval'

const SPECTATE_POLL_MS = 600
const WATCHERS_POLL_MS = 4000

const GamePage: PageType = () => {
  const [view, setView] = useState<GameViewType>('Game')
  const [gameData, setGameData] = useState<Game | null>()
  const [isSpectator, setIsSpectator] = useState(false)
  const [watchers, setWatchers] = useState<WatcherChip[]>([])
  const [fatal, setFatal] = useState<string | null>(null)
  const [prevGameId, setPrevGameId] = useState('')
  const prevGuessCountRef = useRef(0)
  const spectateHydratedRef = useRef(false)
  const router = useRouter()
  const gameId = typeof router.query.id === 'string' ? router.query.id : ''
  const spectateMode = router.isReady && router.query.spectate === '1'
  const dispatch = useAppDispatch()
  usePlayViewportLock()

  usePresenceHeartbeat(
    'in_game',
    Boolean(!isSpectator && gameData && gameData.state !== 'finished' && view === 'Game'),
    gameId ? { kind: 'game', id: gameId } : null
  )

  usePresenceHeartbeat(
    'spectating',
    Boolean(isSpectator && gameData && gameData.state === 'started'),
    gameId ? { kind: 'game', id: gameId } : null
  )

  const fetchWatchers = useCallback(async () => {
    if (!gameId || gameId.length !== 24 || isSpectator) return
    const res = await mailman(`games/${gameId}/watchers`)
    if (res?.error || !Array.isArray(res?.watchers)) return
    setWatchers(
      res.watchers
        .filter(
          (w: unknown): w is WatcherChip =>
            !!w &&
            typeof w === 'object' &&
            typeof (w as WatcherChip).id === 'string' &&
            typeof (w as WatcherChip).name === 'string'
        )
        .map((w: WatcherChip) => ({ id: w.id, name: w.name }))
    )
  }, [gameId, isSpectator])

  const fetchGame = useCallback(async () => {
    if (!gameId || gameId.length !== 24) return

    const qs = spectateMode ? '?spectate=1' : ''
    const res = await mailman(`games/${gameId}${qs}`)

    if (res?.error) {
      if (res.error.code === 401 || res.error.code === 403) {
        setFatal(res.error.message)
      }
      setGameData(null)
      return
    }

    const { game, mapDetails, gameBelongsToUser, isSpectator: spectatePayload } = res
    const asSpectator = Boolean(spectateMode && spectatePayload)

    if (spectateMode) {
      if (!spectatePayload && !gameBelongsToUser) {
        setGameData(null)
        return
      }
    } else if (!gameBelongsToUser) {
      setGameData(null)
      return
    }

    setIsSpectator(asSpectator)
    setFatal(null)

    const next: Game = { ...game, mapDetails }
    const guessCount = Array.isArray(next.guesses) ? next.guesses.length : 0

    if (asSpectator) {
      if (next.state === 'finished') {
        setView(next.mode === 'streak' ? 'Result' : 'FinalResults')
      } else if (spectateHydratedRef.current && guessCount > prevGuessCountRef.current) {
        setView('Result')
      }
      spectateHydratedRef.current = true
    } else if (next.state === 'finished') {
      setView('Result')
    }

    prevGuessCountRef.current = guessCount

    if (!asSpectator) {
      dispatch(updateRecentlyPlayed({ recentlyPlayed: [] }))
    }

    setGameData(next)
    setPrevGameId(gameId)
  }, [gameId, spectateMode, dispatch])

  useEffect(() => {
    if (!gameId) return
    if (spectateMode) {
      void fetchGame()
      return
    }
    if (view === 'Game') {
      void fetchGame()
    }
  }, [gameId, view, spectateMode, fetchGame])

  useEffect(() => {
    if (gameId !== prevGameId) {
      setView('Game')
      prevGuessCountRef.current = 0
      spectateHydratedRef.current = false
      setIsSpectator(false)
      setWatchers([])
      setFatal(null)
    }
  }, [gameId, prevGameId])

  useVisibleInterval(
    () => void fetchGame(),
    SPECTATE_POLL_MS,
    Boolean(isSpectator && gameData && gameData.state === 'started')
  )

  useVisibleInterval(
    () => void fetchWatchers(),
    WATCHERS_POLL_MS,
    Boolean(!isSpectator && gameData && gameData.state === 'started' && view === 'Game')
  )

  if (gameData === null) {
    return (
      <NotFound
        title="Game Not Found"
        message={
          fatal ||
          (spectateMode
            ? 'This game is private, finished, or only friends can watch.'
            : 'This game likely does not exist or does not belong to you.')
        }
      />
    )
  }

  if (!gameData) {
    return <LoadingPage />
  }

  const ownerName =
    typeof gameData.userDetails?.name === 'string' ? gameData.userDetails.name : 'Friend'

  return (
    <StyledGamePage>
      <Meta title={isSpectator ? `Spectating ${ownerName}` : 'Game'} />

      {gameData.mode === 'standard' && (
        <StandardGameView
          gameData={gameData}
          setGameData={setGameData}
          view={view}
          setView={setView}
          isSpectator={isSpectator}
          watchers={watchers}
        />
      )}

      {gameData.mode === 'streak' && (
        <StreakGameView
          gameData={gameData}
          setGameData={setGameData}
          view={view}
          setView={setView}
          isSpectator={isSpectator}
          watchers={watchers}
        />
      )}
    </StyledGamePage>
  )
}

GamePage.noLayout = true

export default GamePage
