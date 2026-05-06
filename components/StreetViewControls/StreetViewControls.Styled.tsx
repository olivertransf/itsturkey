import styled, { css } from 'styled-components'

const StyledStreetViewControls = styled.div<{ $hudPrimaryStyle?: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;

  .primary-controls {
    position: absolute;
    left: 10px;
    bottom: 100px;
    display: grid;
    gap: 15px;
    pointer-events: auto;
  }

  .exit-control {
    position: absolute;
    top: 10px;
    left: 10px;
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

    ${({ $hudPrimaryStyle }) =>
      $hudPrimaryStyle
        ? css`
            height: 44px;
            width: 44px;
            border-radius: var(--radius-md, 10px);
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);

            :hover {
              background: rgba(255, 255, 255, 0.1);
            }

            svg {
              height: 22px;
              width: 22px;
              color: rgba(244, 244, 245, 0.92);
            }
          `
        : css`
            height: 48px;
            width: 48px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.15);

            :hover {
              background-color: rgba(0, 0, 0, 0.75);
            }

            svg {
              height: 22px;
              width: 22px;
              color: #fff;
            }
          `}
  }
`

export default StyledStreetViewControls
