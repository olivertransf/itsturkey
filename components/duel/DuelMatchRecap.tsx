import { FC, useMemo } from 'react'
import { HomeIcon, RefreshIcon } from '@heroicons/react/outline'
import { Button } from '@components/system'
import type { DuelClientPayload, DuelRoundResultClient } from './duelApiTypes'
import { duelAvatarAccent } from './duelHudAvatar'
import DuelFinalResultsMap from './DuelFinalResultsMap'
import DuelRoundOverview from './DuelRoundOverview'
import type { LocationType } from '@types'
import styled from 'styled-components'

export type DuelMatchRecapView = 'all' | number

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: min(1100px, 100%);
  margin-inline: auto;
  padding: 12px var(--pad-card-sm) 20px;
  box-sizing: border-box;
  color: var(--text-primary);

  @media (max-width: 560px) {
    padding: 10px 12px 16px;
    gap: 8px;
  }
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 4px;
`

const MetaLine = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(240, 244, 255, 0.92);
  line-height: 1.35;
  min-width: 0;
`

const OutcomeBanner = styled.div<{ $tone: 'win' | 'loss' | 'tie' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
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
      : 'rgba(51, 65, 85, 0.45)'};
  color: ${({ $tone }) =>
    $tone === 'win' ? '#fde047' : $tone === 'loss' ? '#fecaca' : $tone === 'tie' ? '#e2e8f0' : '#e2e8f0'};
`

const RoundSelectTrack = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => Math.max($count, 1)}, minmax(0, 1fr));
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.28);
  width: 100%;
`

const RoundTab = styled.button<{ $active?: boolean; $accent: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 6px 8px;
  border-radius: 9px;
  border: 1px solid
    ${({ $active, $accent }) => ($active ? $accent : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ $active, $accent }) =>
    $active ? `color-mix(in srgb, ${$accent} 22%, transparent)` : 'rgba(255, 255, 255, 0.03)'};
  color: ${({ $active }) => ($active ? '#f8fafc' : 'rgba(226, 232, 240, 0.72)')};
  cursor: pointer;

  &:hover {
    border-color: ${({ $accent }) => $accent};
    color: #f8fafc;
  }

  .round-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  .winner-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: ${({ $accent }) => $accent};
    flex-shrink: 0;
  }
`

const ActionRow = styled.div<{ $two?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $two }) => ($two ? '1fr 1fr' : '1fr')};
  gap: 12px;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
  margin: 10px auto 0;
  padding: 0 12px;
  box-sizing: border-box;

  > * {
    width: 100%;
    min-width: 0;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`

const RematchHint = styled.p`
  margin: 2px auto 0;
  max-width: 520px;
  text-align: center;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-muted);
  padding: 0 12px;
`

