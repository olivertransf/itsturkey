import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from 'react'
import Game from '@backend/models/game'
import MultiSession from '@backend/models/multiSession'
import { PageBackLink } from '@components/PageBackLink'
import type { WatcherChip } from '@components/WatchersIndicator'
import { formatLargeNumber, mailman } from '@utils/helpers'
import MultiFinalResults from './MultiFinalResults'
import MultiPanel from './MultiPanel'
import { StyledMultiGameView } from './MultiGameView.Styled'

type Props = {
  session: MultiSession
  panels: Game[]
  isSpectator?: boolean
  watchers?: WatcherChip[]
}

const MultiGameView: FC<Props> = ({ session, panels, isSpectator = false, watchers = [] }) => {
  const [panelGames, setPanelGames] = useState(panels)
  const [playableById, setPlayableById] = useState<Record<string, boolean>>({})
  const [activePanelId, setActivePanelId] = useState<string | null>(
    panels[0]?._id != null ? String(panels[0]._id) : null
  )
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
    if (isSpectator || !allPanelsFinished || session.state === 'finished') {
      return
    }

    void mailman(`multi/${session._id}`, 'PUT', JSON.stringify({ endSession: true }))
  }, [isSpectator, allPanelsFinished, session._id, session.state])

  useEffect(() => {
    if (activePanelId && playableById[activePanelId] !== false) return
    const next = panelGames.find((panel) => {
      const id = String(panel._id ?? '')
      return id && panel.state !== 'finished' && playableById[id] !== false
    })
    if (next?._id) setActivePanelId(String(next._id))
  }, [activePanelId, playableById, panelGames])

  const updatePanelGame = (nextGame: Game) => {
    setPanelGames((currentGames) =>
      currentGames.map((game) => (String(game._id) === String(nextGame._id) ? nextGame : game))
    )
  }

  const reportPlayable = useCallback((panelId: string, playable: boolean) => {
    setPlayableById((current) => (current[panelId] === playable ? current : { ...current, [panelId]: playable }))
  }, [])

  if (allPanelsFinished) {
    return <MultiFinalResults session={{ ...session, state: 'finished' }} panels={panelGames} />
  }

  return (
    <StyledMultiGameView>
      <div className="multi-header">
        <div className="multi-title">
          <PageBackLink href={isSpectator ? '/' : exitHref} label="Exit" compact />
          <div className="multi-title-text">
            <span className="multi-kicker">MultiGuessr</span>
            <h1>{session.mapName || 'World'}</h1>
          </div>
        </div>

        <div className="multi-stats">
          <span>
            <strong>{formatLargeNumber(totalPoints)}</strong> pts
          </span>
          <span>
            {panelsFinished}/{panelGames.length} done
          </span>
          {!isSpectator && watchers.length > 0 ? (
            <span>{watchers.map((w) => w.name).join(', ')} watching</span>
          ) : null}
        </div>
      </div>

      <div className="multi-grid" style={{ '--multi-columns': gridColumns } as CSSProperties}>
        {panelGames.map((panel, index) => {
          const panelId = String(panel._id ?? index)
          return (
            <MultiPanel
              key={panelId}
              game={panel}
              panelIndex={index}
              cooldownSeconds={session.cooldownSeconds}
              onGameChange={updatePanelGame}
              isSpectator={isSpectator}
              isActive={activePanelId === panelId}
              onSelect={() => setActivePanelId(panelId)}
              onPlayableChange={reportPlayable}
            />
          )
        })}
      </div>
    </StyledMultiGameView>
  )
}

export default MultiGameView
