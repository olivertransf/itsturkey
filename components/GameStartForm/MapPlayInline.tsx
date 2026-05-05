import { FC, useMemo } from 'react'
import { Button } from '@components/system'
import { PlonkitCountryGuideInline } from '@components/PlonkitCountryGuide'
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

  const { primaryAction, cancelAction, footerMeta, isSubmitting, ...panelState } = flow

  const equitableCountryIso = useMemo(
    () => parseEquitableCountryMapKey(String(mapDetails._id)),
    [mapDetails._id]
  )

  const countryTipsBelowActions =
    equitableCountryIso && gameMode !== 'streak' && !panelState.showChallengeView ? (
      <PlonkitCountryGuideInline isoCode={equitableCountryIso} mapLabel={mapDetails.name} variant="settings" />
    ) : null

  return (
    <StyledMapPlayInline>
      <GameStartPanelContent
        {...panelState}
        hideMapSummary
        hideCountryTips={Boolean(countryTipsBelowActions)}
        className="map-play-inline-inner"
      />

      <div className="map-play-actions">
        {panelState.showChallengeView ? (
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

      {countryTipsBelowActions}
    </StyledMapPlayInline>
  )
}

export default MapPlayInline
