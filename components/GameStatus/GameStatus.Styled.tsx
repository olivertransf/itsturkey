import styled from 'styled-components'
import { PHONE_GUESS_MAP_MQ } from '@utils/constants/breakpoints'

type StyledProps = {
  $compact?: boolean
}

const StyledGameStatus = styled.div<StyledProps>`
  background-color: var(--hud-surface);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  position: absolute;
  top: max(12px, env(safe-area-inset-top, 0px));
  right: max(12px, env(safe-area-inset-right, 0px));
  z-index: var(--z-hud);
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: var(--font-body);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-sm);

  .infoSection {
    padding: var(--space-4) var(--space-5);

    &.mapName {
      @media (max-width: 960px) {
        display: none;
      }
    }
  }

  .streak-section {
    padding: var(--space-3) var(--space-4);
    padding-left: var(--space-3);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 1.375rem;

    svg {
      height: var(--icon-lg);
      color: var(--warning);
    }
  }

  .label {
    color: var(--text-muted);
    font-size: var(--font-compact);
    margin-bottom: var(--space-1);
    font-weight: 600;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
  }

  .value {
    color: var(--text-primary);

    &.time {
      font-family: var(--font-mono);
      font-size: 1.375rem;
      margin-top: 0;
    }
  }

  ${({ $compact }) =>
    $compact &&
    `
    top: max(44px, calc(12px + env(safe-area-inset-top, 0px)));
    right: max(10px, env(safe-area-inset-right, 0px));

    .infoSection {
      padding: 8px 10px;
    }

    .value.time {
      font-size: 1rem;
    }
  `}

  @media ${PHONE_GUESS_MAP_MQ} {
    top: max(10px, env(safe-area-inset-top, 0px));
    right: max(10px, env(safe-area-inset-right, 0px));

    .infoSection {
      padding: 8px 10px;
    }

    .value.time {
      font-size: 1rem;
    }
  }
`

export default StyledGameStatus
