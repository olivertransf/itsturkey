import { FC } from 'react'
import { Checkbox, Slider, ToggleSwitch } from '@components/system'
import { StyledGameSettingsModal } from '@components/modals/GameSettingsModal'
import { formatTimeLimit } from '@utils/helpers'

export type LobbyGameSettingsState = {
  defaultsLocked: boolean
  sliderVal: number
  canMove: boolean
  canPan: boolean
}

type Props = LobbyGameSettingsState & {
  onToggleDefaults: () => void
  setSliderVal: (n: number) => void
  setCanMove: (v: boolean) => void
  setCanPan: (v: boolean) => void
  className?: string
}

const DEFAULT_SETTINGS_LABEL = 'Use default round time and movement'

const LobbyGameSettings: FC<Props> = ({
  defaultsLocked,
  onToggleDefaults,
  sliderVal,
  setSliderVal,
  canMove,
  canPan,
  setCanMove,
  setCanPan,
  className,
}) => {
  return (
    <StyledGameSettingsModal className={['lobby-game-settings-inner', className].filter(Boolean).join(' ')}>
      <div className="mainContent">
        <section className="settingsWrapper" aria-label="Time and movement">
          <div className="checkboxWrapper">
            <Checkbox isChecked={defaultsLocked} setChecked={() => onToggleDefaults()} label={DEFAULT_SETTINGS_LABEL} />
          </div>

          <div className={`controlCard detailedSettings ${defaultsLocked ? 'settingsControlsMuted' : ''}`}>
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
      </div>
    </StyledGameSettingsModal>
  )
}

export default LobbyGameSettings
