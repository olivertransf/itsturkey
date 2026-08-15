import styled from 'styled-components'

const StyledProfilePage = styled.div`
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));

  .profile-shell {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    border-radius: var(--radius-xl);
    border: var(--border-default);
    background-color: var(--bg-card);
  }

  .profile-shell-head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: var(--space-3);
  }

  .profile-shell-head > *:first-child {
    justify-self: start;
  }

  .profile-shell-title {
    grid-column: 2;
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-width: 0;
    text-align: center;
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    line-height: 1.2;
    color: var(--text-primary);

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .profile-shell-title-input {
    grid-column: 2;
    width: min(280px, 100%);
    text-align: center;
  }

  .profile-shell-actions {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 1em;
  }

  .profile-card-link {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;

    &:hover:not(:disabled) {
      color: var(--text-primary);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .profile-identity {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    min-width: 0;
  }

  .profile-avatar-btn {
    position: relative;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
  }

  .profile-avatar-edit {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .profile-copy {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .profile-bio {
    margin: 0;
    font-size: var(--font-meta);
    line-height: 1.45;
    color: var(--text-muted);
  }

  .profile-name-input,
  .profile-bio-input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--control-fill);
    color: var(--text-primary);
    font: inherit;
  }

  .profile-name-input {
    height: var(--control-height-sm);
    padding: 0 var(--space-3);
    font-size: var(--font-body);
    font-weight: 700;
  }

  .profile-bio-input {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-meta);
    line-height: 1.45;
    color: var(--text-muted);
    resize: vertical;
    min-height: 72px;
  }

  .profile-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 0 4px;
  }

  .profile-panel {
    min-width: 0;
    overflow: hidden;
    border-radius: var(--radius-lg);
    border: var(--border-default);
    background-color: var(--bg-elevated);
  }

  .profile-panel--flush .profile-empty,
  .profile-panel-pad {
    padding: var(--space-4);
  }

  .profile-panel-title {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--divider-line);
    font-size: var(--font-meta);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .stats-hero {
    list-style: none;
    margin: 0;
    padding: var(--space-4);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-3);
  }

  .stats-hero li {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stats-value {
    font-size: 1.25rem;
    font-weight: 650;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .stats-label {
    font-size: var(--font-compact);
    line-height: 1.3;
    color: var(--text-muted);
  }

  .stats-meta {
    margin: 0;
    padding: var(--space-3) var(--space-4) var(--space-4);
    border-top: 1px solid var(--divider-line);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3) var(--space-4);
  }

  .stats-meta div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stats-meta dt {
    font-size: var(--font-compact);
    color: var(--text-subtle);
  }

  .stats-meta dd {
    margin: 0;
    font-size: var(--font-meta);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }

  .profile-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .profile-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 16px;
    min-height: 56px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--divider-line);

    &:last-child {
      border-bottom: 0;
    }
  }

  .profile-row-name {
    font-size: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }

  .profile-row-meta {
    font-size: var(--font-meta);
    line-height: 1.35;
    color: var(--text-muted);

    a {
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;

      &:hover {
        color: var(--text-primary);
      }
    }
  }

  .profile-empty {
    margin: 0;
    font-size: var(--font-meta);
    color: var(--text-muted);
  }

  .profile-settings-embed {
    margin-top: 0;
    width: 100%;
    max-width: 100%;
    padding: var(--space-4);
    box-sizing: border-box;
  }

  @media (max-width: 600px) {
    .stats-hero {
      grid-template-columns: 1fr;
    }
  }
`

export default StyledProfilePage
