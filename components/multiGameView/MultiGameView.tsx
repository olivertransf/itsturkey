import { CSSProperties, FC, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Game from '@backend/models/game'
import MultiSession from '@backend/models/multiSession'
import { Button } from '@components/system'
import { formatLargeNumber, mailman } from '@utils/helpers'
import MultiFinalResults from './MultiFinalResults'
import MultiPanel from './MultiPanel'
import { StyledMultiGameView } from './MultiGameView.Styled'

type Props = {
  session: MultiSession
  panels: Game[]
}

const MultiGameView: FC<Props> = ({ session, panels }) => {
  const [panelGames, setPanelGames] = useState(panels)
  const router = useRouter()
  const totalPoints = useMemo(
    () => panelGames.reduce((total, panel) => total + (panel.totalPoints ?? 0), 0),
    [panelGames]
  )
  const panelsFinished = panelGames.filter((panel) => panel.state === 'finished').length
  const allPanelsFinished = panelsFinished === panelGames.length
  const gridColumns = panelGames.length === 1 ? 1 : panelGames.length >= 5 ? 4 : 2
  const exitHref = session.mapId === 'all' ? '/' : `/map/${session.mapId}`

  useEffect(() => {
    setPanelGames(panels)
  }, [panels])

  useEffect(() => {
    if (!allPanelsFinished || session.state === 'finished') {
      return
    }

    void mailman(`multi/${session._id}`, 'PUT', JSON.stringify({ endSession: true }))
  }, [allPanelsFinished, session._id, session.state])

  const updatePanelGame = (nextGame: Game) => {
    setPanelGames((currentGames) =>
      currentGames.map((game) => (String(game._id) === String(nextGame._id) ? nextGame : game))
    )
  }

  if (allPanelsFinished) {
    return <MultiFinalResults session={{ ...session, state: 'finished' }} panels={panelGames} />
  }

  return (
    <StyledMultiGameView>
      <div className="multi-header">
        <div className="multi-title">
          <h1>MultiGuessr</h1>
          <span>{session.mapName}</span>
        </div>

        <div className="multi-stats">
          <span>{formatLargeNumber(totalPoints)} pts</span>
          <span>
            {panelsFinished}/{panelGames.length} done
          </span>
          <Button variant="solidGray" size="sm" onClick={() => router.push(exitHref)}>
            Exit
          </Button>
        </div>
      </div>

      <div className="multi-grid" style={{ '--multi-columns': gridColumns } as CSSProperties}>
        {panelGames.map((panel, index) => (
          <MultiPanel
            key={String(panel._id ?? index)}
            game={panel}
            panelIndex={index}
            cooldownSeconds={session.cooldownSeconds}
            onGameChange={updatePanelGame}
          />
        ))}
      </div>
    </StyledMultiGameView>
  )
}

export default MultiGameView
