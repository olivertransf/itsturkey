import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ClipboardCopyIcon,
  ClockIcon,
  EmojiSadIcon,
  HeartIcon,
  HomeIcon,
  LightningBoltIcon,
  LinkIcon,
  PaperAirplaneIcon,
  PlayIcon,
  RefreshIcon,
  SparklesIcon,
  SwitchHorizontalIcon,
  UserGroupIcon,
  XIcon,
} from '@heroicons/react/outline'
import PlonkitGuideLauncher from '@components/PlonkitCountryGuide/PlonkitGuideLauncher'
import type { PlonkitGuidePayload } from '@components/PlonkitCountryGuide/plonkitGuideTypes'
import { Button } from '@components/system'
import { DuelHpMeter, DuelPointsMeter } from '@components/duel/DuelHpMeter'
import { duelAvatarAccent, duelHudAvatarIcon } from '@components/duel/duelHudAvatar'
import { mailman, showToast } from '@utils/helpers'
import { resolveMapImageSrc } from '@utils/helpers/mapPreviewSrc'
import DuelChatPanel from './DuelChatPanel'
import type { DuelClientPayload, DuelChatMessageClient, DuelGuessAvatar, DuelViewerRole } from './duelApiTypes'
import styled from 'styled-components'

const Shell = styled.div<{ $variant?: 'lobby' | 'finish' }>`
  width: 100%;
  max-width: ${({ $variant }) =>
    $variant === 'finish' ? 'min(720px, 100%)' : $variant === 'lobby' ? '100%' : 'min(480px, 100%)'};
  margin-inline: ${({ $variant }) => ($variant === 'finish' ? 'auto' : '0')};
  padding: ${({ $variant }) => ($variant === 'finish' ? 'var(--pad-card) var(--pad-card) 22px' : 'var(--pad-card)')};
  border-radius: var(--radius-xl);
  box-sizing: border-box;
  background-color: var(--bg-elevated);
  border: var(--border-default);
  box-shadow: var(--shadow-card);
  color: var(--text-primary);
`

const HeadRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
`

const Glyph = styled.div<{ $tone: 'win' | 'loss' | 'tie' | 'neutral' }>`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'win'
        ? 'rgba(250, 204, 21, 0.45)'
        : $tone === 'loss'
        ? 'rgba(248, 113, 113, 0.45)'
        : $tone === 'tie'
        ? 'rgba(148, 163, 184, 0.45)'
        : 'rgba(113, 113, 122, 0.45)'};
  background: ${({ $tone }) =>
    $tone === 'win'
      ? 'rgba(234, 179, 8, 0.2)'
      : $tone === 'loss'
      ? 'rgba(239, 68, 68, 0.2)'
      : $tone === 'tie'
      ? 'rgba(71, 85, 105, 0.35)'
      : 'var(--bg-surface)'};
  color: ${({ $tone }) =>
    $tone === 'win' ? '#fde047' : $tone === 'loss' ? '#fecaca' : $tone === 'tie' ? '#e2e8f0' : '#a1a1aa'};

  svg {
    width: 26px;
    height: 26px;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
`

const Subtle = styled.p`
  margin: 6px 0 0;
  font-size: 13px;
  opacity: 0.82;
  line-height: 1.45;
`

const FinishMeterPanel = styled.div<{ $withRecap?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(12, 14, 18, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.09);
  margin-bottom: ${({ $withRecap }) => ($withRecap ? 20 : 14)}px;

  .meter-slot {
    min-width: 0;
  }

  @media (max-width: 560px) {
    gap: 8px 10px;
    padding: 10px 12px;
  }
`

const Vs = styled.span`
  align-self: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
`

const LobbyHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  svg.tile {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    padding: 10px;
    border-radius: 12px;
    background: rgba(110, 178, 232, 0.14);
    border: 1px solid rgba(157, 200, 240, 0.35);
    color: #9dc8f0;
    box-sizing: border-box;
  }
`

const LobbyTitle = styled.h1`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

const RematchHint = styled.p`
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.45;
  color: #a1a1aa;
`

const NickField = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f4f4f5;
  font-size: 13px;
  margin-bottom: 12px;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(157, 200, 240, 0.5);
    outline: none;
  }
