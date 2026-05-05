import styled, { css } from 'styled-components'
import type { PlonkitInlineVariant } from './plonkitGuideTypes'
import { plonkitReadableGuideCss } from './plonkitGuideReadable.styles'

export const StyledPlonkitInlineSection = styled.section<{ $variant: PlonkitInlineVariant }>`
  ${plonkitReadableGuideCss}

  margin-top: 4px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  ${({ $variant }) =>
    $variant === 'settings'
      ? css`
          margin-top: 0;
          padding: 14px 20px 18px;
          border-top: none;
          background-color: transparent;
        `
      : ''}

  .plonkit-inline-head {
    margin-bottom: 10px;
  }

  .plonkit-inline-summary {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: #a8a8b3;

    strong {
      font-weight: 600;
      color: #d4d4d8;
    }

    a {
      color: #c4b5fd;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 2px;

      &:hover {
        color: #ddd6fe;
      }
    }
  }

  .plonkit-inline-scroll {
    max-height: min(42vh, 440px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 14px 16px 16px;
    margin-top: 8px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    -webkit-overflow-scrolling: touch;

    scrollbar-width: thin;
    scrollbar-color: rgba(167, 139, 250, 0.5) rgba(255, 255, 255, 0.06);

    &::-webkit-scrollbar {
      width: 9px;
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

  ${({ $variant }) =>
    $variant === 'settings'
      ? css`
          .plonkit-inline-scroll {
            max-height: min(72vh, 780px);
            min-height: 280px;
            padding: 16px 18px 18px;
          }

          .plonkit-guide-body {
            font-size: 16px;
            line-height: 1.68;
          }

          @media (max-width: 600px) {
            .plonkit-inline-scroll {
              max-height: min(62vh, 640px);
              min-height: 200px;
            }

            .plonkit-guide-body {
              font-size: 15px;
              line-height: 1.62;
            }
          }
        `
      : ''}

  .plonkit-inline-foot {
    margin: 10px 0 0;
    padding: 0;
    font-size: 10px;
    line-height: 1.45;
    color: #71717a;

    a {
      color: #a78bfa;
      text-decoration: underline;
      text-underline-offset: 2px;

      &:hover {
        color: #c4b5fd;
      }
    }
  }

  .plonkit-inline-status {
    margin: 0;
    padding: 18px 12px;
    text-align: center;
    font-size: 14px;
    line-height: 1.5;
    color: #c8c8d0;
  }

  ${({ $variant }) =>
    $variant === 'settings'
      ? css`
          .plonkit-inline-status {
            font-size: 15px;
          }
        `
      : ''}
`
