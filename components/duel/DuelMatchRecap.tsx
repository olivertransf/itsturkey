import { FC, useMemo } from 'react'
import type { DuelClientPayload } from './duelApiTypes'
import DuelRoundOverview from './DuelRoundOverview'
import styled from 'styled-components'

const RecapDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 2px 0 16px;
`

const RoundPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 0 0 16px;
`

const RoundPill = styled.button<{ $active?: boolean }>`
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(157, 200, 240, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(110, 178, 232, 0.18)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $active }) => ($active ? '#e8f4fc' : 'var(--text-primary)')};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: rgba(157, 200, 240, 0.4);
  }
`

const RecapBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
`

type Props = {
  payload: DuelClientPayload
  viewerRole?: DuelClientPayload['viewerRole']
  selectedIdx: number
  onSelectRound: (idx: number) => void
}

const DuelMatchRecap: FC<Props> = ({ payload, viewerRole, selectedIdx, onSelectRound }) => {
  const rounds = payload.roundResults

  const selected = rounds[selectedIdx] ?? null
  const actual = useMemo(() => {
    if (!selected) return null
    return payload.roundLocations[selected.roundIndex] ?? null
  }, [selected, payload.roundLocations])

  if (!selected || !actual) return null

  return (
    <RecapBody>
      <RecapDivider />
      {rounds.length > 1 ? (
        <RoundPills>
          {rounds.map((r, idx) => (
            <RoundPill key={r.roundIndex} $active={idx === selectedIdx} type="button" onClick={() => onSelectRound(idx)}>
              Round {r.roundIndex + 1}
            </RoundPill>
          ))}
        </RoundPills>
      ) : null}

      <DuelRoundOverview
        variant="compact"
        finishRecap
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
        plonkMapLabel={payload.mapDetails?.name}
        hostPlayerName={payload.playerNames.host}
        guestPlayerName={payload.playerNames.guest}
        playerAvatars={payload.playerAvatars}
        omitScoreRow
      />
    </RecapBody>
  )
}

export default DuelMatchRecap
