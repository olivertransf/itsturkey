import { FC, useCallback, useMemo } from 'react'
import Game from '@backend/models/game'
import { StandardFinalResults, StandardResults } from '@components/resultCards'
import { ResultMap } from '@components/ResultMap'
import { LeaderboardCard } from '@components/Results'
import { StreetView } from '@components/StreetView'
import type { WatcherChip } from '@components/WatchersIndicator'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import { GameViewType, MapType } from '@types'
import { DEFAULT_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { mailman, normalizeStreetViewLiveView, normalizeGuessMapLive, showToast } from '@utils/helpers'
import type { StreetViewLiveView } from '@utils/helpers/streetViewLiveView'
import type { GuessMapLive } from '@utils/helpers/guessMapLive'
import { StyledGameView } from './'

type Props = {
  gameData: Game
  setGameData: (gameData: Game) => void
  view: GameViewType
  setView: (view: GameViewType) => void
  isSpectator?: boolean
  watchers?: WatcherChip[]
}

const RESULT_VIEWS = ['Result', 'FinalResults', 'Leaderboard']

const StandardGameView: FC<Props> = ({
  gameData,
  setGameData,
  view,
  setView,
  isSpectator = false,
  watchers = [],
}) => {
  const totalRounds = gameData.totalRounds ?? gameData.rounds?.length ?? DEFAULT_TOTAL_ROUNDS

  const followLiveView = useMemo(
    () => (isSpectator ? normalizeStreetViewLiveView(gameData.liveView) : null),
    [isSpectator, gameData.liveView]
  )

  const followGuessMapLive = useMemo(
    () => (isSpectator ? normalizeGuessMapLive(gameData.guessMapLive) : null),
    [isSpectator, gameData.guessMapLive]
  )

  const onLiveViewChange = useCallback(
    (liveView: StreetViewLiveView) => {
      if (isSpectator || !gameData._id) return
      void mailman(`games/${gameData._id}`, 'PUT', JSON.stringify({ liveView }))
    },
    [gameData._id, isSpectator]
  )

  const onGuessMapLiveChange = useCallback(
    (guessMapLive: GuessMapLive) => {
      if (isSpectator || !gameData._id) return
      void mailman(`games/${gameData._id}`, 'PUT', JSON.stringify({ guessMapLive }))
    },
    [gameData._id, isSpectator]
  )

  const handleNextFromResult = (next: GameViewType) => {
    if (!isSpectator && gameData._id && next === 'Game') {
      void mailman(`games/${gameData._id}`, 'PUT', JSON.stringify({ playPhase: 'playing' }))
    }
    setView(next)
  }

  const handleEndUnlimitedSession = async () => {
    if (isSpectator) return
    const res = await mailman(`games/${gameData._id}`, 'PUT', JSON.stringify({ endGame: true }))

    if (res.error) {
      showToast('error', res.error.message)
      return
    }

    setGameData({ ...res.game, mapDetails: res.mapDetails, userDetails: gameData.userDetails })
    setView('FinalResults')
  }

  const lastGuess = gameData.guesses[gameData.guesses.length - 1]

  return (
    <StyledGameView>
      <div className="play-wrapper" style={{ display: view === 'Game' ? 'flex' : 'none' }}>
        <StreetView
          gameData={gameData}
          setGameData={setGameData}
          view={view}
          setView={setView}
          isSpectator={isSpectator}
          onLiveViewChange={isSpectator ? undefined : onLiveViewChange}
          followLiveView={followLiveView}
          onGuessMapLiveChange={isSpectator ? undefined : onGuessMapLiveChange}
          followGuessMapLive={followGuessMapLive}
          watchers={isSpectator ? [] : watchers}
        />
      </div>

      <div className="results-wrapper" style={{ display: RESULT_VIEWS.includes(view) ? 'grid' : 'none' }}>
        <ResultMap
          guessedLocations={gameData.guesses}
          actualLocations={gameData.rounds}
          round={gameData.round}
          resetMap={view === 'Result' || view === 'FinalResults'}
          isFinalResults={view === 'FinalResults' || view === 'Leaderboard'}
        />

        <div className="results-card-wrapper">
          {view === 'Result' && lastGuess && (
            <StandardResults
              round={gameData.round}
              totalRounds={totalRounds}
              unlimited={!!gameData.unlimited}
              onEndUnlimitedSession={
                !isSpectator && gameData.unlimited ? handleEndUnlimitedSession : undefined
              }
              distance={lastGuess.distance}
              points={lastGuess.points}
              noGuess={lastGuess.timedOut && !lastGuess.timedOutWithGuess}
              view={view}
              setView={isSpectator ? setView : handleNextFromResult}
              isSpectator={isSpectator}
            />
          )}

          {view === 'FinalResults' && (
            <StandardFinalResults
              gameData={gameData}
              setGameData={setGameData}
              view={view}
              setView={setView}
              isSpectator={isSpectator}
            />
          )}

          {view === 'Leaderboard' && (
            <>
              <LeaderboardCard gameData={[gameData]} mapData={gameData.mapDetails as MapType} />

              <div className="back-btn" onClick={() => setView('FinalResults')}>
                <ChevronLeftIcon />
                <span>Back</span>
              </div>
            </>
          )}
        </div>
      </div>
    </StyledGameView>
  )
}

export default StandardGameView
