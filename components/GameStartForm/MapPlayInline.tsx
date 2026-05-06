import { FC, useMemo } from 'react'
import { Button } from '@components/system'
import { PlonkitGuideLauncher } from '@components/PlonkitCountryGuide'
import GameStartPanelContent from './GameStartPanelContent'
import { useGameStartFlow } from './useGameStartFlow'
import { StyledMapPlayInline } from './MapPlayInline.Styled'
import type { GameType, MapType } from '@types'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

type Props = {
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
}

const MapPlayInline: FC<Props> = ({ mapDetails, gameMode }) => {
  const flow = useGameStartFlow({ mapDetails, gameMode })

  const { primaryAction, footerMeta, isSubmitting, ...panelState } = flow

  const equitableCountryIso = useMemo(
    () => parseEquitableCountryMapKey(String(mapDetails._id)),
    [mapDetails._id]
  )

  const countryTipsRow =
    equitableCountryIso && gameMode !== 'streak' ? (
      <PlonkitGuideLauncher
        variant="compact"
        countryIso={equitableCountryIso}
        mapLabel={mapDetails.name}
        compactAlign="start"
      />
    ) : null

  return (
    <StyledMapPlayInline>
      <GameStartPanelContent
        {...panelState}
        hideMapSummary
        hideCountryTips={Boolean(countryTipsRow)}
        className="map-play-inline-inner"
      />

      <div className="map-play-actions">
        <div className="map-play-actions-lead">{countryTipsRow}</div>
        <div className="map-play-actions-buttons">
          <Button size="md" onClick={() => void primaryAction()} isLoading={isSubmitting}>
            {footerMeta.actionLabel}
          </Button>
        </div>
      </div>
    </StyledMapPlayInline>
  )
}

export default MapPlayInline
