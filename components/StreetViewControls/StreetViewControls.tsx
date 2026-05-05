import { FC, ReactNode, useState } from 'react'
import { Tooltip } from '@components/system'
import { ChevronLeftIcon, FlagIcon, ArrowLeftIcon } from '@heroicons/react/outline'
import { StyledStreetViewControls } from './'

type Props = {
  handleBackToStart: () => void
  handleExitGame: () => void
  handleUndoLastMove?: () => void
  /** Inserted above the flag / start control (e.g. country guide). */
  leadingPrimaryControls?: ReactNode
}

const StreetViewControls: FC<Props> = ({
  handleBackToStart,
  handleExitGame,
  handleUndoLastMove,
  leadingPrimaryControls,
}) => {
  const [showStartTip, setShowStartTip] = useState(false)
  const [showBackTip, setShowBackTip] = useState(false)
  const [showExitTip, setShowExitTip] = useState(false)

  return (
    <StyledStreetViewControls>
      <div className="exit-control" onMouseOver={() => setShowExitTip(true)} onMouseOut={() => setShowExitTip(false)}>
        <button className="control-button" onClick={handleExitGame}>
          <ChevronLeftIcon />
        </button>
        {showExitTip && <Tooltip label="Exit Game" position="right" />}
      </div>

      <div className="primary-controls">
        {leadingPrimaryControls}
        <div className="control-button-wrapper" onMouseOver={() => setShowStartTip(true)} onMouseOut={() => setShowStartTip(false)}>
          <button className="control-button" onClick={handleBackToStart}>
            <FlagIcon />
          </button>
          {showStartTip && <Tooltip label="Back To Start (R)" position="left" />}
        </div>
        {handleUndoLastMove && (
          <div className="control-button-wrapper" onMouseOver={() => setShowBackTip(true)} onMouseOut={() => setShowBackTip(false)}>
            <button className="control-button" onClick={handleUndoLastMove}>
              <ArrowLeftIcon />
            </button>
            {showBackTip && <Tooltip label="Undo Last Move (Z)" position="left" />}
          </div>
        )}
      </div>
    </StyledStreetViewControls>
  )
}

export default StreetViewControls
