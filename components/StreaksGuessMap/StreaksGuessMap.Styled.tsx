import styled, { css, keyframes } from 'styled-components'

type StyledProps = {
  mapHeight: number
  mapWidth: number
  mobileMapOpen?: boolean
  mapDimmed?: boolean
}

const slideUpAnim = keyframes`
  to {
    bottom: 0px;
  }
`

const StyledStreaksGuessMap = styled.div<StyledProps>`
  .guessMapWrapper {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 3;
    /* Match standard GuessMap width behavior */
    width: min(
      calc(${({ mapWidth }) => mapWidth}vmin * 1.18),
      calc(100vw - 32px)
    );
    min-width: 0;
    max-width: calc(100vw - 24px);

    @media (max-width: 720px) and (min-width: 601px) {
      width: min(
        calc(${({ mapWidth }) => mapWidth}vmin * 1.7),
        min(352px, calc(100vw - 24px))
      );
    }

    @media (max-width: 780px) and (min-width: 721px) {
      width: min(
        calc(${({ mapWidth }) => mapWidth}vmin * 1.53),
        min(344px, calc(100vw - 24px))
      );
    }

    @media (max-width: 840px) and (min-width: 781px) {
      width: min(
        calc(${({ mapWidth }) => mapWidth}vmin * 1.36),
        min(356px, calc(100vw - 26px))
      );
    }

    @media (max-width: 900px) and (min-width: 841px) {
      width: min(
        calc(${({ mapWidth }) => mapWidth}vmin * 1.24),
        min(368px, calc(100vw - 28px))
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
    opacity: ${({ mapDimmed, mobileMapOpen }) => (mobileMapOpen || !mapDimmed ? 1 : 0.63)};
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

      img {
        height: 14px;
      }

      span {
        margin-top: 3px;
      }
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
      height: 12px;
      color: var(--background1);

      path {
        stroke-width: 3;
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

export default StyledStreaksGuessMap
