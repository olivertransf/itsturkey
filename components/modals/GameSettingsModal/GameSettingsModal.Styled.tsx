import styled from 'styled-components'

const StyledGameSettingsModal = styled.div`
  &.map-play-inline-inner .mainContent {
    padding: var(--stack-gap-md) var(--page-gutter) var(--stack-gap-md);
    gap: var(--stack-gap-md);
    background-color: var(--bg-primary);
  }

  .mainContent {
    padding: var(--modalPadding);
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    background-color: #101010;
  }

  .mapPickerSection {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .map-details-wrapper {
    display: flex;
    align-items: center;

    .map-details {
      margin-left: 16px;
      margin-top: 2px;

      .map-name {
        font-size: 20px;
        font-weight: 600;
        display: block;
        margin-bottom: 8px;
      }

      .map-description {
        color: var(--color3);
        font-weight: 400;
        line-height: 1.45;
      }
    }
  }

  .playModeSection {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sectionEyebrow {
    font-size: var(--label-upper-size);
    font-weight: 600;
    letter-spacing: var(--label-upper-tracking);
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .toggleBar {
    display: flex;
    align-items: stretch;
    gap: 6px;
    padding: 6px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .toggleBar.threeWay,
  .toggleBar.nWay {
    flex-wrap: wrap;
  }

  .toggleIcon {
    height: 20px;
    width: 20px;
    flex-shrink: 0;
    color: #9ca3af;
    transition: color 0.2s ease;
  }

  .toggleItemWrapper {
    flex: 1;
    min-width: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    color: #a8a8b0;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    .toggle-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 8px;
    }

    .toggleText {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.05);
      color: #d4d4d8;
    }
  }

  .toggleItemWrapper.active {
    background: linear-gradient(180deg, #6d54d6 0%, var(--mediumPurple) 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(67, 56, 202, 0.35);

    .toggleIcon {
      color: #fff;
    }
  }

  .roundsSection {
    margin-top: 0;
  }

  .controlCard {
    padding: 16px 18px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 12px;

    & > .roundTimeLabel {
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 12px;

      .roundLabelGroup {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 6px;
      }

      .timeLimit {
        margin-left: 0;
        flex-shrink: 0;
      }
    }
  }

  .unlimitedHint {
    margin: 0;
    padding: 13px 16px;
    font-size: 13px;
    line-height: 1.55;
    color: #b4b4bc;
    background: rgba(99, 102, 241, 0.07);
    border: 1px solid rgba(99, 102, 241, 0.18);
    border-radius: 10px;

    strong {
      font-weight: 600;
      color: #e4e4e7;
    }
  }

  .movementOptions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 22px;
    color: var(--color4);
    font-size: 14px;
  }

  .movementOption {
    display: flex;
    align-items: center;
    gap: 10px;

    .movementOptionLabel {
      margin-top: 1px;
      font-weight: 500;
      color: #c8c8d0;
    }
  }

  .detailedSettings {
    margin-top: 0;
  }

  .setting-options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px 36px;
    margin-top: 2px;

    .time-slider {
      margin-top: 0;
      flex: 1;
      min-width: 200px;
    }
  }

  .roundTimeLabel {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #a1a1aa;
    letter-spacing: 0.02em;

    .labelHint {
      font-weight: 500;
      font-size: 12px;
      color: #71717a;
      letter-spacing: 0;
    }

    .timeLimit {
      margin-left: auto;
      font-size: 17px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: #f4f4f5;
      letter-spacing: 0;
    }
  }

  .detailedSettings.controlCard > .roundTimeLabel {
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .timeLimit {
      margin-left: 0;
      font-size: 15px;
      flex-shrink: 0;
    }
  }

  .timeLabel {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 60px;
    margin-right: 15px;
    color: var(--color2);
  }

  .settingsWrapper {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 2px;
  }

  .checkboxWrapper {
    padding: 14px 16px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #b6b6bf;

    label {
      cursor: pointer;
      line-height: 1.5;
      font-size: 13px;
    }
  }

  .settingsControlsMuted {
    .roundTimeLabel,
    .movementOptionLabel {
      opacity: 0.55;
    }
  }

  .controlCard .time-slider {
    width: 100%;
  }

  @media (max-width: 600px) {
    &.map-play-inline-inner .mainContent {
      padding: var(--stack-gap-md) var(--page-gutter) var(--stack-gap-sm);
      gap: var(--stack-gap-md);
    }

    .mainContent {
      gap: 1.35rem;
    }

    .toggleItemWrapper .toggle-item {
      padding: 10px 6px;
      gap: 6px;
    }

    .toggleItemWrapper .toggleText {
      font-size: 12px;
    }

    .setting-options {
      flex-direction: column;
      align-items: stretch;
      gap: 18px;
    }

    .roundTimeLabel {
      font-size: 12px;
    }

    .controlCard > .roundTimeLabel {
      flex-wrap: wrap;

      .timeLimit {
        width: 100%;
        text-align: right;
      }
    }

    .checkboxWrapper label {
      font-size: 12px;
    }
  }
`

export default StyledGameSettingsModal
