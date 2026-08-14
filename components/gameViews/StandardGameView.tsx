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
import { mailman, normalizeStreetViewLiveView, showToast } from '@utils/helpers'
import type { StreetViewLiveView } from '@utils/helpers/streetViewLiveView'
import { lastCompletedRoundLocation, resolvePlonkitGuideCountryIso } from '@utils/helpers/resolvePlonkitGuideCountryIso'
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

  const plonkLastRoundIso = useMemo(() => {
    const loc = lastCompletedRoundLocation(gameData)
    return resolvePlonkitGuideCountryIso(gameData.mapId, loc)
  }, [gameData.mapId, gameData.rounds, gameData.guesses])

  const followLiveView = useMemo(
    () => (isSpectator ? normalizeStreetViewLiveView(gameData.liveView) : null),
    [isSpectator, gameData.liveView]
  )

  const onLiveViewChange = useCallback(
    (liveView: StreetViewLiveView) => {
      if (isSpectator || !gameData._id) return
      void mailman(`games/${gameData._id}`, 'PUT', JSON.stringify({ liveView }))
    },
    [gameData._id, isSpectator]
  )

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
      <div className="play-wrapper" style={{ display: view === 'Game' ? 'block' : 'none' }}>
        <StreetView
          gameData={gameData}
          setGameData={setGameData}
          view={view}
          setView={setView}
          isSpectator={isSpectator}
          onLiveViewChange={isSpectator ? undefined : onLiveViewChange}
          followLiveView={followLiveView}
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
              setView={setView}
              plonkitCountryIso={plonkLastRoundIso}
              plonkitMapLabel={gameData.mapDetails?.name}
              nextLabel={isSpectator ? 'Continue watching' : undefined}
            />
          )}

          {view === 'FinalResults' && (
            <StandardFinalResults
              gameData={gameData}
              setGameData={setGameData}
              view={view}
              setView={setView}
              plonkitCountryIso={plonkLastRoundIso}
              plonkitMapLabel={gameData.mapDetails?.name}
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
