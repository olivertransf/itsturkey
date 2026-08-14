import styled, { css } from 'styled-components'
import { PHONE_GUESS_MAP_MQ } from '@utils/constants/breakpoints'

const StyledStreetViewControls = styled.div<{ $hudPrimaryStyle?: boolean }>`
  position: absolute;
  inset: 0;
  z-index: var(--z-hud);
  pointer-events: none;

  .primary-controls {
    position: absolute;
    left: max(10px, env(safe-area-inset-left));
    bottom: max(100px, calc(88px + env(safe-area-inset-bottom)));
    display: grid;
    gap: var(--space-2);
    pointer-events: auto;

    @media ${PHONE_GUESS_MAP_MQ} {
      bottom: max(120px, calc(100px + env(safe-area-inset-bottom)));
    }

    ${({ $hudPrimaryStyle }) =>
      $hudPrimaryStyle
        ? css`
            padding: var(--space-2);
            border-radius: var(--radius-lg);
            background: var(--hud-surface);
            border: 1px solid var(--border-strong);
            backdrop-filter: blur(10px) saturate(135%);
            box-shadow: var(--shadow-sm);
          `
        : css`
            gap: var(--space-3);
          `}
  }

  .exit-control {
    position: absolute;
    top: max(10px, env(safe-area-inset-top, 0px));
    left: max(10px, env(safe-area-inset-left, 0px));
    pointer-events: auto;
  }

  .control-button-wrapper {
    position: relative;
  }

  .control-button-wrapper .control-button,
  .exit-control .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    height: var(--control-height-md);
    width: var(--control-height-md);
    border-radius: var(--radius-md);
    background: var(--hud-surface);
    border: 1px solid var(--border-strong);
    backdrop-filter: blur(10px);
    transition: background-color var(--duration-fast) var(--ease);

    :hover {
      background: var(--hud-surface-hover);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }

    svg {
      height: var(--icon-lg);
      width: var(--icon-lg);
      color: var(--text-primary);
    }
  }
`

export default StyledStreetViewControls
