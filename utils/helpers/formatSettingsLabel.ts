import { GameSettingsType } from '../../@types'
import formatTimeLimit from './formatTimeLimit'
import { isPanZoomEnabled } from '@utils/constants/googleMapOptions'

// Returns a formatted string containing info about the game settings
const formatSettingsLabel = (settings: GameSettingsType) => {
  const { timeLimit, canMove } = settings
  const panEnabled = isPanZoomEnabled(settings)

  // If settings are default
  if (timeLimit === 0 && canMove && panEnabled) {
    return 'Default Settings'
  }

  const time = timeLimit === 0 ? 'No time limit' : `${formatTimeLimit(timeLimit)} per round`

  return `${time} ${!canMove ? '- No move' : ''} ${!panEnabled ? '- No pan' : ''}`
}

export default formatSettingsLabel
