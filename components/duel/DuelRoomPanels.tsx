import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC, ReactNode } from 'react'
import Link from 'next/link'
import {
  ChevronDownIcon,
  ClockIcon,
  EmojiSadIcon,
  HeartIcon,
  HomeIcon,
  LightningBoltIcon,
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
import { mailman } from '@utils/helpers'
import type { DuelClientPayload } from './duelApiTypes'
import styled from 'styled-components'

const Shell = styled.div<{ $variant?: 'lobby' | 'finish' }>`
  width: 100%;
  max-width: ${({ $variant }) => ($variant === 'finish' ? 'min(720px, 100%)' : 'min(480px, 100%)')};
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

const MeterRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: stretch;
  flex-wrap: wrap;
  margin-bottom: 12px;

  .meter-slot {
    flex: 1;
    min-width: 160px;
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

const LobbyCodeProminent = styled.div`
  text-align: left;
  margin: 10px 0 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: clamp(1.85rem, 8.5vw, 2.75rem);
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #fde047;
  text-shadow: 0 0 32px rgba(253, 224, 71, 0.22);
`

const LobbyCodeCaption = styled.p`
  margin: 0 0 12px;
  text-align: left;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(228, 228, 231, 0.55);
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

const LobbyWideGrid = styled.div`
  display: grid;
  gap: 18px;
  width: 100%;
  max-width: min(960px, 100%);
  align-items: start;

  @media (min-width: 780px) {
    grid-template-columns: minmax(0, 1fr) minmax(252px, 304px);
  }
`

const LobbyPlonkAside = styled.aside`
  min-width: 0;

  @media (min-width: 780px) {
    position: sticky;
    top: 8px;
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

const DuelLobbyPlonkStrip: FC = () => {
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

export const DuelFinishBanner: FC<{
  headline: string
  tone: FinishTone
  payload: DuelClientPayload
  children?: ReactNode
  onHome: () => void
  onPlayAgain?: () => void
  playAgainLoading?: boolean
}> = ({ headline, tone, payload, children, onHome, onPlayAgain, playAgainLoading }) => {
  const sumPts = payload.host.totalPoints + payload.guest.totalPoints
  const hostShare = sumPts <= 0 ? 50 : (payload.host.totalPoints / sumPts) * 100
  const guestShare = sumPts <= 0 ? 50 : (payload.guest.totalPoints / sumPts) * 100
  const leftIsHost = payload.viewerRole !== 'guest'
  const hostLeading = payload.host.totalPoints > payload.guest.totalPoints
  const guestLeading = payload.guest.totalPoints > payload.host.totalPoints
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

  const youHp = vr === 'guest' ? payload.guest.hp : payload.host.hp
  const oppHp = vr === 'guest' ? payload.host.hp : payload.guest.hp
  const youHpMax = vr === 'guest' ? payload.startingHpGuest : payload.startingHpHost
  const oppHpMax = vr === 'guest' ? payload.startingHpHost : payload.startingHpGuest
  const youPts = vr === 'guest' ? payload.guest.totalPoints : payload.host.totalPoints
  const oppPts = vr === 'guest' ? payload.host.totalPoints : payload.guest.totalPoints
  const youShare = vr === 'guest' ? guestShare : hostShare
  const oppShare = vr === 'guest' ? hostShare : guestShare
  const youLabel = vr === 'guest' ? gn : hn
  const oppLabel = vr === 'guest' ? hn : gn
  const youTint = vr === 'guest' ? guestTint : hostTint
  const oppTint = vr === 'guest' ? hostTint : guestTint

  const showBannerMeters = !children
  const showRematch = Boolean(vr && onPlayAgain)

  return (
    <FinishPageShell>
      <FinishCardColumn>
        <Shell $variant="finish" style={{ marginTop: 0 }}>
        <HeadRow style={{ marginBottom: children ? 10 : 14 }}>
          <Glyph $tone={tone}>{glyph}</Glyph>
          <div>
            <Title>{headline}</Title>
            <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {children ? (
                payload.mode === 'hp' ? (
                  <>
                    <HeartIcon style={{ width: 14, height: 14, opacity: 0.85 }} /> Final round and totals in the recap
                  </>
                ) : (
                  <>
                    <LightningBoltIcon style={{ width: 14, height: 14, opacity: 0.85 }} /> Final round and totals in the
                    recap
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
          <MeterRow>
            {payload.mode === 'hp' ? (
              <>
                <div className="meter-slot">
                  <DuelHpMeter
                    label={youLabel}
                    current={youHp}
                    max={youHpMax}
                    accent="#7eb8ea"
                    icon={<HeartIcon />}
                  />
                </div>
                <Vs>VS</Vs>
                <div className="meter-slot">
                  <DuelHpMeter
                    label={oppLabel}
                    current={oppHp}
                    max={oppHpMax}
                    accent="#fbbf24"
                    icon={<HeartIcon />}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="meter-slot">
                  <DuelPointsMeter
                    label={youLabel}
                    points={youPts}
                    accent="#7eb8ea"
                    sharePct={youShare}
                    barTint={youTint}
                    icon={<LightningBoltIcon />}
                  />
                </div>
                <Vs>VS</Vs>
                <div className="meter-slot">
                  <DuelPointsMeter
                    label={oppLabel}
                    points={oppPts}
                    accent="#fbbf24"
                    sharePct={oppShare}
                    barTint={oppTint}
                    icon={<LightningBoltIcon />}
                  />
                </div>
              </>
            )}
          </MeterRow>
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
  friends?: { id: string; name: string }[]
  invitingFriendId?: string | null
  onInviteFriend?: (friend: { id: string; name: string }) => void | Promise<void>
}> = ({ shortCode, friends, invitingFriendId, onInviteFriend }) => {
  const [menuOpen, setMenuOpen] = useState(true)
  const list = friends ?? []

  return (
    <LobbyWideGrid>
      <Shell style={{ maxWidth: '100%' }}>
        <LobbyHead>
          <UserGroupIcon className="tile" />
          <div>
            <LobbyTitle>Waiting for opponent</LobbyTitle>
            <Subtle style={{ marginTop: 4 }}>Share this room code or ping someone below.</Subtle>
          </div>
        </LobbyHead>

        <LobbyCodeProminent aria-label="Room code">{shortCode}</LobbyCodeProminent>
        <LobbyCodeCaption>They enter this code on Join duel, or accept a friend invite.</LobbyCodeCaption>

        {onInviteFriend && (
          <InviteCard>
            <InviteToggle type="button" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span>Invite a friend</span>
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.72 }}>
                  Sends a notification to their account
                </span>
              </span>
              <ChevronDownIcon
                className="chevron"
                style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }}
              />
            </InviteToggle>
            {menuOpen &&
              (list.length === 0 ? (
                <Subtle style={{ padding: '10px 12px 12px', margin: 0, fontSize: 12 }}>
                  Add friends in Settings to invite them here.
                </Subtle>
              ) : (
                <>
                  <InviteSub>Pick someone on your friends list — they can jump in with one tap.</InviteSub>
                  {list.map((f) => (
                    <FriendInviteRow key={f.id}>
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
                    </FriendInviteRow>
                  ))}
                </>
              ))}
          </InviteCard>
        )}
      </Shell>
      <LobbyPlonkAside>
        <DuelLobbyPlonkStrip />
      </LobbyPlonkAside>
    </LobbyWideGrid>
  )
}

export const DuelLobbyGuestJoinPanel: FC<{
  shortCode: string
  mode: DuelClientPayload['mode']
  totalRounds?: number
  onJoin: (opts?: { displayName?: string }) => void
  isAuthenticated: boolean
  loginHref: string
}> = ({ shortCode, mode, totalRounds, onJoin, isAuthenticated, loginHref }) => {
  const [nick, setNick] = useState('')

  return (
    <LobbyWideGrid>
      <Shell style={{ maxWidth: '100%' }}>
        <LobbyHead>
          <PlayIcon className="tile" />
          <div>
            <LobbyTitle>Join duel</LobbyTitle>
            <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {mode === 'hp' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <HeartIcon style={{ width: 14, height: 14 }} /> HP duel
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <LightningBoltIcon style={{ width: 14, height: 14 }} />
                  {totalRounds ?? '—'} rounds
                </span>
              )}
            </Subtle>
          </div>
        </LobbyHead>

        <LobbyCodeProminent aria-label="Room code">{shortCode}</LobbyCodeProminent>
        <LobbyCodeCaption>Confirm this matches what the host gave you, then join.</LobbyCodeCaption>
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
              to use friends list and your account display name.
            </TipLink>
          </>
        )}
        <BtnRow>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              onJoin(isAuthenticated ? undefined : { displayName: nick.trim() || undefined })
            }
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <UserGroupIcon style={{ width: 16, height: 16 }} />
              Join duel
            </span>
          </Button>
        </BtnRow>
      </Shell>
      <LobbyPlonkAside>
        <DuelLobbyPlonkStrip />
      </LobbyPlonkAside>
    </LobbyWideGrid>
  )
}

export const DuelLobbyHostStartPanel: FC<{ onStart: () => void; opponentName?: string }> = ({
  onStart,
  opponentName,
}) => (
  <LobbyWideGrid>
    <Shell style={{ maxWidth: '100%' }}>
      <LobbyHead>
        <PlayIcon className="tile" />
        <div>
          <LobbyTitle>{opponentName ? `${opponentName} joined` : 'Opponent ready'}</LobbyTitle>
          <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SparklesIcon style={{ width: 14, height: 14, opacity: 0.85 }} />
            Start when you are ready — Street View loads after you begin.
          </Subtle>
        </div>
      </LobbyHead>
      <BtnRow>
        <Button variant="primary" size="sm" onClick={onStart}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <PlayIcon style={{ width: 16, height: 16 }} />
            Start duel
          </span>
        </Button>
      </BtnRow>
    </Shell>
    <LobbyPlonkAside>
      <DuelLobbyPlonkStrip />
    </LobbyPlonkAside>
  </LobbyWideGrid>
)

export const DuelLobbyGuestWaitingPanel: FC<{ hostPlayerName?: string }> = ({ hostPlayerName }) => (
  <LobbyWideGrid>
    <Shell style={{ maxWidth: '100%' }}>
      <LobbyHead>
        <ClockIcon className="tile" />
        <div>
          <LobbyTitle>{hostPlayerName ? `Waiting for ${hostPlayerName}` : 'Waiting for room host'}</LobbyTitle>
          <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SparklesIcon style={{ width: 14, height: 14, opacity: 0.75 }} /> Hang tight — they start the match.
          </Subtle>
        </div>
      </LobbyHead>
    </Shell>
    <LobbyPlonkAside>
      <DuelLobbyPlonkStrip />
    </LobbyPlonkAside>
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
