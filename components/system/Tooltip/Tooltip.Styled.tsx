import styled from 'styled-components'

type StyledProps = {
  top?: number
  left?: number
  position: 'top' | 'right' | 'bottom' | 'left'
}

const StyledTooltip = styled.div<StyledProps>`
  position: absolute;
  top: ${({ top }) => (top ? `${top}px` : '50%')};
  left: ${({ left }) => (left ? `${left}px` : '100%')};
  z-index: var(--z-tooltip);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--hud-surface-hover);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-weight: 500;
  font-size: var(--font-compact);
  color: var(--text-primary);
  width: fit-content;
  max-width: 240px;
  white-space: nowrap;
  pointer-events: none;
  transform: translateY(-50%) scale(1);
  margin-left: var(--space-3);
  box-shadow: var(--shadow-sm);

  ${({ position }) =>
    position === 'bottom' &&
    `
     .arrow {
      left: 50%;
      bottom: -3px;
      transform: translateX(-50%);
      position: absolute;

      &::before {
        content: '';
        background: none;
        border-bottom: 6px solid transparent;
        border-right: 6px solid var(--hud-surface-hover);
        border-top: 6px solid transparent;
        height: 0;
        margin-top: -6px;
        position: fixed;
        visibility: visible;
        width: 0;
        transform: rotate(-90deg);
      }
    }
  `}

  ${({ position }) =>
    position === 'left' &&
    `
     .arrow {
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      position: absolute;

      &::before {
        content: '';
        background: none;
        border-bottom: 6px solid transparent;
        border-right: 6px solid var(--hud-surface-hover);
        border-top: 6px solid transparent;
        height: 0;
        margin-top: -6px;
        position: fixed;
        visibility: visible;
        width: 0;
        transform: rotate(0deg);
      }
    }
  `}
`

export default StyledTooltip