const AllMapFill = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
`

type Props = {
  payload: DuelClientPayload
  viewerRole?: DuelClientPayload['viewerRole']
  selectedView: DuelMatchRecapView
  onSelectView: (view: DuelMatchRecapView) => void
  headline: string
  tone: 'win' | 'loss' | 'tie' | 'neutral'
  onHome: () => void
  onPlayAgain?: () => void
  playAgainLoading?: boolean
}

function buildAllRoundsResult(payload: DuelClientPayload): DuelRoundResultClient {
  const rounds = payload.roundResults
  const hostPts = rounds.reduce((s, r) => s + r.hostPoints, 0)
  const guestPts = rounds.reduce((s, r) => s + r.guestPoints, 0)
  const hostDist = rounds.reduce((s, r) => s + (r.hostNoGuess ? 0 : r.hostDistanceMetric), 0)
  const guestDist = rounds.reduce((s, r) => s + (r.guestNoGuess ? 0 : r.guestDistanceMetric), 0)

  const winner: DuelRoundResultClient['winner'] =
    payload.outcome === 'host_win' ? 'host' : payload.outcome === 'guest_win' ? 'guest' : 'tie'

  return {
    roundIndex: -1,
    hostGuess: null,
    guestGuess: null,
    hostNoGuess: false,
    guestNoGuess: false,
    hostDistanceMetric: hostDist,
    guestDistanceMetric: guestDist,
    hostPoints: hostPts,
    guestPoints: guestPts,
    winner,
    damageMultiplierUsed: 0,
    damageToHost: 0,
    damageToGuest: 0,
    hostHpAfter: Math.max(0, payload.host.hp),
    guestHpAfter: Math.max(0, payload.guest.hp),
  }
}

const DuelMatchRecap: FC<Props> = ({
  payload,
  viewerRole,
  selectedView,
  onSelectView,
  headline,
  tone,
  onHome,
  onPlayAgain,
  playAgainLoading,
}) => {
  const rounds = payload.roundResults
  const hostAccent = duelAvatarAccent(payload.playerAvatars.host)
  const guestAccent = duelAvatarAccent(payload.playerAvatars.guest)
  const allAccent = '#9dc8f0'

  const selected =
    typeof selectedView === 'number' ? rounds[selectedView] ?? null : null
  const actual = useMemo(() => {
    if (!selected) return null
    return payload.roundLocations[selected.roundIndex] ?? null
  }, [selected, payload.roundLocations])

  const allResult = useMemo(() => buildAllRoundsResult(payload), [payload])
  const allActual: LocationType = useMemo(() => {
    return (
      payload.roundLocations[0] ??
      payload.lastRoundActualLocation ?? {
        lat: 20,
        lng: 0,
      }
    )
  }, [payload.roundLocations, payload.lastRoundActualLocation])

  const winnerTier: 'host' | 'guest' | 'tie' =
    payload.outcome === 'host_win' ? 'host' : payload.outcome === 'guest_win' ? 'guest' : 'tie'

  const vr = payload.viewerRole
  const youReady =
    vr === 'host' ? payload.rematchReady.host : vr === 'guest' ? payload.rematchReady.guest : false
  const oppReady =
    vr === 'host' ? payload.rematchReady.guest : vr === 'guest' ? payload.rematchReady.host : false
  const showRematch = Boolean(vr && onPlayAgain)
  const tabCount = rounds.length + 1

  const mapLabel = payload.mapDetails?.name

  return (
    <Root>
      <TopBar>
        <MetaLine>
          Match summary
          {mapLabel ? ` · ${mapLabel}` : ''}
          {payload.mode === 'hp' ? ' · HP duel' : ' · Points duel'}
        </MetaLine>
        <OutcomeBanner $tone={tone}>{headline}</OutcomeBanner>
      </TopBar>

      <RoundSelectTrack role="tablist" aria-label="Match view" $count={tabCount}>
        <RoundTab
          type="button"
          role="tab"
          aria-selected={selectedView === 'all'}
          $active={selectedView === 'all'}
          $accent={allAccent}
          onClick={() => onSelectView('all')}
        >
          <span className="round-label">All</span>
          <span className="winner-dot" aria-hidden />
        </RoundTab>
        {rounds.map((r, idx) => {
          const accent =
            r.winner === 'tie' ? '#94a3b8' : r.winner === 'host' ? hostAccent : guestAccent
          return (
            <RoundTab
              key={r.roundIndex}
              type="button"
              role="tab"
              aria-selected={selectedView === idx}
              $active={selectedView === idx}
              $accent={accent}
              onClick={() => onSelectView(idx)}
            >
              <span className="round-label">R{r.roundIndex + 1}</span>
              <span className="winner-dot" aria-hidden />
            </RoundTab>
          )
        })}
      </RoundSelectTrack>

      {selectedView === 'all' ? (
        <DuelRoundOverview
          variant="compact"
          tallMap
          inlineHeader
          skipDamageAnim
          roundOneBased={1}
          totalRounds={payload.totalRounds}
          multiplierMode={payload.multiplierMode}
          mode={payload.mode}
          actual={allActual}
          result={allResult}
          hostMaxHp={payload.startingHpHost}
          guestMaxHp={payload.startingHpGuest}
          viewerRole={viewerRole}
          sessionMapId={payload.mapId}
          hostPlayerName={payload.playerNames.host}
          guestPlayerName={payload.playerNames.guest}
          playerAvatars={payload.playerAvatars}
          headerLabel={`All rounds · ${rounds.length} played`}
          winnerLabelOverride={headline}
          winnerTierOverride={winnerTier}
          centerLabel={payload.mode === 'hp' ? 'Final health' : 'Final scores'}
          centerValue={`${rounds.length} rounds`}
          customMap={
            <AllMapFill>
              <DuelFinalResultsMap payload={payload} embedded />
            </AllMapFill>
          }
        />
      ) : selected && actual ? (
        <DuelRoundOverview
          variant="compact"
          tallMap
          inlineHeader
          roundOneBased={selected.roundIndex + 1}
          totalRounds={payload.totalRounds}
          multiplierMode={payload.multiplierMode}
          mode={payload.mode}
          actual={actual}
          result={selected}
          hostMaxHp={payload.startingHpHost}
          guestMaxHp={payload.startingHpGuest}
          viewerRole={viewerRole}
          sessionMapId={payload.mapId}
          hostPlayerName={payload.playerNames.host}
          guestPlayerName={payload.playerNames.guest}
          playerAvatars={payload.playerAvatars}
        />
      ) : null}

      {showRematch ? (
        <RematchHint>
          {youReady
            ? oppReady
              ? 'Starting the next match…'
              : 'You chose Play again. Waiting for your opponent to tap it too — same map and rules.'
            : oppReady
            ? 'Your opponent is ready for a rematch. Tap Play again to continue with the same settings.'
            : 'Both players must tap Play again to start another match with the same settings.'}
        </RematchHint>
      ) : null}

      <ActionRow $two={showRematch}>
        {showRematch ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlayAgain}
            disabled={youReady || !!playAgainLoading}
            isLoading={!!playAgainLoading}
            spinnerSize={24}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <RefreshIcon style={{ width: 20, height: 20 }} />
              Play again
            </span>
          </Button>
        ) : null}
        <Button variant="solidGray" size="lg" onClick={onHome}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <HomeIcon style={{ width: 20, height: 20 }} />
            Home
          </span>
        </Button>
      </ActionRow>
    </Root>
  )
}

export default DuelMatchRecap
