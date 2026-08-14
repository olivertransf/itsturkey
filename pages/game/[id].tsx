import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import Game from '@backend/models/game'
import { NotFound } from '@components/errorViews'
import { StandardGameView, StreakGameView } from '@components/gameViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import { useAppDispatch } from '@redux/hook'
import { updateRecentlyPlayed } from '@redux/slices'
import StyledGamePage from '@styles/GamePage.Styled'
import { GameViewType, PageType } from '@types'
import { mailman } from '@utils/helpers'
import { usePresenceHeartbeat } from '@utils/hooks/usePresenceHeartbeat'
import { useVisibleInterval } from '@utils/useVisibleInterval'

const SPECTATE_POLL_MS = 600

const GamePage: PageType = () => {
  const [view, setView] = useState<GameViewType>('Game')
  const [gameData, setGameData] = useState<Game | null>()
  const [isSpectator, setIsSpectator] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)
  const [prevGameId, setPrevGameId] = useState('')
  const prevGuessCountRef = useRef(0)
  const router = useRouter()
  const gameId = typeof router.query.id === 'string' ? router.query.id : ''
  const spectateMode = router.isReady && router.query.spectate === '1'
  const dispatch = useAppDispatch()

  usePresenceHeartbeat(
    'in_game',
    Boolean(!isSpectator && gameData && gameData.state !== 'finished' && view === 'Game'),
    gameId ? { kind: 'game', id: gameId } : null
  )

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
      } else if (guessCount > prevGuessCountRef.current && prevGuessCountRef.current > 0) {
        setView('Result')
      }
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
      setIsSpectator(false)
      setFatal(null)
    }
  }, [gameId, prevGameId])

  useVisibleInterval(
    () => void fetchGame(),
    SPECTATE_POLL_MS,
    Boolean(isSpectator && gameData && gameData.state === 'started')
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
        />
      )}

      {gameData.mode === 'streak' && (
        <StreakGameView
          gameData={gameData}
          setGameData={setGameData}
          view={view}
          setView={setView}
          isSpectator={isSpectator}
        />
      )}
    </StyledGamePage>
  )
}

GamePage.noLayout = true

export default GamePage
