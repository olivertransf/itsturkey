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
    z-index: 3;
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
      background-color: var(--background1);
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
    border-radius: 4px;
    transition: opacity 0.15s ease, width 0.15s ease, aspect-ratio 0.15s ease;
    position: relative;
    margin-bottom: 10px;
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
      background-color: rgba(0, 0, 0, 0.75);
      border-radius: 4px;
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
    gap: 8px;
    background-color: rgba(0, 0, 0, 0.55);
    width: fit-content;
    padding: 8px;
    border-radius: 4px 4px 0 0;

    @media ${PHONE_GUESS_MAP_MQ} {
      display: none;
    }
  }

  .controlBtn {
    height: 28px;
    width: 28px;
    background-color: #fff;
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
      color: var(--background1);

      path {
        stroke-width: 3;
      }
    }

    &.zoom-glyph {
      font-size: 16px;
      font-weight: 800;
      line-height: 1;
      color: var(--background1);

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
      background-color: var(--background2);
      height: 44px;
      width: 44px;
      border-radius: 50%;
      border: 1px solid var(--background1);
      z-index: 2;

      ${({ mobileMapOpen }) => !mobileMapOpen && 'display: none'};
    }

    svg {
      height: 22px;
      color: var(--color2);
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
