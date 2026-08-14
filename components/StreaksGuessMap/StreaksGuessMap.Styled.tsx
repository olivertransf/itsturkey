import styled, { css, keyframes } from 'styled-components'
import { PHONE_GUESS_MAP_MQ } from '@utils/constants/breakpoints'

type StyledProps = {
  mapHeight: number
  mapWidth: number
  mobileMapOpen?: boolean
  mapDimmed?: boolean
  tabletTouch?: boolean
  mapExpanded?: boolean
}

const slideUpAnim = keyframes`
  to {
    bottom: 0px;
  }
`

const StyledStreaksGuessMap = styled.div<StyledProps>`
  .guessMapWrapper {
    position: absolute;
    bottom: max(20px, env(safe-area-inset-bottom, 0px));
    right: max(20px, env(safe-area-inset-right, 0px));
    z-index: calc(var(--z-hud) + 1);
    width: min(
      calc(${({ mapWidth }) => mapWidth}vmin * 1.18),
      calc(100vw - 32px)
    );
    min-width: 0;
    max-width: calc(100vw - 24px);
    touch-action: manipulation;

    ${({ tabletTouch }) =>
      tabletTouch &&
      css`
        max-width: min(860px, calc(100vw - 28px));
      `}

    @media ${PHONE_GUESS_MAP_MQ} {
      display: flex;
      flex-direction: column;
      height: min(62dvh, 720px);
      width: 100%;
      max-width: 100%;
      bottom: -100%;
      right: 0;
      background-color: var(--bg-primary);
      gap: 0;

      ${({ mobileMapOpen }) =>
        mobileMapOpen &&
        css`
          animation: ${slideUpAnim} 0.4s ease forwards;
        `}
    }
  }

  .map {
    width: 100%;
    height: auto;
    aspect-ratio: ${({ mapWidth, mapHeight }) => `${mapWidth} / ${mapHeight}`};
    opacity: ${({ mapDimmed, mobileMapOpen }) => (mobileMapOpen || !mapDimmed ? 1 : 0.63)};
    border-radius: var(--radius-md);
    transition: opacity var(--duration-fast) var(--ease), width var(--duration-fast) var(--ease), aspect-ratio var(--duration-fast) var(--ease);
    position: relative;
    margin-bottom: var(--space-3);
    overflow: hidden;
    touch-action: none;

    @media ${PHONE_GUESS_MAP_MQ} {
      aspect-ratio: unset;
      height: 100%;
      width: 100%;
      border-radius: 0;
      opacity: 1;
      margin-bottom: 0;
    }

    .selected-country {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background-color: var(--hud-surface);
      border-radius: var(--radius-md);
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      z-index: 2;

      img {
        height: 14px;
      }

      span {
        margin-top: 3px;
      }
    }
  }

  .expand-map-hit {
    position: absolute;
    inset: 0;
    z-index: 5;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background-color: var(--hud-surface);
    width: fit-content;
    padding: var(--space-2);
    border-radius: var(--radius-md) var(--radius-md) 0 0;

    @media ${PHONE_GUESS_MAP_MQ} {
      display: none;
    }
  }

  .controlBtn {
    height: var(--icon-lg);
    width: var(--icon-lg);
    background-color: var(--text-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;

    &.increase {
      transform: rotate(-135deg);
    }

    &.decrease {
      transform: rotate(45deg);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
    }

    svg {
      height: 14px;
      color: var(--bg-primary);

      path {
        stroke-width: 3;
      }
    }

    &.zoom-glyph {
      font-size: 16px;
      font-weight: 800;
      line-height: 1;
      color: var(--bg-primary);

      svg {
        display: none;
      }
    }
  }

  .close-map-button {
    display: none;

    @media ${PHONE_GUESS_MAP_MQ} {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: max(10px, env(safe-area-inset-top, 0px));
      right: max(10px, env(safe-area-inset-right, 0px));
      background-color: var(--hud-surface);
      height: var(--control-height-md);
      width: var(--control-height-md);
      border-radius: 50%;
      border: 1px solid var(--border-strong);
      z-index: calc(var(--z-hud) + 1);

      ${({ mobileMapOpen }) => !mobileMapOpen && 'display: none'};
    }

    svg {
      height: 22px;
      color: var(--text-primary);
    }
  }

  .submit-button-wrapper {
    @media ${PHONE_GUESS_MAP_MQ} {
      padding: 10px 16px calc(12px + env(safe-area-inset-bottom, 0px));
      flex-shrink: 0;

      ${({ mobileMapOpen }) => !mobileMapOpen && 'display: none'};
    }
  }
`

export default StyledStreaksGuessMap
