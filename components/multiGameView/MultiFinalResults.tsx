import { FC, useState } from 'react'
import { useRouter } from 'next/router'
import Game from '@backend/models/game'
import MultiSession from '@backend/models/multiSession'
import { Button } from '@components/system'
import { formatLargeNumber, mailman, showToast } from '@utils/helpers'
import { StyledMultiFinalResults } from './MultiGameView.Styled'

type Props = {
  session: MultiSession
  panels: Game[]
}

const MultiFinalResults: FC<Props> = ({ session, panels }) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const totalPoints = panels.reduce((total, panel) => total + (panel.totalPoints ?? 0), 0)
  const exitHref = session.mapId === 'all' ? '/' : `/map/${session.mapId}`

  const playAgain = async () => {
    setIsLoading(true)

    const res = await mailman(
      'multi',
      'POST',
      JSON.stringify({
        mapId: session.mapId,
        mapName: session.mapName,
        gameSettings: panels[0]?.gameSettings,
        panelCount: session.panelCount,
        totalRoundsPerPanel: session.totalRoundsPerPanel,
        perGuessSeconds: session.perGuessSeconds,
      })
    )

    if (res.error) {
      setIsLoading(false)
      showToast('error', res.error.message)
      return
    }

    await router.push(`/multi/${res._id}`)
  }

  return (
    <StyledMultiFinalResults>
      <div className="final-card">
        <div className="total-points">
          <strong>{formatLargeNumber(totalPoints)}</strong>
          <span>Total MultiGuessr Points</span>
        </div>

        <div className="panel-results">
          {panels.map((panel, index) => (
            <div className="panel-result-row" key={String(panel._id ?? index)}>
              <span>Panel {index + 1}</span>
              <span>
                {formatLargeNumber(panel.totalPoints)} pts · {panel.guesses.length} rounds
              </span>
            </div>
          ))}
        </div>

        <div className="final-actions">
          <Button variant="solidGray" onClick={() => router.push(exitHref)}>
            Exit
          </Button>
          <Button onClick={() => playAgain()} isLoading={isLoading}>
            Play Again
          </Button>
        </div>
      </div>
    </StyledMultiFinalResults>
  )
}

export default MultiFinalResults
