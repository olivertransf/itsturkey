import { FC, useMemo } from 'react'
import { GameStartPanelContent, useGameStartFlow } from '@components/GameStartForm'
import type { PlayMode } from '@components/GameStartForm'
import { PlonkitCountryGuideInline } from '@components/PlonkitCountryGuide'
import { GameType, MapType } from '@types'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { MainModal } from '../MainModal'

type Props = {
  isOpen: boolean
  closeModal: () => void
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
  initialPlayMode?: PlayMode
  allowHomeMapPicker?: boolean
}

const GameSettingsModal: FC<Props> = ({
  isOpen,
  closeModal,
  mapDetails,
  gameMode,
  initialPlayMode,
  allowHomeMapPicker,
}) => {
  const flow = useGameStartFlow({
    mapDetails,
    gameMode,
    onRequestClose: closeModal,
    initialPlayMode,
    allowHomeMapPicker: Boolean(allowHomeMapPicker && isOpen),
  })

  const { primaryAction, cancelAction, footerMeta, isSubmitting, ...panelState } = flow

  const equitableCountryIso = useMemo(
    () => parseEquitableCountryMapKey(String(mapDetails._id)),
    [mapDetails._id]
  )

  const countryTipsBelowFooter =
    equitableCountryIso && gameMode !== 'streak' && !panelState.showChallengeView ? (
      <PlonkitCountryGuideInline isoCode={equitableCountryIso} mapLabel={mapDetails.name} variant="settings" />
    ) : null

  return (
    <MainModal
      title={footerMeta.title}
      actionButtonText={footerMeta.actionLabel}
      cancelButtonText={footerMeta.cancelLabel}
      isOpen={isOpen}
      onClose={closeModal}
      onCancel={cancelAction}
      onAction={() => void primaryAction()}
      isSubmitting={isSubmitting}
      belowFooter={countryTipsBelowFooter}
    >
      <GameStartPanelContent {...panelState} hideCountryTips={Boolean(countryTipsBelowFooter)} />
    </MainModal>
  )
}

export default GameSettingsModal
