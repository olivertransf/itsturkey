import { FC, useEffect, useRef, useState } from 'react'
import Game from '@backend/models/game'
import { StreetView } from '@components/StreetView'
import { GameViewType } from '@types'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { formatLargeNumber } from '@utils/helpers'
import { StyledMultiPanel } from './MultiGameView.Styled'

type Props = {
  game: Game
  panelIndex: number
  cooldownSeconds: number
  onGameChange: (game: Game) => void
}

type PanelState = 'playing' | 'cooldown' | 'done'

const MultiPanel: FC<Props> = ({ game, panelIndex, cooldownSeconds, onGameChange }) => {
  const [panelGame, setPanelGame] = useState(game)
  const [view, setView] = useState<GameViewType>('Game')
  const [panelState, setPanelState] = useState<PanelState>(game.state === 'finished' ? 'done' : 'playing')
  const latestGameRef = useRef(game)
  const roundStartedAtRef = useRef(new Date().getTime())
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalRounds = panelGame.totalRounds ?? panelGame.rounds?.length ?? DEFAULT_TOTAL_ROUNDS
  const lastGuess = panelGame.guesses[panelGame.guesses.length - 1]
  const isPanelDone = panelState === 'done'

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

      roundStartedAtRef.current = new Date().getTime()
      setView('Game')
      setPanelState('playing')
    }, cooldownSeconds * 1000)
  }

  return (
    <StyledMultiPanel>
      <div className="panel-label">
        Panel {panelIndex + 1} · Round {Math.min(panelGame.round, totalRounds)} / {totalRounds} ·{' '}
        {formatLargeNumber(panelGame.totalPoints)} pts
      </div>

      <div className="panel-streetview">
        {!isPanelDone && (
          <StreetView
            gameData={panelGame}
            setGameData={handleGameChange}
            view={view}
            setView={handleViewChange}
            panoElementId={`streetview-${panelGame._id ?? panelIndex}`}
            enableGlobalShortcuts={false}
            getGuessTime={() => (new Date().getTime() - roundStartedAtRef.current) / 1000}
            compactGuessMapIdle
          />
        )}
      </div>

      {panelState === 'cooldown' && (
        <div className="panel-overlay">
          <div className="panel-card">
            <strong>{lastGuess?.timedOut && !lastGuess.timedOutWithGuess ? 'Timed out' : `+${lastGuess?.points ?? 0}`}</strong>
            <span>Next panel round in {cooldownSeconds}s</span>
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
