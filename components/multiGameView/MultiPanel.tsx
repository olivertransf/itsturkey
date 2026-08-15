import { FC, useEffect, useMemo, useRef, useState } from 'react'
import Game from '@backend/models/game'
import { StreetView } from '@components/StreetView'
import { GameViewType } from '@types'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { formatLargeNumber, mailman, normalizeGuessMapLive, normalizeStreetViewLiveView } from '@utils/helpers'
import type { GuessMapLive } from '@utils/helpers/guessMapLive'
import { multiPanelGuessMap } from '@utils/helpers/multiGuessMap'
import type { StreetViewLiveView } from '@utils/helpers/streetViewLiveView'
import { StyledMultiPanel } from './MultiGameView.Styled'

type Props = {
  game: Game
  panelIndex: number
  cooldownSeconds: number
  onGameChange: (game: Game) => void
  isSpectator?: boolean
  isActive?: boolean
  onSelect?: () => void
  onPlayableChange?: (panelId: string, playable: boolean) => void
}

type PanelState = 'playing' | 'cooldown' | 'done'

const MultiPanel: FC<Props> = ({
  game,
  panelIndex,
  cooldownSeconds,
  onGameChange,
  isSpectator = false,
  isActive = false,
  onSelect,
  onPlayableChange,
}) => {
  const [panelGame, setPanelGame] = useState(game)
  const [view, setView] = useState<GameViewType>('Game')
  const [panelState, setPanelState] = useState<PanelState>(game.state === 'finished' ? 'done' : 'playing')
  const [hasBeenActive, setHasBeenActive] = useState(isActive)
  const latestGameRef = useRef(game)
  const roundStartedAtRef = useRef(new Date().getTime())
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalRounds = panelGame.totalRounds ?? panelGame.rounds?.length ?? DEFAULT_TOTAL_ROUNDS
  const lastGuess = panelGame.guesses[panelGame.guesses.length - 1]
  const isPanelDone = isSpectator ? panelGame.state === 'finished' : panelState === 'done'
  const panelId = String(panelGame._id ?? panelIndex)
  const playable = !isPanelDone && panelState === 'playing'
  const guessMap = multiPanelGuessMap({ isActive, playable, isPanelDone, hasBeenActive })

  const followLiveView = useMemo(
    () => (isSpectator ? normalizeStreetViewLiveView(panelGame.liveView) : null),
    [isSpectator, panelGame.liveView]
  )
  const followGuessMapLive = useMemo(
    () => (isSpectator ? normalizeGuessMapLive(panelGame.guessMapLive) : null),
    [isSpectator, panelGame.guessMapLive]
  )

  useEffect(() => {
    latestGameRef.current = game
    setPanelGame(game)
    if (isSpectator) {
      if (game.state === 'finished') setPanelState('done')
      else if (game.playPhase === 'recap') setPanelState('cooldown')
      else setPanelState('playing')
    }
  }, [game, isSpectator])

  useEffect(() => {
    onPlayableChange?.(panelId, playable)
  }, [onPlayableChange, panelId, playable])

  useEffect(() => {
    if (isActive) setHasBeenActive(true)
  }, [isActive])

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
    }
  }, [])

  const handleGameChange = (nextGame: Game) => {
    latestGameRef.current = nextGame
    setPanelGame(nextGame)
    onGameChange(nextGame)
  }

  const handleViewChange = (nextView: GameViewType) => {
    if (isSpectator) return
    if (nextView !== 'Result') {
      setView(nextView)
      return
    }

    setView('Result')
    setPanelState('cooldown')

    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current)
    }

    cooldownTimeoutRef.current = setTimeout(() => {
      const latestGame = latestGameRef.current

      if (latestGame.state === 'finished') {
        setPanelState('done')
        return
      }

      if (latestGame._id) {
        void mailman(`games/${latestGame._id}`, 'PUT', JSON.stringify({ playPhase: 'playing' }))
      }

      roundStartedAtRef.current = new Date().getTime()
      setView('Game')
      setPanelState('playing')
    }, cooldownSeconds * 1000)
  }

  return (
    <StyledMultiPanel
      className={isActive ? 'is-active' : undefined}
      onMouseDown={() => {
        if (playable) onSelect?.()
      }}
    >
      <div className="panel-label">
        Panel {panelIndex + 1}
        <span>
          Round {Math.min(panelGame.round, totalRounds)} / {totalRounds}
        </span>
        <span>{formatLargeNumber(panelGame.totalPoints)} pts</span>
      </div>

      <div className="panel-streetview">
        {!isPanelDone && (
          <StreetView
            gameData={panelGame}
            setGameData={handleGameChange}
            view={view}
            setView={handleViewChange}
            panoElementId={`streetview-${panelGame._id ?? panelIndex}`}
            enableGlobalShortcuts={Boolean(isActive && playable)}
            getGuessTime={() => (new Date().getTime() - roundStartedAtRef.current) / 1000}
            isSpectator={isSpectator}
            hideExit
            hideGuessMap={guessMap.hideGuessMap}
            guessMapInteractive={guessMap.interactive}
            compactStatus
            onLiveViewChange={
              isSpectator || !panelGame._id
                ? undefined
                : (liveView: StreetViewLiveView) => {
                    void mailman(`games/${panelGame._id}`, 'PUT', JSON.stringify({ liveView }))
                  }
            }
            followLiveView={followLiveView}
            onGuessMapLiveChange={
              isSpectator || !panelGame._id
                ? undefined
                : (guessMapLive: GuessMapLive) => {
                    void mailman(`games/${panelGame._id}`, 'PUT', JSON.stringify({ guessMapLive }))
                  }
            }
            followGuessMapLive={followGuessMapLive}
          />
        )}
      </div>

      {panelState === 'cooldown' && (
        <div className="panel-overlay">
          <div className="panel-card">
            <strong>
              {lastGuess?.timedOut && !lastGuess.timedOutWithGuess ? 'Timed out' : `+${lastGuess?.points ?? 0}`}
            </strong>
            <span>Next round in {cooldownSeconds}s</span>
          </div>
        </div>
      )}

      {isPanelDone && (
        <div className="panel-overlay">
          <div className="panel-card">
            <strong>{formatLargeNumber(panelGame.totalPoints)} pts</strong>
            <span>Panel complete</span>
          </div>
        </div>
      )}
    </StyledMultiPanel>
  )
}

export default MultiPanel
