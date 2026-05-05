import { css } from 'styled-components'

/**
 * Shared typography for Plonk It guide content (overlay + game settings inline).
 * High contrast on dark backgrounds, comfortable measure for long clues.
 */
export const plonkitReadableGuideCss = css`
  .plonkit-guide-body {
    font-size: 15px;
    line-height: 1.62;
    letter-spacing: 0.01em;
    color: #e8e8ee;

    @media (max-width: 600px) {
      font-size: 14px;
      line-height: 1.58;
    }
  }

  .plonkit-guide-step {
    margin-bottom: 26px;
    padding-bottom: 22px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }

  .plonkit-guide-step-title {
    margin: 0 0 14px;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
    color: #fafafa;
    letter-spacing: -0.01em;
  }

  .plonkit-guide-subsection {
    margin: 18px 0 10px;
    font-size: 1rem;
    font-weight: 600;
    color: #f4f4f8;
    line-height: 1.35;
  }

  .plonkit-guide-divider {
    margin: 22px 0 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);

    span {
      font-weight: 700;
      font-size: 1.02rem;
      color: #fafafa;
    }
  }

  .plonkit-guide-centered {
    text-align: center;
    margin: 14px 0;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #dcdce6;
    line-height: 1.55;
  }

  .plonkit-guide-tip {
    margin-bottom: 16px;
    padding: 14px 16px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.09);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .plonkit-guide-map-block {
    margin-bottom: 18px;
    padding: 14px 16px;
    border-radius: 11px;
    background: rgba(99, 102, 241, 0.06);
    border: 1px solid rgba(99, 102, 241, 0.18);
  }

  .plonkit-guide-map-title {
    margin: 0 0 10px;
    font-size: 1rem;
    font-weight: 700;
    color: #f4f4f8;
  }

  .plonkit-guide-text-line {
    margin: 0 0 11px;
    color: #dedee8;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      font-weight: 600;
      color: #ffffff;
    }

    a {
      color: #d8ccff;
      text-decoration: underline;
      text-underline-offset: 3px;
      word-break: break-word;

      &:hover {
        color: #eee8ff;
      }
    }
  }

  .plonkit-guide-figure {
    margin: 4px 0 14px;

    img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
    }

    .plonkit-guide-img-half {
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
    }

    .plonkit-guide-img-link {
      display: block;
      border-radius: 10px;
      outline-offset: 3px;

      &:focus-visible {
        outline: 2px solid rgba(167, 139, 250, 0.85);
      }
    }
  }
`