`

const TipLink = styled.span`
  font-size: 12px;
  color: #a1a1aa;
  margin-top: 10px;
  display: block;
  line-height: 1.45;

  a {
    color: #9dc8f0;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`

const InviteToggle = styled.button`
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

const FriendInviteRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
`

const FriendName = styled.span`
  color: #e4e4e7;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const LobbyWideGrid = styled.div`
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: min(1040px, 100%);
  align-items: stretch;

  @media (min-width: 820px) {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
  }
`

const LobbyMainColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`

const LobbyAsideColumn = styled.aside`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 820px) {
    position: sticky;
    top: 12px;
    align-self: start;
    min-height: min(540px, 64vh);
  }
`

const LobbyPlonkAside = styled.div`
  min-width: 0;

  @media (min-width: 820px) {
    display: none;
  }
`

const RoomCodeCard = styled.div`
  margin: 0 0 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(234, 179, 8, 0.08), rgba(0, 0, 0, 0.22));
  border: 1px solid rgba(253, 224, 71, 0.28);
  box-sizing: border-box;
`

const RoomCodeLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(253, 224, 71, 0.72);
  margin-bottom: 8px;
`

const RoomCodeValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const RoomCodeText = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: clamp(1.65rem, 6vw, 2.35rem);
  font-weight: 800;
  letter-spacing: 0.22em;
  color: #fde047;
  line-height: 1;
`

const RoomCodeHint = styled.p`
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(228, 228, 231, 0.62);
`

const FriendsSection = styled.div`
  margin: 0 0 14px;
  padding: 12px;
  border-radius: 14px;
  background: var(--bg-surface);
  border: var(--border-default);
  box-sizing: border-box;
`

const FriendsSectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`

const FriendsSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #e4e4e7;
  display: inline-flex;
  align-items: center;
  gap: 7px;
`

const FriendsEmpty = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(161, 161, 170, 0.95);

  a {
    color: #9dc8f0;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

const FriendsChipRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FriendChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const StartCtaRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
`

const OpponentJoinedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(110, 178, 232, 0.12);
  border: 1px solid rgba(157, 200, 240, 0.35);
  font-size: 13px;
  font-weight: 700;
  color: #d4e8fb;
  margin-bottom: 12px;
  width: fit-content;
  max-width: 100%;
`

const LobbyTipsBlock = styled.div`
  margin-top: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: var(--border-default);
  box-sizing: border-box;
`

const LobbyTipsLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const LobbyTipsText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.52;
  color: rgba(228, 228, 231, 0.92);
`

const LobbyPlonkFoot = styled.p`
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(161, 161, 170, 0.92);

  a {
    color: #9dc8f0;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

const InviteCard = styled.div`
  margin: 4px 0 0;
  border-radius: 14px;
  background: var(--bg-surface);
  border: var(--border-default);
  overflow: hidden;
`

const InviteSub = styled.p`
  margin: 0;
  padding: 0 12px 10px;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(161, 161, 170, 0.95);
`

const MatchSummaryCard = styled.div`
  display: flex;
  gap: 14px;
  align-items: stretch;
  margin: 0 0 14px;
  padding: 12px;
  border-radius: 14px;
  background: var(--bg-surface);
  border: var(--border-default);
  box-sizing: border-box;
`

const MatchSummaryPreview = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const MatchSummaryBody = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const MatchSummaryTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MatchSummaryMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(228, 228, 231, 0.82);

  span.meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  span.meta-chip--round {
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(157, 200, 240, 0.22);
    min-width: 72px;
  }

  span.meta-round-label {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(157, 200, 240, 0.82);
  }

  span.meta-round-value {
    font-size: 13px;
    font-weight: 800;
    color: rgba(244, 244, 245, 0.95);
    font-variant-numeric: tabular-nums;
  }

  svg {
    width: 13px;
    height: 13px;
    opacity: 0.88;
  }
`

const CopyBtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
`

export type DuelLobbyMatchInfo = {
  mapDetails: DuelClientPayload['mapDetails']
  mode: DuelClientPayload['mode']
  totalRounds?: number
  startingHpHost: number
  startingHpGuest: number
  multiplierMode: DuelClientPayload['multiplierMode']
}

async function copyDuelInviteLink(shortCode: string) {
  const url = `${window.location.origin}/duel/${encodeURIComponent(shortCode)}`
  try {
    await navigator.clipboard.writeText(url)
    showToast('success', 'Invite link copied')
  } catch {
    showToast('error', 'Could not copy link')
  }
}

async function copyDuelRoomCode(shortCode: string) {
  try {
    await navigator.clipboard.writeText(shortCode)
    showToast('success', 'Room code copied')
  } catch {
    showToast('error', 'Could not copy code')
  }
}

const DuelLobbyMatchSummary: FC<{ match: DuelLobbyMatchInfo }> = ({ match }) => {
  const mapName = match.mapDetails?.name ?? 'Map'
  const preview = match.mapDetails?.previewImg

  return (
    <MatchSummaryCard>
      <MatchSummaryPreview>
        {preview ? (
          <Image src={resolveMapImageSrc(preview)} alt="" layout="fill" objectFit="cover" sizes="72px" />
        ) : null}
      </MatchSummaryPreview>
      <MatchSummaryBody>
        <MatchSummaryTitle title={mapName}>{mapName}</MatchSummaryTitle>
        <MatchSummaryMeta>
          {match.mode === 'hp' ? (
            <>
              <span className="meta-chip">
                <HeartIcon /> HP duel
              </span>
              <span className="meta-chip">
                You {match.startingHpHost.toLocaleString()} · Opp {match.startingHpGuest.toLocaleString()} HP
              </span>
              <span className="meta-chip">
                {match.multiplierMode === 'round_ramp' ? 'Round ramp mult' : 'Win streak mult'}
              </span>
            </>
          ) : (
            <>
              <span className="meta-chip meta-chip--round">
                <span className="meta-round-label">Rounds</span>
                <span className="meta-round-value">{match.totalRounds ?? '—'}</span>
              </span>
              <span className="meta-chip">
                Start {match.startingHpHost.toLocaleString()} / {match.startingHpGuest.toLocaleString()} HP
              </span>
            </>
          )}
        </MatchSummaryMeta>
      </MatchSummaryBody>
    </MatchSummaryCard>
  )
}

const DuelLobbyCopyButtons: FC<{ shortCode: string; compact?: boolean }> = ({ shortCode, compact }) => (
  <CopyBtnRow style={compact ? { margin: 0, gap: 6 } : undefined}>
    <Button variant="solidGray" size="sm" onClick={() => void copyDuelInviteLink(shortCode)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <LinkIcon style={{ width: 14, height: 14 }} />
        {compact ? 'Link' : 'Copy link'}
      </span>
    </Button>
    <Button variant="solidGray" size="sm" onClick={() => void copyDuelRoomCode(shortCode)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ClipboardCopyIcon style={{ width: 14, height: 14 }} />
        {compact ? 'Code' : 'Copy code'}
      </span>
    </Button>
  </CopyBtnRow>
)

const DuelRoomCodeCard: FC<{ shortCode: string; hint: string }> = ({ shortCode, hint }) => (
  <RoomCodeCard>
    <RoomCodeLabel>Room code</RoomCodeLabel>
    <RoomCodeValue>
      <RoomCodeText aria-label="Room code">{shortCode}</RoomCodeText>
      <DuelLobbyCopyButtons shortCode={shortCode} compact />
    </RoomCodeValue>
    <RoomCodeHint>{hint}</RoomCodeHint>
  </RoomCodeCard>
)

const DuelLobbyFriendsInvite: FC<{
  friends?: { id: string; name: string }[]
  invitingFriendId?: string | null
  onInviteFriend?: (friend: { id: string; name: string }) => void | Promise<void>
}> = ({ friends, invitingFriendId, onInviteFriend }) => {
  if (!onInviteFriend) return null
  const list = friends ?? []

  return (
    <FriendsSection>
      <FriendsSectionHead>
        <FriendsSectionTitle>
          <UserGroupIcon style={{ width: 15, height: 15, opacity: 0.9 }} />
          Invite a friend
        </FriendsSectionTitle>
      </FriendsSectionHead>
      {list.length === 0 ? (
        <FriendsEmpty>
          No friends yet.{' '}
          <Link href="/friends">
            <a>Add friends</a>
          </Link>{' '}
          to send one-tap duel invites.
        </FriendsEmpty>
      ) : (
        <FriendsChipRow>
          {list.map((f) => (
            <FriendChip key={f.id}>
              <FriendName title={f.name}>{f.name}</FriendName>
              <Button
                variant="solidGray"
                size="sm"
                disabled={invitingFriendId === f.id}
                isLoading={invitingFriendId === f.id}
                spinnerSize={18}
                onClick={() => void onInviteFriend(f)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <PaperAirplaneIcon style={{ width: 14, height: 14 }} />
                  Invite
                </span>
              </Button>
            </FriendChip>
          ))}
        </FriendsChipRow>
      )}
    </FriendsSection>
  )
}

const DuelLobbyAside: FC<{ chat?: DuelLobbyChatProps }> = ({ chat }) => (
  <LobbyAsideColumn>
    {chat ? <DuelLobbyChat {...chat} /> : null}
    <LobbyPlonkAside>
      <DuelLobbyPlonkStrip />
    </LobbyPlonkAside>
  </LobbyAsideColumn>
)

const FinishPageShell = styled.div`
  width: min(880px, 100%);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 0 1 auto;
  padding-top: clamp(36px, 5vh, 52px);
  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
`

const FinishCardColumn = styled.div`
  width: min(720px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const FinishActionsBelow = styled.div`
  width: 100%;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const FinishBtnPair = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: stretch;
  width: 100%;

  @media (max-width: 520px) {
    flex-direction: column;
  }

  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
`

const RematchModalRoot = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(8px);
`

const RematchModalCard = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 22px 22px 18px;
  border-radius: 18px;
  background: var(--bg-elevated);
  border: var(--border-default);
  box-shadow: var(--shadow-card);
  color: var(--text-primary);
  position: relative;
  box-sizing: border-box;
`

const RematchModalTitle = styled.h2`
  margin: 0 28px 8px 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
`

const RematchModalBody = styled.p`
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
`

const RematchModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RematchModalClose = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: rgba(228, 228, 231, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

export const DuelLobbyPlonkStrip: FC = () => {
  const [iso, setIso] = useState<string | null>(null)
  const [title, setTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const firstLoad = useRef(true)

  const load = useCallback(async () => {
    setError(null)
    if (firstLoad.current) setLoading(true)

    const res = await mailman('plonkit-guide?random=1&lightweight=1', 'GET')

    if (firstLoad.current) {
      firstLoad.current = false
      setLoading(false)
    }

    if (
      !res ||
      (typeof res === 'object' &&
        res !== null &&
        'error' in res &&
        (res as { error?: unknown }).error)
    ) {
      const e = (res as { error?: unknown } | null)?.error
      const msg =
        typeof e === 'string'
          ? e
          : typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: unknown }).message)
          : 'Could not load a Plonk It guide.'
      setError(msg)
      setIso(null)
      setTitle(null)
      return
    }

    const p = res as PlonkitGuidePayload
    if (!p.meta?.code) {
      setError('Invalid guide response')
      setIso(null)
      setTitle(null)
      return
    }

    setIso(p.meta.code)
    setTitle(p.meta.title?.trim() || p.meta.code)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const id = window.setInterval(() => void load(), 75000)
    return () => window.clearInterval(id)
  }, [load])

  return (
    <LobbyTipsBlock>
      <LobbyTipsLabel>
        <SparklesIcon style={{ width: 13, height: 13, opacity: 0.85 }} />
        Plonk It · random guide
      </LobbyTipsLabel>
      {loading && !title ? <LobbyTipsText>Loading a country guide…</LobbyTipsText> : null}
      {error ? <LobbyTipsText style={{ opacity: 0.88 }}>{error}</LobbyTipsText> : null}
      {title ? <LobbyTipsText style={{ fontWeight: 700, marginBottom: 8 }}>{title}</LobbyTipsText> : null}
      {iso ? (
        <div style={{ marginTop: 4 }}>
          <PlonkitGuideLauncher
            variant="compact"
            countryIso={iso}
            mapLabel={title ?? undefined}
            compactAlign="start"
          />
        </div>
      ) : null}
      <LobbyPlonkFoot>
        From{' '}
        <a href="https://www.plonkit.net/guide" target="_blank" rel="noopener noreferrer">
          Plonk It
        </a>
        . CC BY-NC-SA 4.0 — noncommercial, attribution required.
      </LobbyPlonkFoot>
    </LobbyTipsBlock>
  )
}

type FinishTone = 'win' | 'loss' | 'tie' | 'neutral'

type DuelLobbyChatProps = {
  duelId: string
  chatMessages?: DuelChatMessageClient[]
  playerNames: { host: string; guest: string }
  playerAvatars?: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  viewerRole: Exclude<DuelViewerRole, null | 'spectator'>
  onRefresh?: () => Promise<void>
}

const DuelLobbyChat: FC<DuelLobbyChatProps> = ({
  duelId,
  chatMessages,
  playerNames,
  playerAvatars,
  viewerRole,
  onRefresh,
}) => (
  <DuelChatPanel
    duelId={duelId}
    messages={chatMessages ?? []}
    playerNames={playerNames}
    playerAvatars={playerAvatars}
    viewerRole={viewerRole}
    onRefresh={onRefresh}
    variant="sidebar"
    embedded
  />
)

export const DuelFinishBanner: FC<{
  headline: string
  tone: FinishTone
  payload: DuelClientPayload
  recapRoundIdx?: number
  children?: ReactNode
  onHome: () => void
  onPlayAgain?: () => void
  playAgainLoading?: boolean
}> = ({ headline, tone, payload, recapRoundIdx, children, onHome, onPlayAgain, playAgainLoading }) => {
  const rounds = payload.roundResults
  const hasRecap = Boolean(children) && rounds.length > 0
  const clampedRecapIdx = hasRecap
    ? Math.min(Math.max(0, recapRoundIdx ?? rounds.length - 1), rounds.length - 1)
    : Math.max(0, rounds.length - 1)
  const selectedRound = rounds[clampedRecapIdx] ?? null
  const isFinalRoundSelected = !hasRecap || clampedRecapIdx === rounds.length - 1
  const selectedRoundOneBased = selectedRound ? selectedRound.roundIndex + 1 : rounds.length

  let hostHpMeter = payload.host.hp
  let guestHpMeter = payload.guest.hp
  let hostPtsMeter = payload.host.totalPoints
  let guestPtsMeter = payload.guest.totalPoints

  if (hasRecap && selectedRound) {
    hostHpMeter = selectedRound.hostHpAfter
    guestHpMeter = selectedRound.guestHpAfter
    hostPtsMeter = 0
    guestPtsMeter = 0
    for (let i = 0; i <= clampedRecapIdx; i++) {
      hostPtsMeter += rounds[i].hostPoints
      guestPtsMeter += rounds[i].guestPoints
    }
  }

  const sumPts = hostPtsMeter + guestPtsMeter
  const hostShare = sumPts <= 0 ? 50 : (hostPtsMeter / sumPts) * 100
  const guestShare = sumPts <= 0 ? 50 : (guestPtsMeter / sumPts) * 100
  const leftIsHost = payload.viewerRole !== 'guest'
  const hostLeading = hostPtsMeter > guestPtsMeter
  const guestLeading = guestPtsMeter > hostPtsMeter
  const hostTint =
    leftIsHost ? (hostLeading ? 'you' : 'neutral') : hostLeading ? 'opponent' : 'neutral'
  const guestTint =
    leftIsHost ? (guestLeading ? 'opponent' : 'neutral') : guestLeading ? 'you' : 'neutral'

  const glyph =
    tone === 'win' ? (
      <SparklesIcon />
    ) : tone === 'loss' ? (
      <EmojiSadIcon />
    ) : tone === 'tie' ? (
      <SwitchHorizontalIcon />
    ) : (
      <SparklesIcon />
    )

  const vr = payload.viewerRole
  const youReady =
    vr === 'host' ? payload.rematchReady.host : vr === 'guest' ? payload.rematchReady.guest : false
  const oppReady =
    vr === 'host' ? payload.rematchReady.guest : vr === 'guest' ? payload.rematchReady.host : false

  const hn = payload.playerNames.host
  const gn = payload.playerNames.guest

  const youHp = vr === 'guest' ? guestHpMeter : hostHpMeter
  const oppHp = vr === 'guest' ? hostHpMeter : guestHpMeter
  const youHpMax = vr === 'guest' ? payload.startingHpGuest : payload.startingHpHost
  const oppHpMax = vr === 'guest' ? payload.startingHpHost : payload.startingHpGuest
  const youPts = vr === 'guest' ? guestPtsMeter : hostPtsMeter
  const oppPts = vr === 'guest' ? hostPtsMeter : guestPtsMeter
  const youShare = vr === 'guest' ? guestShare : hostShare
  const oppShare = vr === 'guest' ? hostShare : guestShare
  const youLabel = vr === 'guest' ? gn : hn
  const oppLabel = vr === 'guest' ? hn : gn
  const youTint = vr === 'guest' ? guestTint : hostTint
  const oppTint = vr === 'guest' ? hostTint : guestTint

  const youAreHost = vr !== 'guest'
  const youAvatar = youAreHost ? payload.playerAvatars.host : payload.playerAvatars.guest
  const oppAvatar = youAreHost ? payload.playerAvatars.guest : payload.playerAvatars.host
  const youAccent = duelAvatarAccent(youAvatar)
  const oppAccent = duelAvatarAccent(oppAvatar)

  const showBannerMeters = true
  const showRematch = Boolean(vr && onPlayAgain)

  return (
    <FinishPageShell>
      <FinishCardColumn>
        <Shell $variant="finish" style={{ marginTop: 0 }}>
        <HeadRow style={{ marginBottom: children ? 12 : 14 }}>
          <Glyph $tone={tone}>{glyph}</Glyph>
          <div>
            <Title>{headline}</Title>
            <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {children ? (
                payload.mode === 'hp' ? (
                  <>
                    <HeartIcon style={{ width: 14, height: 14, opacity: 0.85 }} />
                    {isFinalRoundSelected
                      ? 'Final health — pick a round to review'
                      : `Health after round ${selectedRoundOneBased} — pick another round`}
                  </>
                ) : (
                  <>
                    <LightningBoltIcon style={{ width: 14, height: 14, opacity: 0.85 }} />
                    {isFinalRoundSelected
                      ? 'Final totals — pick a round to review'
                      : `Totals through round ${selectedRoundOneBased} — pick another round`}
                  </>
                )
              ) : payload.mode === 'hp' ? (
                <>
                  <HeartIcon style={{ width: 14, height: 14, opacity: 0.85 }} /> HP duel wrap-up
                </>
              ) : (
                <>
                  <LightningBoltIcon style={{ width: 14, height: 14, opacity: 0.85 }} /> Points duel wrap-up
                </>
              )}
            </Subtle>
          </div>
        </HeadRow>

        {showBannerMeters ? (
          <FinishMeterPanel $withRecap={Boolean(children)}>
            {payload.mode === 'hp' ? (
              <>
                <div className="meter-slot">
                  <DuelHpMeter
                    label={youLabel}
                    labelTransform="none"
                    icon={duelHudAvatarIcon(youAvatar)}
                    current={youHp}
                    max={youHpMax}
                    accent={youAccent}
                    dense
                    valueBesideBar
                    asideIcon="left"
                    valueSide="right"
                  />
                </div>
                <Vs>VS</Vs>
                <div className="meter-slot">
                  <DuelHpMeter
                    label={oppLabel}
                    labelTransform="none"
                    icon={duelHudAvatarIcon(oppAvatar)}
                    current={oppHp}
                    max={oppHpMax}
                    accent={oppAccent}
                    dense
                    valueBesideBar
                    asideIcon="right"
                    valueSide="left"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="meter-slot">
                  <DuelPointsMeter
                    label={youLabel}
                    labelTransform="none"
                    icon={duelHudAvatarIcon(youAvatar)}
                    points={youPts}
                    accent={youAccent}
                    dense
                    sharePct={youShare}
                    barTint={youTint}
                    barFillColor={youAccent}
                    valueBesideBar
                    asideIcon="left"
                    valueSide="right"
                  />
                </div>
                <Vs>VS</Vs>
                <div className="meter-slot">
                  <DuelPointsMeter
                    label={oppLabel}
                    labelTransform="none"
                    icon={duelHudAvatarIcon(oppAvatar)}
                    points={oppPts}
                    accent={oppAccent}
                    dense
                    sharePct={oppShare}
                    barTint={oppTint}
                    barFillColor={oppAccent}
                    valueBesideBar
                    asideIcon="right"
                    valueSide="left"
                  />
                </div>
              </>
            )}
          </FinishMeterPanel>
        ) : null}

        {children}
        </Shell>

        <FinishActionsBelow>
          {showRematch ? (
            <RematchHint style={{ textAlign: 'center', margin: 0, fontSize: 12, lineHeight: 1.45 }}>
              {youReady
                ? oppReady
                  ? 'Starting the next match…'
                  : 'You chose Play again. Waiting for your opponent to tap it too — same map and rules.'
                : oppReady
                ? 'Your opponent is ready for a rematch. Tap Play again to continue with the same settings.'
                : 'Both players must tap Play again to start another match with the same settings.'}
            </RematchHint>
          ) : null}
          <FinishBtnPair>
            {showRematch ? (
              <Button
                variant="primary"
                size="lg"
                onClick={onPlayAgain}
                disabled={youReady || !!playAgainLoading}
                isLoading={!!playAgainLoading}
                spinnerSize={24}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <RefreshIcon style={{ width: 20, height: 20 }} />
                  Play again
                </span>
              </Button>
            ) : null}
            <Button variant="solidGray" size="lg" onClick={onHome}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <HomeIcon style={{ width: 20, height: 20 }} />
                Home
              </span>
            </Button>
          </FinishBtnPair>
        </FinishActionsBelow>
      </FinishCardColumn>
    </FinishPageShell>
  )
}

export const DuelLobbyHostWaitingPanel: FC<{
  shortCode: string
  match: DuelLobbyMatchInfo
  friends?: { id: string; name: string }[]
  invitingFriendId?: string | null
  onInviteFriend?: (friend: { id: string; name: string }) => void | Promise<void>
  chat?: DuelLobbyChatProps
}> = ({ shortCode, match, friends, invitingFriendId, onInviteFriend, chat }) => (
  <LobbyWideGrid>
    <LobbyMainColumn>
      <Shell $variant="lobby">
        <LobbyHead>
          <UserGroupIcon className="tile" />
          <div>
            <LobbyTitle>Waiting for opponent</LobbyTitle>
            <Subtle style={{ marginTop: 4 }}>Share the code or invite a friend. Chat is open on the right.</Subtle>
          </div>
        </LobbyHead>

        <DuelLobbyMatchSummary match={match} />
        <DuelRoomCodeCard
          shortCode={shortCode}
          hint="Friends can join from the invite notification, or enter this code on Join duel."
        />
        <DuelLobbyFriendsInvite
          friends={friends}
          invitingFriendId={invitingFriendId}
          onInviteFriend={onInviteFriend}
        />
      </Shell>
    </LobbyMainColumn>
    <DuelLobbyAside chat={chat} />
  </LobbyWideGrid>
)

export const DuelLobbyGuestJoinPanel: FC<{
  shortCode: string
  match: DuelLobbyMatchInfo
  onJoin: (opts?: { displayName?: string }) => void
  isAuthenticated: boolean
  loginHref: string
  joinLoading?: boolean
}> = ({ shortCode, match, onJoin, isAuthenticated, loginHref, joinLoading }) => {
  const [nick, setNick] = useState('')

  return (
    <LobbyWideGrid>
      <LobbyMainColumn>
        <Shell $variant="lobby">
          <LobbyHead>
            <PlayIcon className="tile" />
            <div>
              <LobbyTitle>Join duel</LobbyTitle>
              <Subtle style={{ marginTop: 4 }}>Confirm the room code, then join as the second player.</Subtle>
            </div>
          </LobbyHead>

          <DuelLobbyMatchSummary match={match} />
          <DuelRoomCodeCard shortCode={shortCode} hint="This should match the code your host shared." />

          {!isAuthenticated && (
            <>
              <NickField
                placeholder="Your name (optional)"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={32}
                autoComplete="nickname"
              />
              <TipLink>
                <Link href={loginHref} passHref>
                  <a>Sign in</a>
                </Link>{' '}
                to use your account name and friends list.
              </TipLink>
            </>
          )}

          <StartCtaRow>
            <Button
              variant="primary"
              size="md"
              style={{ width: '100%' }}
              disabled={joinLoading}
              isLoading={joinLoading}
              spinnerSize={22}
              onClick={() =>
                onJoin(isAuthenticated ? undefined : { displayName: nick.trim() || undefined })
              }
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <UserGroupIcon style={{ width: 16, height: 16 }} />
                Join duel
              </span>
            </Button>
          </StartCtaRow>
        </Shell>
      </LobbyMainColumn>
      <LobbyPlonkAside>
        <DuelLobbyPlonkStrip />
      </LobbyPlonkAside>
    </LobbyWideGrid>
  )
}

export const DuelLobbyHostStartPanel: FC<{
  shortCode: string
  match: DuelLobbyMatchInfo
  onStart: () => void
  opponentName?: string
  chat?: DuelLobbyChatProps
  startLoading?: boolean
}> = ({ shortCode, match, onStart, opponentName, chat, startLoading }) => (
  <LobbyWideGrid>
    <LobbyMainColumn>
      <Shell $variant="lobby">
        <LobbyHead>
          <PlayIcon className="tile" />
          <div>
            <LobbyTitle>Ready to start</LobbyTitle>
            <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <SparklesIcon style={{ width: 14, height: 14, opacity: 0.85 }} />
              Street View loads once you begin the match.
            </Subtle>
          </div>
        </LobbyHead>

        {opponentName ? (
          <OpponentJoinedBadge>
            <UserGroupIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
            {opponentName} joined
          </OpponentJoinedBadge>
        ) : null}

        <DuelLobbyMatchSummary match={match} />
        <DuelRoomCodeCard shortCode={shortCode} hint="Need a backup invite? Copy the link or code above." />

        <StartCtaRow>
          <Button
            variant="primary"
            size="lg"
            style={{ width: '100%' }}
            onClick={onStart}
            disabled={startLoading}
            isLoading={startLoading}
            spinnerSize={24}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PlayIcon style={{ width: 18, height: 18 }} />
              Start duel
            </span>
          </Button>
        </StartCtaRow>
      </Shell>
    </LobbyMainColumn>
    <DuelLobbyAside chat={chat} />
  </LobbyWideGrid>
)

export const DuelLobbyGuestWaitingPanel: FC<{
  match: DuelLobbyMatchInfo
  hostPlayerName?: string
  chat?: DuelLobbyChatProps
}> = ({ match, hostPlayerName, chat }) => (
  <LobbyWideGrid>
    <LobbyMainColumn>
      <Shell $variant="lobby">
        <LobbyHead>
          <ClockIcon className="tile" />
          <div>
            <LobbyTitle>{hostPlayerName ? `Waiting for ${hostPlayerName}` : 'Waiting for host'}</LobbyTitle>
            <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <SparklesIcon style={{ width: 14, height: 14, opacity: 0.75 }} />
              You are in. The host starts the match when ready.
            </Subtle>
          </div>
        </LobbyHead>
        <DuelLobbyMatchSummary match={match} />
      </Shell>
    </LobbyMainColumn>
    <DuelLobbyAside chat={chat} />
  </LobbyWideGrid>
)

export const DuelOpponentRematchModal: FC<{
  open: boolean
  opponentLabel: string
  onPlayAgain: () => void
  onDismiss: () => void
  loading?: boolean
}> = ({ open, opponentLabel, onPlayAgain, onDismiss, loading }) => {
  if (!open) return null
  const name = opponentLabel.trim() || 'Your opponent'
  return (
    <RematchModalRoot role="dialog" aria-modal="true" aria-labelledby="duel-rematch-title">
      <RematchModalCard>
        <RematchModalClose type="button" onClick={onDismiss} aria-label="Dismiss">
          <XIcon />
        </RematchModalClose>
        <RematchModalTitle id="duel-rematch-title">Rematch ready</RematchModalTitle>
        <RematchModalBody>
          <strong style={{ color: 'var(--text-primary)' }}>{name}</strong> tapped Play again and wants another match
          with the same map and rules. Tap below to accept, or dismiss and use the bar at the bottom anytime.
        </RematchModalBody>
        <RematchModalActions>
          <Button variant="primary" size="md" onClick={onPlayAgain} isLoading={!!loading} spinnerSize={22}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RefreshIcon style={{ width: 18, height: 18 }} />
              Play again
            </span>
          </Button>
          <Button variant="solidGray" size="sm" onClick={onDismiss}>
            Not now
          </Button>
        </RematchModalActions>
      </RematchModalCard>
    </RematchModalRoot>
  )
}
