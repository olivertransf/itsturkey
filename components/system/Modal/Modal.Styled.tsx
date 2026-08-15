import styled, { keyframes } from 'styled-components'

type StyledProps = {
  noOverflow?: boolean
  maxWidth?: string
  isOpen?: boolean
  showCloseAnim?: boolean
}

const popInAnim = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`

const popOutAnim = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.98);
  }
`

const StyledModal = styled.div<StyledProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  z-index: var(--z-modal);

  .modal {
    z-index: var(--z-modal);
    border-radius: var(--radius-lg);
    position: fixed;
    top: 50%;
    left: 50%;
    outline: none;
    overflow: ${({ noOverflow }) => (noOverflow ? 'hidden' : 'unset')};
    transform: translate(-50%, -50%);
    background-color: var(--bg-elevated);
    border: var(--border-default);
    margin: 0;
    padding: 0;
    box-shadow: var(--shadow-card);
    animation: forwards var(--duration) var(--ease) ${({ showCloseAnim }) => (showCloseAnim ? popOutAnim : popInAnim)};
    color: var(--text-primary);
    width: max-content;

    ${({ maxWidth }) =>
      maxWidth &&
      `
      max-width: ${maxWidth};
      width: 100%;
    `}

    .modal-content {
      max-height: 100vh;
      max-width: 100vw;
      overflow-y: auto;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    transition: opacity var(--duration-fast) var(--ease);
    opacity: ${({ showCloseAnim }) => (showCloseAnim ? 0 : 1)};
    background-color: var(--overlay-scrim);
  }

  @media (pointer: none), (pointer: coarse) {
    height: 100vh;

    .modal {
      .modal-content {
        max-height: -webkit-fill-available;
      }
    }
  }
`

export default StyledModal
