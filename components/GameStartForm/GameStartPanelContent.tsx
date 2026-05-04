import { FC, useMemo } from 'react'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Avatar, Checkbox, Slider, ToggleSwitch } from '@components/system'
import { TextWithLinks } from '@components/TextWithLinks'
import { LightningBoltIcon, UserGroupIcon, UserIcon, ViewGridIcon } from '@heroicons/react/outline'
import { StyledGameSettingsModal } from '@components/modals/GameSettingsModal'
import { Challenge } from '@components/modals/GameSettingsModal/Challenge'
import {
  DEFAULT_TOTAL_ROUNDS,
  MAX_MULTI_PANELS,
  MAX_MULTI_PER_GUESS_SECONDS,
  MAX_TOTAL_ROUNDS,
  MIN_MULTI_PER_GUESS_SECONDS,
} from '@utils/constants/gameModes'
import { formatTimeLimit } from '@utils/helpers'
import type { GameStartFlowApi } from './useGameStartFlow'

type Props = Omit<GameStartFlowApi, 'primaryAction' | 'cancelAction' | 'footerMeta' | 'isSubmitting'> & {
  hideMapSummary?: boolean
  className?: string
}

const GameStartPanelContent: FC<Props> = ({
  mapDetails,
  gameMode,
  hideMapSummary,
  className,
  showDetailedChecked,
  canMove,
  canZoom,
  playMode,
  roundCount,
  panelCount,
  perGuessSeconds,
  showChallengeView,
  sliderVal,
  challengeId,
  allowHomeMapPicker,
  mapPickerOptions,
  mapPickerLoading,
  pickMapById,
  setPlayMode,
  setRoundCount,
  setPanelCount,
  setPerGuessSeconds,
  setSliderVal,
  setCanMove,
  setCanZoom,
  handleCheck,
}) => {
  const defaultsLocked = !!showDetailedChecked

  const defaultSettingsLabel = useMemo(() => {
    if (playMode === 'multi') {
      return `Default Settings: ${DEFAULT_TOTAL_ROUNDS} rounds per panel, ${panelCount} panels`
    }

    if (playMode === 'unlimited') {
      return 'Default Settings: No time limit, moving allowed'
    }

    return `Default Settings: ${DEFAULT_TOTAL_ROUNDS} rounds, no time limit, moving allowed`
  }, [panelCount, playMode])

  return (
    <StyledGameSettingsModal className={className}>
      <div className="mainContent">
        {showChallengeView ? (
          <Challenge challengeId={challengeId} />
        ) : (
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
                />
              </section>
            )}

            {!hideMapSummary && (
              <div className="map-details-wrapper">
                <Avatar type="map" src={mapDetails.previewImg} size={50} />
                <div className="map-details">
                  <span className="map-name">{mapDetails.name}</span>
                  <span className="map-description">
                    <TextWithLinks>{mapDetails.description}</TextWithLinks>
                  </span>
                </div>
              </div>
            )}

            {gameMode === 'streak' ? (
              <section className="playModeSection" aria-label="Country streak rounds">
                <span className="sectionEyebrow">Rounds</span>
                <p className="unlimitedHint">
                  Country Streak always uses <strong>unlimited rounds</strong> — keep going until you miss a country or
                  exit the game.
                </p>
              </section>
            ) : (
              <>
                <section className="playModeSection" aria-label="Game mode">
                  <span className="sectionEyebrow">Game mode</span>
                  <div className="toggleBar nWay" role="tablist">
                    <div
                      role="tab"
                      aria-selected={playMode === 'single'}
                      className={`toggleItemWrapper ${playMode === 'single' ? 'active' : ''}`}
                      onClick={() => setPlayMode('single')}
                    >
                      <div className="toggle-item">
                        <div className="toggleIcon">
                          <UserIcon />
                        </div>
                        <span className="toggleText">Single</span>
                      </div>
                    </div>

                    <div
                      role="tab"
                      aria-selected={playMode === 'unlimited'}
                      className={`toggleItemWrapper ${playMode === 'unlimited' ? 'active' : ''}`}
                      onClick={() => setPlayMode('unlimited')}
                    >
                      <div className="toggle-item">
                        <div className="toggleIcon">
                          <LightningBoltIcon />
                        </div>
                        <span className="toggleText">Unlimited</span>
                      </div>
                    </div>

                    <div
                      role="tab"
                      aria-selected={playMode === 'multiplayer'}
                      className={`toggleItemWrapper ${playMode === 'multiplayer' ? 'active' : ''}`}
                      onClick={() => setPlayMode('multiplayer')}
                    >
                      <div className="toggle-item">
                        <div className="toggleIcon">
                          <UserGroupIcon />
                        </div>
                        <span className="toggleText">Multiplayer</span>
                      </div>
                    </div>

                    <div
                      role="tab"
                      aria-selected={playMode === 'multi'}
                      className={`toggleItemWrapper ${playMode === 'multi' ? 'active' : ''}`}
                      onClick={() => setPlayMode('multi')}
                    >
                      <div className="toggle-item">
                        <div className="toggleIcon">
                          <ViewGridIcon />
                        </div>
                        <span className="toggleText">MultiGuessr</span>
                      </div>
                    </div>
                  </div>
                </section>

                {playMode === 'unlimited' && (
                  <p className="unlimitedHint">
                    Play continues until you choose <strong>End &amp; view results</strong> on the round summary
                    screen.
                  </p>
                )}
              </>
            )}

            <section className="settingsWrapper" aria-label="Round and movement settings">
              <div className="checkboxWrapper">
                <Checkbox isChecked={defaultsLocked} setChecked={() => handleCheck()} label={defaultSettingsLabel} />
              </div>

              {gameMode !== 'streak' && (playMode === 'single' || playMode === 'multiplayer' || playMode === 'multi') && (
                <div className={`controlCard roundsSection ${defaultsLocked ? 'settingsControlsMuted' : ''}`}>
                  <span className="roundTimeLabel">
                    <span className="roundLabelGroup">
                      {playMode === 'multi' ? 'Rounds per panel' : 'Rounds'}{' '}
                      <span className="labelHint">(max {MAX_TOTAL_ROUNDS})</span>
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
                </div>
              )}

              {gameMode !== 'streak' && playMode === 'multi' && (
                <>
                  <div className={`controlCard roundsSection ${defaultsLocked ? 'settingsControlsMuted' : ''}`}>
                    <span className="roundTimeLabel">
                      <span className="roundLabelGroup">
                        Panels <span className="labelHint">(max {MAX_MULTI_PANELS})</span>
                      </span>
                      <span className="timeLimit">{panelCount}</span>
                    </span>
                    <div className="time-slider">
                      <Slider
                        value={panelCount}
                        min={1}
                        max={MAX_MULTI_PANELS}
                        onChange={setPanelCount}
                        disabled={defaultsLocked}
                      />
                    </div>
                  </div>

                  <div className={`controlCard roundsSection ${defaultsLocked ? 'settingsControlsMuted' : ''}`}>
                    <span className="roundTimeLabel">
                      <span className="roundLabelGroup">
                        Seconds per guess{' '}
                        <span className="labelHint">
                          ({MIN_MULTI_PER_GUESS_SECONDS}-{MAX_MULTI_PER_GUESS_SECONDS})
                        </span>
                      </span>
                      <span className="timeLimit">{formatTimeLimit(perGuessSeconds)}</span>
                    </span>
                    <div className="time-slider">
                      <Slider
                        value={perGuessSeconds}
                        min={MIN_MULTI_PER_GUESS_SECONDS}
                        max={MAX_MULTI_PER_GUESS_SECONDS}
                        onChange={setPerGuessSeconds}
                        disabled={defaultsLocked}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={`controlCard detailedSettings ${defaultsLocked ? 'settingsControlsMuted' : ''}`}>
                {playMode === 'multi' ? (
                  <span className="roundTimeLabel">Movement</span>
                ) : (
                  <span className="roundTimeLabel">
                    Round time <span className="timeLimit">{formatTimeLimit(sliderVal * 10)}</span>
                  </span>
                )}

                <div className="setting-options">
                  {playMode !== 'multi' && (
                    <div className="time-slider">
                      <Slider value={sliderVal} min={0} max={60} onChange={setSliderVal} disabled={defaultsLocked} />
                    </div>
                  )}

                  <div className="movementOptions">
                    <div className="movementOption">
                      <ToggleSwitch
                        isActive={canMove}
                        setIsActive={setCanMove}
                        disabled={defaultsLocked}
                      />
                      <div className="movementOptionLabel">Move</div>
                    </div>

                    <div className="movementOption">
                      <ToggleSwitch
                        isActive={canZoom}
                        setIsActive={setCanZoom}
                        disabled={defaultsLocked}
                      />
                      <div className="movementOptionLabel">Zoom</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </StyledGameSettingsModal>
  )
}

export default GameStartPanelContent
