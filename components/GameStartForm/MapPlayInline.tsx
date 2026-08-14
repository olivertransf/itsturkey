import { FC, useMemo } from 'react'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import VisualRestrictionsPanel from './VisualRestrictionsPanel'
import { Button, Slider, ToggleSwitch } from '@components/system'
import { PlonkitGuideLauncher } from '@components/PlonkitCountryGuide'
import { StyledGameSettingsModal } from '@components/modals/GameSettingsModal'
import { useGameStartFlow } from './useGameStartFlow'
import { StyledMapPlayInline } from './MapPlayInline.Styled'
import type { GameType, MapType } from '@types'
import { MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

type Props = {
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
}

const MapPlayInline: FC<Props> = ({ mapDetails, gameMode }) => {
  const flow = useGameStartFlow({ mapDetails, gameMode })

  const {
    primaryAction,
    footerMeta,
    isSubmitting,
    showDetailedChecked,
    canMove,
    canPan,
    canZoom,
    playMode,
    roundCount,
    sliderVal,
    visualRestrictions,
    setPlayMode,
    setRoundCount,
    setSliderVal,
    setCanMove,
    setCanPan,
    setCanZoom,
    setVisualRestrictions,
    handleCheck,
  } = flow

  const equitableCountryIso = useMemo(
    () => parseEquitableCountryMapKey(String(mapDetails._id)),
    [mapDetails._id]
  )

  const defaultsLocked = !!showDetailedChecked

  return (
    <StyledMapPlayInline>
      {gameMode !== 'streak' ? (
        <div className="play-block">
          <h2 className="play-heading">Rounds</h2>
          <StyledGameSettingsModal className="lobby-game-settings-inner">
            <div className="mainContent">
              <div className="roundsSection">
                <div className="roundUnlimitedRow">
                  <ToggleSwitch
                    isActive={playMode === 'unlimited'}
                    setIsActive={(on) => setPlayMode(on ? 'unlimited' : 'single')}
                    disabled={defaultsLocked}
                  />
                  <span className="roundUnlimitedLabel">Unlimited</span>
                </div>
                {playMode === 'single' && (
                  <>
                    <span className="roundTimeLabel">
                      <span className="roundLabelGroup">Count</span>
                      <span className="timeLimit">
                        {roundCount}
                        <span className="labelHint"> / {MAX_TOTAL_ROUNDS}</span>
                      </span>
                    </span>
                    <div className="time-slider">
                      <Slider
                        value={roundCount}
                        min={1}
                        max={MAX_TOTAL_ROUNDS}
                        onChange={setRoundCount}
                        disabled={defaultsLocked}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </StyledGameSettingsModal>
        </div>
      ) : null}

      <div className="play-block">
        <h2 className="play-heading">Time & movement</h2>
        <LobbyGameSettings
          defaultsLocked={defaultsLocked}
          onToggleDefaults={handleCheck}
          sliderVal={sliderVal}
          setSliderVal={setSliderVal}
          canMove={canMove}
          canPan={canPan}
          canZoom={canZoom}
          setCanMove={setCanMove}
          setCanPan={setCanPan}
          setCanZoom={setCanZoom}
          visualRestrictions={visualRestrictions}
          setVisualRestrictions={setVisualRestrictions}
          hideVisualRestrictions
        />
      </div>

      <div className="play-block">
        <h2 className="play-heading">Filters</h2>
        <VisualRestrictionsPanel value={visualRestrictions} onChange={setVisualRestrictions} embedded />
      </div>

      {equitableCountryIso && gameMode !== 'streak' ? (
        <PlonkitGuideLauncher
          variant="compact"
          countryIso={equitableCountryIso}
          mapLabel={mapDetails.name}
          compactAlign="start"
        />
      ) : null}

      <Button
        variant="primary"
        width="100%"
        onClick={() => void primaryAction()}
        isLoading={isSubmitting}
      >
        {footerMeta.actionLabel}
      </Button>
    </StyledMapPlayInline>
  )
}

export default MapPlayInline
