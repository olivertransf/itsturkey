import styled from 'styled-components'
import { PHONE_GUESS_MAP_MQ } from '@utils/constants/breakpoints'

type StyledProps = {
  showMap?: boolean
}

const StyledStreetView = styled.div<StyledProps>`
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  #streetview,
  .streetview-pano {
    flex: 1;
    min-height: 0;
    height: 100%;
    width: 100%;
    position: relative;
  }

  /* Above Google canvas, below HUD / guess map (z-index 2–3). Blocks drag pan/zoom. */
  .streetview-interaction-block {
    position: absolute;
    inset: 0;
    z-index: 1;
    touch-action: none;
    cursor: default;
    user-select: none;
  }

  .toggle-map-button {
    display: none;

    @media ${PHONE_GUESS_MAP_MQ} {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--mediumPurple);
      border: 2px solid var(--color2);
      height: 72px;
      width: 72px;
      border-radius: 50%;
      position: absolute;
      bottom: max(28px, calc(16px + env(safe-area-inset-bottom, 0px)));
      right: max(12px, env(safe-area-inset-right, 0px));
      z-index: 2;
      -webkit-tap-highlight-color: transparent;

      svg {
        height: 36px;
        color: var(--color2);

        path {
          stroke-width: 1.5px;
        }
      }
    }
  }

  .country-tip-corner {
    position: absolute;
    right: 20px;
    bottom: 108px;
    z-index: 4;
    max-width: min(320px, calc(100vw - 40px));

    @media (max-width: 900px) {
      right: 14px;
      bottom: 96px;
      max-width: min(280px, calc(100vw - 24px));
    }

    @media ${PHONE_GUESS_MAP_MQ} {
      right: max(12px, env(safe-area-inset-right, 0px));
      bottom: max(112px, calc(96px + env(safe-area-inset-bottom, 0px)));
      max-width: min(280px, calc(100vw - 100px));
    }
  }

  a[href^="https://maps.google.com/maps"]
  {
    pointer-events: none;
  }
`

export default StyledStreetView
