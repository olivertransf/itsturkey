import { FC, useCallback, useMemo } from 'react'
import Game from '@backend/models/game'
import { StreakContinueCard, StreakEndedCard } from '@components/resultCards'
import { StreaksResultMap } from '@components/StreaksResultMap'
import { StreetView } from '@components/StreetView'
import type { WatcherChip } from '@components/WatchersIndicator'
import { GameViewType } from '@types'
import { mailman, normalizeStreetViewLiveView } from '@utils/helpers'
import type { StreetViewLiveView } from '@utils/helpers/streetViewLiveView'
import { StyledGameView } from './'

type Props = {
  gameData: Game
  setGameData: (gameData: Game) => void
  view: GameViewType
  setView: (view: GameViewType) => void
  isSpectator?: boolean
  watchers?: WatcherChip[]
}

const StreakGameView: FC<Props> = ({
  gameData,
  setGameData,
  view,
  setView,
  isSpectator = false,
  watchers = [],
}) => {
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
          watchers={isSpectator ? [] : watchers}
        />
      </div>

      <div
        className="results-wrapper"
        style={{ display: view === 'Result' || view === 'FinalResults' ? 'grid' : 'none' }}
      >
        <StreaksResultMap gameData={gameData} resetMap={view === 'Result' || view === 'FinalResults'} />

        <div className="results-card-wrapper">
          {view === 'Result' && gameData.state === 'started' && (
            <StreakContinueCard
              gameData={gameData}
              view={view}
              setView={setView}
              nextLabel={isSpectator ? 'Continue watching' : undefined}
            />
          )}

          {view === 'Result' && gameData.state === 'finished' && (
            <StreakEndedCard
              gameData={gameData}
              setGameData={setGameData}
              view={view}
              setView={setView}
              isSpectator={isSpectator}
            />
          )}
        </div>
      </div>
    </StyledGameView>
  )
}

export default StreakGameView
