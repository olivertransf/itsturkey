import { useCallback, useMemo, useState } from 'react'
import DuelMatchRecap from '@components/duel/DuelMatchRecap'
import type { DuelMatchRecapView } from '@components/duel/DuelMatchRecap'
import DuelRoundOverview from '@components/duel/DuelRoundOverview'
import LAST_FINISHED_DUEL_PAYLOAD from '@components/duel/fixtures/lastFinishedDuelPayload'
import type { DuelClientPayload } from '@components/duel/duelApiTypes'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { GamifiedCenterStage } from '@styles/GamifiedHubShell.Styled'
import type { PageType } from '@types'
import styled from 'styled-components'

type EndPhase = 'final_damage' | 'summary'

const PreviewBar = styled.div`
  position: fixed;
  z-index: 40;
  top: 12px;
  right: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(12, 14, 20, 0.88);
  backdrop-filter: blur(10px);
  color: var(--text-muted);
  font-size: 12px;
  max-width: min(420px, calc(100vw - 24px));
`

const PreviewBtn = styled.button<{ $active?: boolean }>`
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(157, 200, 240, 0.55)' : 'rgba(255, 255, 255, 0.14)')};
  background: ${({ $active }) => ($active ? 'rgba(110, 178, 232, 0.2)' : 'rgba(255, 255, 255, 0.06)')};
  color: ${({ $active }) => ($active ? '#e8f4fc' : 'var(--text-primary)')};
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const DuelEndPreviewPage: PageType = () => {
  const payload = useMemo(() => LAST_FINISHED_DUEL_PAYLOAD as DuelClientPayload, [])
  const [endPhase, setEndPhase] = useState<EndPhase>('final_damage')
  const [recapView, setRecapView] = useState<DuelMatchRecapView>('all')

  const advanceToMatchSummary = useCallback(() => {
    setEndPhase('summary')
  }, [])

  const you = payload.viewerRole
  const isPlayer = you === 'host' || you === 'guest'
  const youWon =
    !!payload.outcome &&
    payload.outcome !== 'tie' &&
    ((payload.outcome === 'host_win' && you === 'host') ||
      (payload.outcome === 'guest_win' && you === 'guest'))

  const headline =
    payload.outcome === 'tie'
      ? 'Tie game'
      : youWon
      ? 'You won'
      : isPlayer
      ? 'You lost'
      : payload.outcome === 'host_win'
      ? `${payload.playerNames.host} wins`
      : payload.outcome === 'guest_win'
      ? `${payload.playerNames.guest} wins`
      : 'Match finished'

  const finishTone =
    payload.outcome === 'tie'
      ? ('tie' as const)
      : !isPlayer
      ? ('neutral' as const)
      : youWon
      ? ('win' as const)
      : ('loss' as const)

  const showFinalDamage =
    endPhase === 'final_damage' &&
    payload.lastRoundResult != null &&
    payload.lastRoundActualLocation != null

  return (
    <StyledMultiGamePage>
      <Meta title="Duel end preview" />

      <PreviewBar>
        <span>
          Preview · {payload.shortCode} · {payload.playerNames.host} vs {payload.playerNames.guest}
        </span>
        <PreviewBtn
          type="button"
          $active={endPhase === 'final_damage'}
          onClick={() => setEndPhase('final_damage')}
        >
          Final damage
        </PreviewBtn>
        <PreviewBtn
          type="button"
          $active={endPhase === 'summary'}
          onClick={() => setEndPhase('summary')}
        >
          Summary
        </PreviewBtn>
      </PreviewBar>

      {showFinalDamage && payload.lastRoundResult && payload.lastRoundActualLocation ? (
        <DuelRoundOverview
          variant="fullscreen"
          roundOneBased={payload.lastRoundResult.roundIndex + 1}
          totalRounds={payload.totalRounds}
          multiplierMode={payload.multiplierMode}
          mode={payload.mode}
          actual={payload.lastRoundActualLocation}
          result={payload.lastRoundResult}
          hostMaxHp={payload.startingHpHost}
          guestMaxHp={payload.startingHpGuest}
          viewerRole={you === 'spectator' ? null : you}
          sessionMapId={payload.mapId}
          plonkMapLabel={payload.mapDetails?.name}
          hostPlayerName={payload.playerNames.host}
          guestPlayerName={payload.playerNames.guest}
          playerAvatars={payload.playerAvatars}
          continueLabel="See match summary"
          onContinue={advanceToMatchSummary}
        />
      ) : null}

      {endPhase === 'summary' ? (
        <GamifiedCenterStage>
          <div style={{ width: '100%', maxWidth: 'min(1100px, 100%)', marginBottom: 8 }}>
            <PageBackLink href="/" label="Back to home" compact />
          </div>
          <DuelMatchRecap
            payload={payload}
            viewerRole={you}
            selectedView={recapView}
            onSelectView={setRecapView}
            headline={headline}
            tone={finishTone}
            onHome={() => undefined}
            onPlayAgain={() => undefined}
          />
        </GamifiedCenterStage>
      ) : null}
    </StyledMultiGamePage>
  )
}

export default DuelEndPreviewPage
