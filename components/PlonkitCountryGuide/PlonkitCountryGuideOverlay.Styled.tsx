import styled, { css } from 'styled-components'
import { plonkitReadableGuideCss } from './plonkitGuideReadable.styles'

/** Above app Modal (z-index 50); fullscreen uses higher stack for settings modal. */
export const StyledPlonkitBackdrop = styled.div<{ $elevated?: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: ${({ $elevated }) => ($elevated ? 119 : 59)};
  backdrop-filter: blur(2px);
`

export const StyledPlonkitPanel = styled.aside<{ $presentation?: 'drawer' | 'fullscreen' }>`
  ${plonkitReadableGuideCss}

  .plonkit-guide-body {
    font-size: 16px;
    line-height: 1.68;
  }

  position: fixed;
  ${({ $presentation }) =>
    $presentation === 'fullscreen'
      ? css`
          inset: 0;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: none;
          z-index: 120;
          border-radius: 0;
          box-shadow: none;
        `
      : css`
          top: 0;
          right: 0;
          bottom: 0;
          left: auto;
          width: min(460px, 100vw);
          max-width: 100%;
          z-index: 61;
        `}
  background-color: var(--bg-elevated);
  color: #ebebf5;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  font-family: inherit;

  .plonkit-panel-header {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 18px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.2);
  }

  .plonkit-panel-header-text {
    min-width: 0;

    h2 {
      margin: 0;
      font-size: 1.28rem;
      font-weight: 700;
      line-height: 1.28;
      letter-spacing: -0.02em;
      color: #fafafa;
    }

    .plonkit-sub {
      margin: 10px 0 0;
      font-size: 0.92rem;
      line-height: 1.48;
      color: #c9c9d4;

      a {
        color: #d8ccff;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;

        &:hover {
          color: #f0ebff;
        }
      }
    }
  }

  .plonkit-close {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.08);
    color: #f4f4f8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 22px;
      height: 22px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  }

  .plonkit-scroll {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 18px 18px 32px;
    -webkit-overflow-scrolling: touch;

    scrollbar-width: thin;
    scrollbar-color: rgba(167, 139, 250, 0.55) rgba(255, 255, 255, 0.06);

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(167, 139, 250, 0.45);
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 999px;
    }
  }

  .plonkit-panel-foot {
    margin: 20px 0 0;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 10px;
    line-height: 1.45;
    color: #8b8799;

    a {
      color: #c4b5fd;
      text-decoration: underline;
      text-underline-offset: 2px;

      &:hover {
        color: #e9e5ff;
      }
    }
  }

  .plonkit-status {
    padding: 28px 16px;
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
    color: #d4d4dc;
  }

  ${({ $presentation }) =>
    $presentation === 'fullscreen' &&
    css`
      .plonkit-scroll {
        max-width: min(720px, 100%);
        margin-inline: auto;
        padding-left: clamp(16px, 4vw, 28px);
        padding-right: clamp(16px, 4vw, 28px);
      }

      .plonkit-panel-header {
        padding-left: clamp(16px, 4vw, 28px);
        padding-right: clamp(16px, 4vw, 28px);
      }

      .plonkit-panel-header-text {
        max-width: min(720px, 100%);
      }
    `}
`
