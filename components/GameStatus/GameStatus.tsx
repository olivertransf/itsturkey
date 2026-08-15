import { FC, useEffect, useState } from 'react'
import { Game } from '@backend/models'
import { LightningBoltIcon } from '@heroicons/react/solid'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { formatLargeNumber, formatStatusTimer } from '@utils/helpers'
import { StyledGameStatus } from './'

type Props = {
  gameData: Game
  handleSubmitGuess: (timedOut?: boolean) => void
  readOnly?: boolean
  compact?: boolean
}

const GameStatus: FC<Props> = ({ gameData, handleSubmitGuess, readOnly = false, compact = false }) => {
  const timeLimit = gameData.gameSettings?.timeLimit
  const hasTimeLimit = gameData.gameSettings.timeLimit !== 0

  const [timeLeft, setTimeLeft] = useState(timeLimit)

  useEffect(() => {
    if (!hasTimeLimit || readOnly) return
    setTimeLeft(timeLimit)
  }, [gameData.round, hasTimeLimit, timeLimit, readOnly])

  useEffect(() => {
    if (!hasTimeLimit || readOnly) return
    if (timeLeft === 0) {
      return handleSubmitGuess(true)
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev as number) - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [hasTimeLimit, timeLeft, readOnly])

  const finiteTotal =
    gameData.mode === 'standard' && !gameData.unlimited
      ? gameData.totalRounds ?? gameData.rounds?.length ?? DEFAULT_TOTAL_ROUNDS
      : null

  if (compact && (!hasTimeLimit || readOnly)) return null

  const renderFullStatus = () => {
    switch (gameData.mode) {
      case 'standard':
        return (
          <>
            <div className="infoSection mapName">
              <div className="label">
                <span>Map</span>
              </div>
              <div className="value">
                <span>{gameData.mapDetails?.name}</span>
              </div>
            </div>

            <div className="infoSection">
              <div className="label">
                <span>Round</span>
              </div>
              <div className="value">
                <span>
                  {finiteTotal != null ? `${gameData.round} / ${finiteTotal}` : `${gameData.round} (∞)`}
                </span>
              </div>
            </div>

            <div className="infoSection">
              <div className="label">
                <span>Points</span>
              </div>
              <div className="value">
                <span>{formatLargeNumber(gameData.totalPoints)}</span>
              </div>
            </div>

            {hasTimeLimit && !readOnly && (
              <div className="infoSection">
                <div className="label">
                  <span>Time</span>
                </div>
                <div className="value time">
                  <span>{formatStatusTimer(timeLeft as number)}</span>
                </div>
              </div>
            )}
          </>
        )
      case 'streak':
        return (
          <>
            <div className="streak-section">
              <LightningBoltIcon />
              {gameData.streak}
            </div>

            {hasTimeLimit && !readOnly && (
              <div className="infoSection">
                <div className="label">
                  <span>Time</span>
                </div>
                <div className="value time">
                  <span>{formatStatusTimer(timeLeft as number)}</span>
                </div>
              </div>
            )}
          </>
        )
      default: {
        const _exhaustive: never = gameData.mode
        return _exhaustive
      }
    }
  }

  return (
    <StyledGameStatus $compact={compact}>
      {compact ? (
        <div className="infoSection">
          <div className="label">
            <span>Time</span>
          </div>
          <div className="value time">
            <span>{formatStatusTimer(timeLeft as number)}</span>
          </div>
        </div>
      ) : (
        renderFullStatus()
      )}
    </StyledGameStatus>
  )
}

export default GameStatus
