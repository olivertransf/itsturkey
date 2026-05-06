import { FC, useMemo } from 'react'
import { GameStartPanelContent, useGameStartFlow } from '@components/GameStartForm'
import type { PlayMode } from '@components/GameStartForm'
import { PlonkitGuideLauncher } from '@components/PlonkitCountryGuide'
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

  const showCountryTips = Boolean(equitableCountryIso && gameMode !== 'streak')

  const countryTipsHeader =
    showCountryTips && equitableCountryIso ? (
      <PlonkitGuideLauncher
        variant="compact"
        countryIso={equitableCountryIso}
        mapLabel={mapDetails.name}
        compactShowLabel={false}
        compactShrinkWrap
      />
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
      headerAccessory={countryTipsHeader}
    >
      <GameStartPanelContent {...panelState} hideCountryTips={showCountryTips} />
    </MainModal>
  )
}

export default GameSettingsModal
