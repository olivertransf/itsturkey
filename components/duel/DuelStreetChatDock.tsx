import { FC } from 'react'
import { ChatAlt2Icon } from '@heroicons/react/outline'
import DuelChatPanel from './DuelChatPanel'
import type { DuelChatMessageClient, DuelGuessAvatar, DuelViewerRole } from './duelApiTypes'
import styled from 'styled-components'

const DockRoot = styled.div`
  position: relative;
`

const ChatBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #fde047;
  color: #18181b;
  font-size: 10px;
  font-weight: 800;
  line-height: 16px;
  text-align: center;
  pointer-events: none;
`

/** Fixed to viewport bottom-left beside the control stack. */
const PopoverAnchor = styled.div`
  position: fixed;
  left: calc(max(10px, env(safe-area-inset-left, 0px)) + 66px);
  bottom: max(10px, env(safe-area-inset-bottom, 0px));
  width: min(328px, calc(100vw - 90px));
  height: min(400px, calc(100dvh - 280px));
  min-height: 320px;
  z-index: 28;
  pointer-events: auto;

  @media (max-width: 520px) {
    left: max(10px, env(safe-area-inset-left, 0px));
    width: min(300px, calc(100vw - 20px));
    height: min(360px, calc(100dvh - 300px));
    min-height: 280px;
  }
`

type Props = {
  duelId: string
  messages: DuelChatMessageClient[]
  playerNames: { host: string; guest: string }
  playerAvatars: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  viewerRole: DuelViewerRole
  onRefresh?: () => Promise<void>
  open: boolean
  onToggle: () => void
}

const DuelStreetChatDock: FC<Props> = ({
  duelId,
  messages,
  playerNames,
  playerAvatars,
  viewerRole,
  onRefresh,
  open,
  onToggle,
}) => {
  const count = messages.length

  return (
    <DockRoot className="control-button-wrapper">
      <button
        type="button"
        className="control-button"
        onClick={onToggle}
        aria-label="Duel chat"
        aria-expanded={open}
        title="Duel chat"
      >
        <ChatAlt2Icon />
        {count > 0 && !open ? (
          <ChatBadge aria-hidden>{count > 9 ? '9+' : count}</ChatBadge>
        ) : null}
      </button>

      {open ? (
        <PopoverAnchor>
          <DuelChatPanel
            duelId={duelId}
            messages={messages}
            playerNames={playerNames}
            playerAvatars={playerAvatars}
            viewerRole={viewerRole}
            onRefresh={onRefresh}
            variant="popover"
            open
            onClose={onToggle}
            embedded
          />
        </PopoverAnchor>
      ) : null}
    </DockRoot>
  )
}

export default DuelStreetChatDock
