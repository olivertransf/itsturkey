import styled, { css } from 'styled-components'

const StyledStreetViewControls = styled.div<{ $hudPrimaryStyle?: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;

  .primary-controls {
    position: absolute;
    left: max(10px, env(safe-area-inset-left));
    bottom: max(100px, calc(88px + env(safe-area-inset-bottom)));
    display: grid;
    gap: 8px;
    pointer-events: auto;

    ${({ $hudPrimaryStyle }) =>
      $hudPrimaryStyle
        ? css`
            padding: 8px;
            border-radius: 14px;
            background: rgba(12, 14, 18, 0.76);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px) saturate(135%);
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
          `
        : css`
            gap: 15px;
          `}
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
