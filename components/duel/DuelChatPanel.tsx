import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, ChatAlt2Icon, PaperAirplaneIcon, XIcon } from '@heroicons/react/outline'
import { Button } from '@components/system'
import type { DuelChatMessageClient, DuelGuessAvatar, DuelViewerRole } from '@components/duel/duelApiTypes'
import { DUEL_GUESS_MARKER_FALLBACK } from '@components/duel/duelApiTypes'
import { duelHudAvatarIcon } from '@components/duel/duelHudAvatar'
import { MAX_DUEL_CHAT_TEXT } from '@utils/constants/duelChat'
import { mailman, showToast } from '@utils/helpers'
import { duelPrivateChannel } from '@utils/pusherChannels'
import { usePusherSubscription } from '@utils/usePusherSubscription'
import styled, { css } from 'styled-components'

const Root = styled.div<{ $embedded?: boolean; $sidebar?: boolean; $popover?: boolean }>`
  margin-top: ${({ $embedded, $sidebar, $popover }) => ($embedded || $sidebar || $popover ? 0 : 12)};
  border-radius: ${({ $popover }) => ($popover ? '16px' : '14px')};
  background: ${({ $popover }) => ($popover ? 'rgba(12, 14, 18, 0.94)' : 'var(--bg-surface)')};
  border: ${({ $popover }) =>
    $popover ? '1px solid rgba(255, 255, 255, 0.1)' : 'var(--border-default)'};
  overflow: hidden;
  box-sizing: border-box;
  display: ${({ $sidebar, $popover }) => ($sidebar || $popover ? 'flex' : 'block')};
  flex-direction: ${({ $sidebar, $popover }) => ($sidebar || $popover ? 'column' : 'initial')};
  min-height: ${({ $sidebar, $popover }) =>
    $popover ? '0' : $sidebar ? 'min(480px, 58vh)' : 'auto'};
  height: ${({ $sidebar, $popover }) => ($sidebar || $popover ? '100%' : 'auto')};
  box-shadow: ${({ $popover }) => ($popover ? '0 16px 40px rgba(0, 0, 0, 0.5)' : 'none')};
  backdrop-filter: ${({ $popover }) => ($popover ? 'blur(14px) saturate(140%)' : 'none')};
`

const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #e4e4e7;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
`

const PopoverClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: rgba(228, 228, 231, 0.85);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #e4e4e7;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
`

const Toggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border: none;
  background: transparent;
  color: #e4e4e7;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  svg.chevron {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #a1a1aa;
    transition: transform 0.15s ease;
  }
