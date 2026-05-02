import type { FC, ReactNode } from 'react'
import {
  ClockIcon,
  EmojiSadIcon,
  HeartIcon,
  HomeIcon,
  InformationCircleIcon,
  LightningBoltIcon,
  LinkIcon,
  PlayIcon,
  SparklesIcon,
  SwitchHorizontalIcon,
  UserGroupIcon,
} from '@heroicons/react/outline'
import { Button } from '@components/system'
import { DuelHpMeter, DuelPointsMeter } from '@components/duel/DuelHpMeter'
import type { DuelClientPayload } from './duelApiTypes'
import styled from 'styled-components'

const Shell = styled.div<{ $variant?: 'lobby' | 'finish' }>`
  width: 100%;
  max-width: ${({ $variant }) => ($variant === 'finish' ? 'min(760px, 100%)' : 'min(480px, 100%)')};
  padding: ${({ $variant }) => ($variant === 'finish' ? '22px 20px 26px' : '24px 22px 26px')};
  border-radius: 20px;
  box-sizing: border-box;
  background: linear-gradient(165deg, rgba(22, 22, 34, 0.94), rgba(12, 12, 22, 0.97));
  border: 1px solid rgba(167, 139, 250, 0.22);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35),
    0 28px 90px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #e4e4e7;
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
      ? 'linear-gradient(145deg, rgba(234, 179, 8, 0.28), rgba(202, 138, 4, 0.12))'
      : $tone === 'loss'
      ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.28), rgba(185, 28, 28, 0.12))'
      : $tone === 'tie'
      ? 'linear-gradient(145deg, rgba(71, 85, 105, 0.35), rgba(30, 41, 59, 0.35))'
      : 'rgba(255, 255, 255, 0.06)'};
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
    background: rgba(97, 63, 231, 0.18);
    border: 1px solid rgba(167, 139, 250, 0.35);
    color: #d8b4fe;
    box-sizing: border-box;
  }
`

const LobbyTitle = styled.h1`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
`

const HintRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 10px 0 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  line-height: 1.45;
  color: #a1a1aa;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 1px;
    color: #71717a;
  }
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

type FinishTone = 'win' | 'loss' | 'tie' | 'neutral'

export const DuelFinishBanner: FC<{
  headline: string
  tone: FinishTone
  payload: DuelClientPayload
  children?: ReactNode
  onHome: () => void
}> = ({ headline, tone, payload, children, onHome }) => {
  const sumPts = payload.host.totalPoints + payload.guest.totalPoints
  const hostShare = sumPts <= 0 ? 50 : (payload.host.totalPoints / sumPts) * 100
  const guestShare = sumPts <= 0 ? 50 : (payload.guest.totalPoints / sumPts) * 100
  const hostTint =
    payload.host.totalPoints > payload.guest.totalPoints
      ? 'blue'
      : payload.guest.totalPoints > payload.host.totalPoints
      ? ('neutral' as const)
      : ('neutral' as const)
  const guestTint =
    payload.guest.totalPoints > payload.host.totalPoints
      ? 'purple'
      : payload.host.totalPoints > payload.guest.totalPoints
      ? ('neutral' as const)
      : ('neutral' as const)

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

  return (
    <Shell $variant="finish">
      <HeadRow>
        <Glyph $tone={tone}>{glyph}</Glyph>
        <div>
          <Title>{headline}</Title>
          <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {payload.mode === 'hp' ? (
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

      <MeterRow>
        {payload.mode === 'hp' ? (
          <>
            <div className="meter-slot">
              <DuelHpMeter
                label="Host"
                current={payload.host.hp}
                max={payload.startingHpHost}
                accent="#93c5fd"
                icon={<HeartIcon />}
              />
            </div>
            <Vs>VS</Vs>
            <div className="meter-slot">
              <DuelHpMeter
                label="Guest"
                current={payload.guest.hp}
                max={payload.startingHpGuest}
                accent="#d8b4fe"
                icon={<HeartIcon />}
              />
            </div>
          </>
        ) : (
          <>
            <div className="meter-slot">
              <DuelPointsMeter
                label="Host"
                points={payload.host.totalPoints}
                accent="#93c5fd"
                sharePct={hostShare}
                barTint={hostTint}
                icon={<LightningBoltIcon />}
              />
            </div>
            <Vs>VS</Vs>
            <div className="meter-slot">
              <DuelPointsMeter
                label="Guest"
                points={payload.guest.totalPoints}
                accent="#d8b4fe"
                sharePct={guestShare}
                barTint={guestTint}
                icon={<LightningBoltIcon />}
              />
            </div>
          </>
        )}
      </MeterRow>

      {children}

      <BtnRow>
        <Button variant="solidGray" size="sm" onClick={onHome}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <HomeIcon style={{ width: 16, height: 16 }} />
            Home
          </span>
        </Button>
      </BtnRow>
    </Shell>
  )
}

export const DuelLobbyHostWaitingPanel: FC<{ shortCode: string; onCopyInvite: () => void }> = ({
  shortCode,
  onCopyInvite,
}) => (
  <Shell>
    <LobbyHead>
      <UserGroupIcon className="tile" />
      <div>
        <LobbyTitle>Waiting for opponent</LobbyTitle>
        <Subtle>
          Code <strong style={{ color: '#fde047', letterSpacing: '0.08em' }}>{shortCode}</strong>
        </Subtle>
      </div>
    </LobbyHead>
    <HintRow>
      <InformationCircleIcon />
      <span>
        Two incognito windows in the same browser share one session. Open the invite in a normal window, another
        browser, or another profile so the guest counts as a separate player.
      </span>
    </HintRow>
    <BtnRow>
      <Button variant="primary" size="sm" onClick={onCopyInvite}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <LinkIcon style={{ width: 16, height: 16 }} />
          Copy invite link
        </span>
      </Button>
    </BtnRow>
  </Shell>
)

export const DuelLobbyGuestJoinPanel: FC<{
  shortCode: string
  mode: DuelClientPayload['mode']
  totalRounds?: number
  onJoin: () => void
}> = ({ shortCode, mode, totalRounds, onJoin }) => (
  <Shell>
    <LobbyHead>
      <PlayIcon className="tile" />
      <div>
        <LobbyTitle>Join duel</LobbyTitle>
        <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>
            Code <strong style={{ color: '#fde047' }}>{shortCode}</strong>
          </span>
          <span style={{ opacity: 0.45 }}>|</span>
          {mode === 'hp' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HeartIcon style={{ width: 14, height: 14 }} /> HP
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
    <BtnRow>
      <Button variant="primary" size="sm" onClick={onJoin}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <UserGroupIcon style={{ width: 16, height: 16 }} />
          Join as guest
        </span>
      </Button>
    </BtnRow>
  </Shell>
)

export const DuelLobbyHostStartPanel: FC<{ onStart: () => void }> = ({ onStart }) => (
  <Shell>
    <LobbyHead>
      <PlayIcon className="tile" />
      <div>
        <LobbyTitle>Opponent ready</LobbyTitle>
        <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SparklesIcon style={{ width: 14, height: 14, opacity: 0.85 }} />
          Start when both players are ready — Street View loads after you begin.
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
)

export const DuelLobbyGuestWaitingPanel: FC = () => (
  <Shell>
    <LobbyHead>
      <ClockIcon className="tile" />
      <div>
        <LobbyTitle>Waiting for host</LobbyTitle>
        <Subtle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SparklesIcon style={{ width: 14, height: 14, opacity: 0.75 }} /> Hang tight — they start the match.
        </Subtle>
      </div>
    </LobbyHead>
  </Shell>
)
