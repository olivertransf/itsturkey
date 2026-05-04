import router from 'next/router'
import { FC, useEffect, useState } from 'react'
import { Game } from '@backend/models'
import { Button, ProgressBar } from '@components/system'
import { ChartPieIcon, MapIcon } from '@heroicons/react/outline'
import { useAppDispatch } from '@redux/hook'
import { updateStartTime } from '@redux/slices'
import { GameViewType } from '@types'
import { KEY_CODES } from '@utils/constants/keyCodes'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { formatLargeNumber, mailman, showToast } from '@utils/helpers'
import { StyledStandardFinalResults } from './'

type Props = {
  gameData: Game
  setGameData: (gameData: any) => void
  view: GameViewType
  setView: (view: GameViewType) => void
}

const StandardFinalResults: FC<Props> = ({ gameData, setGameData, view, setView }) => {
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useAppDispatch()

  const IS_CHALLENGE = !!gameData.challengeId

  useEffect(() => {
    if (view !== 'FinalResults') return

    document.addEventListener('keydown', handleKeyDown, { once: true })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [view])

  const handleKeyDown = async (e: KeyboardEvent) => {
    const actionKeys = [KEY_CODES.SPACE, KEY_CODES.SPACE_IE11, KEY_CODES.ENTER]

    if (actionKeys.includes(e.key)) {
      IS_CHALLENGE ? navigateToResults() : playAgain()
    }
  }

  const totalRounds = gameData.totalRounds ?? gameData.rounds?.length ?? DEFAULT_TOTAL_ROUNDS

  const calculateProgress = () => {
    const roundsPlayed = gameData.guesses?.length ?? 0
    const denom = gameData.unlimited
      ? Math.max(1, roundsPlayed) * 5000
      : Math.max(1, totalRounds) * 5000

    return Math.min(100, (gameData.totalPoints / denom) * 100)
  }

  const playAgain = async () => {
    const newGameData = {
      mapId: gameData.mapId,
      mapName: gameData.mapName,
      gameSettings: gameData.gameSettings,
      mode: gameData.mode,
      ...(gameData.unlimited ? { unlimited: true } : { unlimited: false, totalRounds }),
    }

    // store start time
    dispatch(updateStartTime({ startTime: new Date().getTime() }))

    setIsLoading(true)

    const res = await mailman('games', 'POST', JSON.stringify(newGameData))

    if (res.error) {
      setIsLoading(false)
      return showToast('error', res.error.message)
    }

    setGameData(res)

    router.replace(`/game/${res._id}`, undefined, { shallow: true })
  }

  const navigateToResults = () => {
    const url = IS_CHALLENGE ? `/results/challenge/${gameData.challengeId}` : `/results/${gameData._id}`

    router.push(url)
  }

  const navigateToMapsPage = () => {
    const url = gameData.isDailyChallenge ? '/daily-challenge' : `/map/${gameData.mapId}`

    router.push(url)
  }

  return (
    <StyledStandardFinalResults>
      <div className="results-card">
        <div className="pointsWrapper">
          <span>{formatLargeNumber(gameData.totalPoints)}</span> Total Points
        </div>

        <div className="progress-bar">
          <ProgressBar progress={calculateProgress()} />
        </div>

        {IS_CHALLENGE ? (
          <div className="buttons-wrapper">
            <div className="side-button">
              <Button className="play-again-btn" onClick={() => navigateToResults()}>
                Breakdown
              </Button>

              <span>View the leaderboard</span>
            </div>

            <div className="side-button">
              <button className="map-btn" onClick={() => navigateToMapsPage()}>
                <MapIcon />
              </button>
              <span>Exit</span>
            </div>
          </div>
        ) : (
          <div className="buttons-wrapper">
            <div className="side-button">
              <button className="results-btn" onClick={() => setView('Leaderboard')}>
                <ChartPieIcon />
              </button>
              <span>Breakdown</span>
            </div>

            <div className="side-button">
              <Button className="play-again-btn" onClick={() => playAgain()} isLoading={isLoading} spinnerSize={24}>
                Play Again
              </Button>

              <span>New Game, Same Map</span>
            </div>

            <div className="side-button">
              <button className="map-btn" onClick={() => navigateToMapsPage()}>
                <MapIcon />
              </button>
              <span>Exit</span>
            </div>
          </div>
        )}
      </div>
    </StyledStandardFinalResults>
  )
}

export default StandardFinalResults
