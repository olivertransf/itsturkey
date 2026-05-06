import styled from 'styled-components'

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

  .toggle-map-button {
    display: none;

    @media (max-width: 600px) {
      display: block;
      background-color: var(--mediumPurple);
      border: 2px solid var(--color2);
      height: 80px;
      width: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 36px;
      right: 12px;
      z-index: 2;

      svg {
        height: 40px;
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
  }

  a[href^="https://maps.google.com/maps"]
  {
    pointer-events: none;
  }
`

export default StyledStreetView
