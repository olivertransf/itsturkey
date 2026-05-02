import { FC } from 'react'
import { Button } from '@components/system'
import GameStartPanelContent from './GameStartPanelContent'
import { useGameStartFlow } from './useGameStartFlow'
import { StyledMapPlayInline } from './MapPlayInline.Styled'
import type { GameType, MapType } from '@types'

type Props = {
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
}

const MapPlayInline: FC<Props> = ({ mapDetails, gameMode }) => {
  const flow = useGameStartFlow({ mapDetails, gameMode })

  const { primaryAction, cancelAction, footerMeta, isSubmitting, ...panelState } = flow

  return (
    <StyledMapPlayInline>
      <GameStartPanelContent {...panelState} hideMapSummary className="map-play-inline-inner" />

      <div className="map-play-actions">
        {flow.showChallengeView ? (
          <>
            <Button variant="solidGray" size="md" onClick={cancelAction}>
              {footerMeta.cancelLabel}
            </Button>
            <Button size="md" onClick={() => void primaryAction()} isLoading={isSubmitting}>
              {footerMeta.actionLabel}
            </Button>
          </>
        ) : (
          <Button size="md" onClick={() => void primaryAction()} isLoading={isSubmitting}>
            {footerMeta.actionLabel}
          </Button>
        )}
      </div>
    </StyledMapPlayInline>
  )
}

export default MapPlayInline
