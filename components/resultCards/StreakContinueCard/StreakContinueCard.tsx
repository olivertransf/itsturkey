/* eslint-disable @next/next/no-img-element */
import { FC, useEffect, useMemo } from 'react'
import Game from '@backend/models/game'
import { useAppDispatch } from '@redux/hook'
import { updateStartTime } from '@redux/slices'
import { GameViewType } from '@types'
import countries from '@utils/constants/countries'
import { KEY_CODES } from '@utils/constants/keyCodes'
import { StyledStreakContinueCard } from './'
import { getRealCountryCode } from '@utils/helpers/getRealCountryCode'
import { streakFlagImgProps } from '@utils/helpers/streakFlagImgProps'

type Props = {
  gameData: Game
  view: GameViewType
  setView: (view: GameViewType) => void
  nextLabel?: string
  isSpectator?: boolean
}

const StreakContinueCard: FC<Props> = ({ gameData, view, setView, nextLabel = 'Next Round', isSpectator = false }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (view !== 'Result' || isSpectator) return

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

  const handleNextRound = () => {
    if (isSpectator) return
    dispatch(updateStartTime({ startTime: new Date().getTime() }))
    setView('Game')
  }

  const getCorrectCountryCode = () => {
    if (gameData.round < 2) return ''

    const correctCountryCode = gameData.rounds[gameData.round - 2].countryCode

    return getRealCountryCode(correctCountryCode)?.toUpperCase()
  }

  const getCorrectCountryName = () => {
    if (gameData.round < 2) return ''

    const correctCountryCode = gameData.rounds[gameData.round - 2].countryCode
    const correctCountry = countries.find((x) => x.code === getRealCountryCode(correctCountryCode))?.name

    return correctCountry
  }

  const correctLocation = useMemo(() => {
    if (gameData.round < 2) return null
    const loc = gameData.rounds[gameData.round - 2]
    if (loc?.lat == null || loc?.lng == null) return null
    return { lat: loc.lat, lng: loc.lng }
  }, [gameData.round, gameData.rounds])

  return (
    <StyledStreakContinueCard>
      <div className="result-wrapper">
        <div className="correct-country">
          <span>{`The country was indeed ${getCorrectCountryName()}`}</span>
          <img
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${getCorrectCountryCode()}.svg`}
            alt={getCorrectCountryCode()}
            {...streakFlagImgProps(correctLocation)}
          />
        </div>
        <p className="streak-count">
          {`Your streak is now at ${gameData.streak} ${gameData.streak === 1 ? 'country' : 'countries'}`}.
        </p>
      </div>

      {!isSpectator ? (
      <div className="actionButton">
        <button className="next-round-btn" onClick={() => handleNextRound()}>
          {nextLabel}
        </button>
      </div>
      ) : null}
    </StyledStreakContinueCard>
  )
}

export default StreakContinueCard
