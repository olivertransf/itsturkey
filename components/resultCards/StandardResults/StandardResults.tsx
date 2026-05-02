import { FC, useEffect, useState } from 'react'
import { ProgressBar } from '@components/system'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateStartTime } from '@redux/slices'
import { KEY_CODES } from '@utils/constants/keyCodes'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { formatLargeNumber } from '@utils/helpers'
import formatDistance from '@utils/helpers/formatDistance'
import { DistanceType, GameViewType } from '../../../@types'
import { StyledStandardResults } from './'

type Props = {
  round: number
  totalRounds: number
  unlimited?: boolean
  distance: DistanceType
  points: number
  noGuess?: boolean
  view: GameViewType
  setView: (view: GameViewType) => void
  onEndUnlimitedSession?: () => Promise<void>
}

const StandardResults: FC<Props> = ({
  round,
  totalRounds,
  unlimited,
  distance,
  points,
  noGuess,
  view,
  setView,
  onEndUnlimitedSession,
}) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    if (view !== 'Result') return

    document.addEventListener('keydown', handleKeyDown, { once: true })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [view])

  const handleKeyDown = (e: KeyboardEvent) => {
    const actionKeys = [KEY_CODES.SPACE, KEY_CODES.SPACE_IE11, KEY_CODES.ENTER]

    if (actionKeys.includes(e.key)) {
      handleNextRound()
    }
  }

  const effectiveTotal = totalRounds > 0 ? totalRounds : DEFAULT_TOTAL_ROUNDS

  const handleNextRound = () => {
    if (!unlimited && round > effectiveTotal) {
      setView('FinalResults')
    } else {
      dispatch(updateStartTime({ startTime: new Date().getTime() }))
      setView('Game')
    }
  }

  const handleEndSession = async () => {
    if (!onEndUnlimitedSession) return
    setEnding(true)
    try {
      await onEndUnlimitedSession()
    } finally {
      setEnding(false)
    }
  }

  const calculateProgress = () => {
    const progress = (points / 5000) * 100

    return progress
  }

  const nextLabel =
    !unlimited && round > effectiveTotal ? 'View Results' : 'Next Round'

  return (
    <StyledStandardResults>
      <div className="pointsWrapper">{`${formatLargeNumber(points)} Points`}</div>

      <div className="progress-bar">
        <ProgressBar progress={calculateProgress()} />
      </div>

      <div>
        {noGuess ? (
          <span className="noGuessMessage">You did not make a guess this round.</span>
        ) : (
          <span className="distanceMessage">
            Your guess was
            <span className="emphasisText"> {formatDistance(distance, user.distanceUnit)} </span>
            from the correct location
          </span>
        )}
      </div>

      <div className="actionButton">
        <button className="next-round-btn" onClick={() => handleNextRound()}>
          {nextLabel}
        </button>
        {unlimited && onEndUnlimitedSession ? (
          <button
            type="button"
            className="end-session-btn"
            disabled={ending}
            onClick={() => void handleEndSession()}
          >
            {ending ? 'Ending…' : 'End & view results'}
          </button>
        ) : null}
      </div>
    </StyledStandardResults>
  )
}

export default StandardResults
