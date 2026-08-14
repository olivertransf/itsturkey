import { FC } from 'react'
import styled, { keyframes } from 'styled-components'

export type WatcherChip = {
  id: string
  name: string
}

type Props = {
  watchers: WatcherChip[]
  /** Corner placement within the Street View / duel stage. */
  corner?: 'top-left' | 'top-right'
  /** Sit under the duel HUD instead of overlapping it. */
  belowHud?: boolean
  className?: string
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`

const Root = styled.div<{ $corner: 'top-left' | 'top-right'; $belowHud?: boolean }>`
  position: absolute;
  top: ${({ $belowHud }) =>
    $belowHud
      ? 'max(78px, calc(70px + env(safe-area-inset-top, 0px)))'
      : 'max(10px, env(safe-area-inset-top, 0px))'};
  ${({ $corner }) =>
    $corner === 'top-left'
      ? 'left: max(10px, env(safe-area-inset-left, 0px));'
      : 'right: max(10px, env(safe-area-inset-right, 0px));'}
  z-index: calc(var(--z-hud) + 2);
  display: flex;
  flex-direction: column;
  align-items: ${({ $corner }) => ($corner === 'top-left' ? 'flex-start' : 'flex-end')};
  gap: 6px;
  pointer-events: none;
  max-width: min(220px, calc(100vw - 24px));
`

const Chip = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--hud-surface);
  border: 1px solid rgba(251, 191, 36, 0.35);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  color: #fde68a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  animation: ${fadeIn} 0.22s ease-out;
  max-width: 100%;

  .name {
    color: #fef3c7;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  .verb {
    color: rgba(253, 230, 138, 0.78);
    font-weight: 600;
    flex-shrink: 0;
  }
`

const WatchersIndicator: FC<Props> = ({
  watchers,
  corner = 'top-left',
  belowHud = false,
  className,
}) => {
  if (!watchers.length) return null

  const shown = watchers.slice(0, 3)
  const extra = watchers.length - shown.length

  return (
    <Root className={className} $corner={corner} $belowHud={belowHud} aria-live="polite">
      {shown.map((w) => (
        <Chip key={w.id}>
          <span className="name">{w.name}</span>
          <span className="verb">watching</span>
        </Chip>
      ))}
      {extra > 0 ? (
        <Chip>
          <span className="name">+{extra} more</span>
          <span className="verb">watching</span>
        </Chip>
      ) : null}
    </Root>
  )
}

export default WatchersIndicator
