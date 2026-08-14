import type { VisualRestrictions } from '@utils/constants/visualRestrictions'

type GameSettings = {
  timeLimit: number
  canMove: boolean
  canPan: boolean
  canZoom: boolean
  /** Optional wacky Street View filters / transforms. */
  visualRestrictions?: VisualRestrictions
}

export default GameSettings
