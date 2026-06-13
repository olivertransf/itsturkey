import { FC, useMemo } from 'react'
import { PlonkitGuideLauncher } from '@components/PlonkitCountryGuide'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Avatar, Checkbox, Slider, ToggleSwitch } from '@components/system'
import { StyledGameSettingsModal } from '@components/modals/GameSettingsModal'
import { MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { formatTimeLimit } from '@utils/helpers'
import type { GameStartFlowApi } from './useGameStartFlow'

type Props = Omit<GameStartFlowApi, 'primaryAction' | 'cancelAction' | 'footerMeta' | 'isSubmitting'> & {
  hideMapSummary?: boolean
  hideCountryTips?: boolean
  className?: string
}

const ROUNDS_TOGGLE_LABEL = 'Unlimited rounds'

const GameStartPanelContent: FC<Props> = ({
  mapDetails,
  gameMode,
  hideMapSummary,
  hideCountryTips,
  className,
  showDetailedChecked,
  canMove,
  canPan,
  playMode,
  roundCount,
  allowHomeMapPicker,
  mapPickerOptions,
  mapPickerLoading,
  pickMapById,
  setPlayMode,
  setRoundCount,
  setSliderVal,
  setCanMove,
  setCanPan,
  handleCheck,
  sliderVal,
}) => {
  const defaultsLocked = !!showDetailedChecked

  const equitableCountryIso = useMemo(
    () => parseEquitableCountryMapKey(String(mapDetails._id)),
    [mapDetails._id]
  )

  const defaultSettingsLabel = 'Use default round time and movement'

  return (
    <StyledGameSettingsModal className={className}>
      <div className="mainContent">
        <>
          {allowHomeMapPicker && gameMode !== 'streak' && (
            <section className="mapPickerSection" aria-label="Choose map">
              <span className="sectionEyebrow">Map</span>
              <MapPickerGrid
                options={mapPickerOptions}
                value={String(mapDetails._id)}
                onChange={pickMapById}
                loading={mapPickerLoading}
                maxHeight={280}
                showDescriptions={false}
              />
            </section>
          )}

          {!hideMapSummary && (
            <div className="map-details-wrapper map-details-wrapper--compact">
              <Avatar type="map" src={mapDetails.previewImg} size={50} />
              <div className="map-details">
                <span className="map-name">{mapDetails.name}</span>
              </div>
            </div>
          )}

          <section className="gameSettingsUnified" aria-label="Game settings">
            <div className="checkboxWrapper">
              <Checkbox isChecked={defaultsLocked} setChecked={() => handleCheck()} label={defaultSettingsLabel} />
            </div>

            <div className={`controlCard unifiedSettingsCard ${defaultsLocked ? 'settingsControlsMuted' : ''}`}>
              {gameMode === 'streak' ? (
                <>
                  <span className="sectionEyebrow">Rounds</span>
                  <div className="roundsSection">
                    <div className="roundUnlimitedRow">
                      <ToggleSwitch isActive={true} setIsActive={() => undefined} disabled />
                      <span className="roundUnlimitedLabel">{ROUNDS_TOGGLE_LABEL}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="sectionEyebrow">Rounds</span>
                  <div className="roundsSection">
                    <div className="roundUnlimitedRow">
                      <ToggleSwitch
                        isActive={playMode === 'unlimited'}
                        setIsActive={(on) => setPlayMode(on ? 'unlimited' : 'single')}
                        disabled={defaultsLocked}
                      />
                      <span className="roundUnlimitedLabel">{ROUNDS_TOGGLE_LABEL}</span>
                    </div>
                    {playMode === 'single' && (
                      <>
                        <span className="roundTimeLabel">
                          <span className="roundLabelGroup">
                            Count <span className="labelHint">(max {MAX_TOTAL_ROUNDS})</span>
                          </span>
                          <span className="timeLimit">{roundCount}</span>
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
                </>
              )}

              <div className="unifiedSettingsDivider" />

              <span className="roundTimeLabel">
                Round time <span className="timeLimit">{formatTimeLimit(sliderVal * 10)}</span>
              </span>

              <div className="setting-options">
                <div className="time-slider">
                  <Slider value={sliderVal} min={0} max={60} onChange={setSliderVal} disabled={defaultsLocked} />
                </div>

                <div className="movementOptions">
                  <div className="movementOption">
                    <ToggleSwitch isActive={canMove} setIsActive={setCanMove} disabled={defaultsLocked} />
                    <div className="movementOptionLabel">Move</div>
                  </div>

                  <div className="movementOption">
                    <ToggleSwitch isActive={canPan} setIsActive={setCanPan} disabled={defaultsLocked} />
                    <div className="movementOptionLabel">Pan</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!hideCountryTips && equitableCountryIso && gameMode !== 'streak' ? (
            <PlonkitGuideLauncher variant="compact" countryIso={equitableCountryIso} mapLabel={mapDetails.name} />
          ) : null}
        </>
      </div>
    </StyledGameSettingsModal>
  )
}

export default GameStartPanelContent
