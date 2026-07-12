import { FC, useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
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

const PopoverAnchor = styled.div<{ $w: number; $h: number }>`
  position: fixed;
  left: calc(max(10px, env(safe-area-inset-left, 0px)) + 66px);
  bottom: max(10px, env(safe-area-inset-bottom, 0px));
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  z-index: 28;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  min-width: 260px;
  min-height: 240px;
  max-width: min(480px, calc(100vw - 90px));
  max-height: min(640px, calc(100dvh - 120px));

  @media (max-width: 520px) {
    left: max(10px, env(safe-area-inset-left, 0px));
    max-width: calc(100vw - 20px);
  }
`

const ResizeHandle = styled.div`
  position: absolute;
  right: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  cursor: nwse-resize;
  z-index: 2;
  border-radius: 6px;
  background:
    linear-gradient(135deg, transparent 45%, rgba(255, 255, 255, 0.35) 46%, rgba(255, 255, 255, 0.35) 54%, transparent 55%),
    linear-gradient(135deg, transparent 60%, rgba(255, 255, 255, 0.22) 61%, rgba(255, 255, 255, 0.22) 69%, transparent 70%);
  opacity: 0.7;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.06);
  }
`

const CHAT_SIZE_KEY = 'duel-street-chat-size'

type ChatSize = { w: number; h: number }

const DEFAULT_SIZE: ChatSize = { w: 328, h: 400 }

function readStoredSize(): ChatSize {
  if (typeof window === 'undefined') return DEFAULT_SIZE
  try {
    const raw = localStorage.getItem(CHAT_SIZE_KEY)
    if (!raw) return DEFAULT_SIZE
    const parsed = JSON.parse(raw) as Partial<ChatSize>
    const w = typeof parsed.w === 'number' ? parsed.w : DEFAULT_SIZE.w
    const h = typeof parsed.h === 'number' ? parsed.h : DEFAULT_SIZE.h
    return {
      w: Math.min(480, Math.max(260, w)),
      h: Math.min(640, Math.max(240, h)),
    }
  } catch {
    return DEFAULT_SIZE
  }
}

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
  const [size, setSize] = useState<ChatSize>(DEFAULT_SIZE)
  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(
    null
  )

  useEffect(() => {
    setSize(readStoredSize())
  }, [])

  const onResizePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: size.w,
        startH: size.h,
      }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [size.h, size.w]
  )

  const onResizePointerMove = useCallback((e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    // Grow up/right from bottom-left anchored panel: drag handle is top-right.
    const nextW = Math.min(480, Math.max(260, drag.startW + (e.clientX - drag.startX)))
    const nextH = Math.min(640, Math.max(240, drag.startH - (e.clientY - drag.startY)))
    setSize({ w: nextW, h: nextH })
  }, [])

  const onResizePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragRef.current) return
      dragRef.current = null
      try {
        localStorage.setItem(CHAT_SIZE_KEY, JSON.stringify(size))
      } catch {
        /* ignore */
      }
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    },
    [size]
  )

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
        <PopoverAnchor $w={size.w} $h={size.h}>
          <ResizeHandle
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize chat"
            title="Drag to resize"
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          />
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
