import styled, { css, keyframes } from 'styled-components'
import { GUESS_MAP_MAX_WIDTH_PX } from '@utils/helpers/getGuessMapSize'

type StyledProps = {
  mapHeight: number
  mapWidth: number
  mobileMapOpen?: boolean
  mapDimmed?: boolean
  duelLayout?: boolean
}

const slideUpAnim = keyframes`
  to {
    bottom: 0px;
  }
`

const StyledGuessMap = styled.div<StyledProps>`
  .guessMapWrapper {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 3;
    /* vmin + cap; extra width factor on small tablets so corner map starts smaller */
    width: min(
      calc(${({ mapWidth }) => mapWidth}vmin * 0.9),
      min(${GUESS_MAP_MAX_WIDTH_PX}px, calc(100vw - 32px))
    );
    min-width: 0;
    max-width: calc(100vw - 24px);

    @media (max-width: 900px) and (min-width: 601px) {
      width: min(
        calc(${({ mapWidth }) => mapWidth}vmin * 0.74),
        min(300px, calc(100vw - 28px))
      );
    }

    @media (max-width: 720px) and (min-width: 601px) {
      width: min(
        calc(${({ mapWidth }) => mapWidth}vmin * 0.62),
        min(252px, calc(100vw - 24px))
      );
    }

    @media (max-width: 600px) {
      display: flex;
      flex-direction: column;
      height: 60vh;
      height: 60dvh;
      width: 100%;
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
    opacity: ${({ mapDimmed, mobileMapOpen, duelLayout }) => {
      if (mobileMapOpen || !mapDimmed) return 1
      return duelLayout ? 0.88 : 0.63
    }};
    border-radius: 4px;
    transition: opacity 0.15s ease, width 0.15s ease;
    position: relative;
    margin-bottom: 10px;

    @media (max-width: 600px) {
      aspect-ratio: unset;
      height: 100%;
      width: 100%;
      border-radius: 0;
      opacity: 1;
    }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(0, 0, 0, 0.5);
    width: fit-content;
    padding: 6px;
    border-radius: 4px 4px 0 0;

    @media (max-width: 1100px) {
      display: none;
    }
  }

  .controlBtn {
    height: 20px;
    width: 20px;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.increase:not(.duel-glyph) {
      transform: rotate(-135deg);
    }

    &.decrease:not(.duel-glyph) {
      transform: rotate(45deg);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
    }

    svg {
      height: 12px;
      color: var(--background1);

      path {
        stroke-width: 3;
      }
    }

    &.duel-glyph {
      font-size: 12px;
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

    @media (max-width: 600px) {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: var(--background2);
      height: 32px;
      width: 32px;
      border-radius: 50%;
      border: 1px solid var(--background1);

      ${({ mobileMapOpen }) => !mobileMapOpen && 'display: none'};
    }

    svg {
      height: 20px;
      color: var(--color2);
    }
  }

  .submit-button-wrapper {
    @media (max-width: 600px) {
      padding: 6px 16px 16px 16px;

      ${({ mobileMapOpen }) => !mobileMapOpen && 'display: none'};
    }
  }
`

export default StyledGuessMap
