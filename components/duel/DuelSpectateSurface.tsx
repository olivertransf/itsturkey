import type { FC } from 'react'
import DuelPlaySurface from '@components/duel/DuelPlaySurface'
import type { DuelClientPayload } from '@components/duel/duelApiTypes'

type Props = {
  duelId: string
  payload: DuelClientPayload
  onRefresh: () => Promise<void>
}

/** Read-only duel view: Street View + HUD, no guess / lock / forfeit. */
const DuelSpectateSurface: FC<Props> = (props) => (
  <DuelPlaySurface {...props} role="spectator" />
)

export default DuelSpectateSurface