`

const Body = styled.div<{ $sidebar?: boolean; $popover?: boolean }>`
  border-top: ${({ $sidebar, $popover }) =>
    $sidebar || $popover ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'};
  display: flex;
  flex-direction: column;
  flex: ${({ $sidebar, $popover }) => ($sidebar || $popover ? '1 1 auto' : '0 1 auto')};
  min-height: ${({ $sidebar, $popover }) => ($sidebar || $popover ? '0' : 'auto')};
  max-height: ${({ $sidebar, $popover }) =>
    $sidebar || $popover ? 'none' : 'min(280px, 42vh)'};
`

const MessageList = styled.div<{ $popover?: boolean }>`
  flex: 1 1 auto;
  overflow-y: auto;
  padding: ${({ $popover }) => ($popover ? '14px 12px' : '10px 12px')};
  display: flex;
  flex-direction: column;
  gap: ${({ $popover }) => ($popover ? '12px' : '8px')};
  min-height: ${({ $popover }) => ($popover ? '0' : '72px')};
`

const EmptyHint = styled.p`
  margin: 0;
  padding: 8px 4px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(161, 161, 170, 0.95);
  text-align: center;
`

const MessageRow = styled.div<{ $isYou?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-direction: ${({ $isYou }) => ($isYou ? 'row-reverse' : 'row')};
`

const MessageBubble = styled.div<{ $isYou?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 88%;
  padding: 8px 10px;
  border-radius: ${({ $isYou }) => ($isYou ? '12px 12px 4px 12px' : '12px 12px 12px 4px')};
  ${({ $isYou }) =>
    $isYou
      ? css`
          background: rgba(110, 178, 232, 0.16);
          border: 1px solid rgba(157, 200, 240, 0.24);
        `
      : css`
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        `}
`

const MessageMeta = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: rgba(228, 228, 231, 0.82);
  letter-spacing: 0.01em;
  line-height: 1.2;
`

const MessageText = styled.span`
  font-size: 13px;
  line-height: 1.45;
  color: #f4f4f5;
  word-break: break-word;
`

const Composer = styled.form<{ $popover?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: ${({ $popover }) => ($popover ? '10px 12px 12px' : '10px 12px')};
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
`

const ComposerInput = styled.textarea`
  flex: 1;
  min-height: 36px;
  max-height: 88px;
  resize: none;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f4f4f5;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.4;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(157, 200, 240, 0.5);
    outline: none;
  }
`

const CharCount = styled.span`
  font-size: 10px;
  color: rgba(161, 161, 170, 0.9);
  align-self: center;
  flex-shrink: 0;
`

type Props = {
  duelId: string
  messages: DuelChatMessageClient[]
  playerNames: { host: string; guest: string }
  playerAvatars?: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  viewerRole: DuelViewerRole
  onMessagesChange?: (messages: DuelChatMessageClient[]) => void
  onRefresh?: () => Promise<void>
  defaultOpen?: boolean
  embedded?: boolean
  /** Always-visible panel for duel lobby sidebar. */
  variant?: 'collapsible' | 'sidebar' | 'popover'
  /** Popover visibility (parent-controlled). */
  open?: boolean
  onClose?: () => void
}

const DuelChatPanel: FC<Props> = ({
  duelId,
  messages,
  playerNames,
  playerAvatars,
  viewerRole,
  onMessagesChange,
  onRefresh,
  defaultOpen = false,
  embedded = false,
  variant = 'collapsible',
  open: openControlled,
  onClose,
}) => {
  const sidebar = variant === 'sidebar'
  const popover = variant === 'popover'
  const [openInternal, setOpenInternal] = useState(defaultOpen || sidebar)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)
  const listRef = useRef<HTMLDivElement | null>(null)

  const canSend = viewerRole === 'host' || viewerRole === 'guest'
  const pushChannel =
    viewerRole === 'host' || viewerRole === 'guest' || viewerRole === 'spectator'
      ? duelPrivateChannel(duelId)
      : null

  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  const open = popover ? openControlled !== false : openInternal

  useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [open, localMessages.length])

  const appendMessage = useCallback(
    (message: DuelChatMessageClient) => {
      setLocalMessages((prev) => {
        const next = [...prev, message]
        onMessagesChange?.(next)
        return next
      })
    },
    [onMessagesChange]
  )

  usePusherSubscription(
    pushChannel,
    'duel.chat',
    (payload: unknown) => {
      const data = payload as { message?: DuelChatMessageClient }
      const msg = data?.message
      if (!msg || typeof msg.text !== 'string') return
      appendMessage(msg)
    },
    !!pushChannel
  )

  const senderLabel = (role: 'host' | 'guest') =>
    role === 'host' ? playerNames.host : playerNames.guest

  const senderAvatar = (role: 'host' | 'guest'): DuelGuessAvatar =>
    playerAvatars?.[role] ?? DUEL_GUESS_MARKER_FALLBACK

  const isMessageFromYou = (role: 'host' | 'guest') => viewerRole === role

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !canSend || sending) return

    setSending(true)
    try {
      const res = await mailman(`duels/${duelId}/chat`, 'POST', JSON.stringify({ text }))
      if (res?.error) {
        showToast('error', res.error.message)
        return
      }
      setDraft('')
      if (Array.isArray(res?.chatMessages)) {
        setLocalMessages(res.chatMessages)
        onMessagesChange?.(res.chatMessages)
      } else if (onRefresh) {
        await onRefresh()
      }
    } finally {
      setSending(false)
    }
  }

  const panelOpen = sidebar || popover || openInternal

  if (popover && openControlled === false) {
    return null
  }

  return (
    <Root $embedded={embedded} $sidebar={sidebar} $popover={popover}>
      {sidebar ? (
        <SidebarHeader>
          <ChatAlt2Icon style={{ width: 16, height: 16, opacity: 0.85 }} />
          Lobby chat
          {localMessages.length > 0 ? (
            <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.72 }}>({localMessages.length})</span>
          ) : null}
        </SidebarHeader>
      ) : popover ? (
        <PopoverHeader>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ChatAlt2Icon style={{ width: 16, height: 16, opacity: 0.85 }} />
            Duel chat
          </span>
          <PopoverClose type="button" aria-label="Close chat" onClick={() => onClose?.()}>
            <XIcon />
          </PopoverClose>
        </PopoverHeader>
      ) : (
        <Toggle type="button" onClick={() => setOpenInternal((o) => !o)} aria-expanded={openInternal}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ChatAlt2Icon style={{ width: 16, height: 16, opacity: 0.85 }} />
            Duel chat
            {localMessages.length > 0 ? (
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.72 }}>({localMessages.length})</span>
            ) : null}
          </span>
          <ChevronDownIcon
            className="chevron"
            style={{ transform: openInternal ? 'rotate(180deg)' : undefined }}
          />
        </Toggle>
      )}

      {panelOpen && (
        <Body $sidebar={sidebar} $popover={popover}>
          <MessageList ref={listRef} $popover={popover}>
            {localMessages.length === 0 ? (
              <EmptyHint>
                {canSend ? 'Say hi to your opponent.' : 'Players can chat here during the duel.'}
              </EmptyHint>
            ) : (
              localMessages.map((m, idx) => {
                const isYou = isMessageFromYou(m.senderRole)
                const avatar = senderAvatar(m.senderRole)
                return (
                  <MessageRow key={`${m.createdAt}-${idx}`} $isYou={isYou}>
                    {playerAvatars ? duelHudAvatarIcon(avatar, 'xs') : null}
                    <MessageBubble $isYou={isYou}>
                      <MessageMeta>{senderLabel(m.senderRole)}</MessageMeta>
                      <MessageText>{m.text}</MessageText>
                    </MessageBubble>
                  </MessageRow>
                )
              })
            )}
          </MessageList>

          {canSend ? (
            <Composer $popover={popover} onSubmit={(e) => void handleSubmit(e)}>
              <ComposerInput
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_DUEL_CHAT_TEXT))}
                placeholder="Message…"
                maxLength={MAX_DUEL_CHAT_TEXT}
                rows={popover ? 2 : 1}
                aria-label="Duel chat message"
              />
              {!popover ? (
                <CharCount>
                  {draft.length}/{MAX_DUEL_CHAT_TEXT}
                </CharCount>
              ) : null}
              <Button
                type="submit"
                variant="solidGray"
                size="sm"
                disabled={!draft.trim() || sending}
                isLoading={sending}
                spinnerSize={16}
              >
                <PaperAirplaneIcon style={{ width: 14, height: 14 }} />
              </Button>
            </Composer>
          ) : null}
        </Body>
      )}
    </Root>
  )
}

export default DuelChatPanel
