import styled from 'styled-components'

const StyledHomeFriendsCard = styled.div`
  width: 100%;
  min-width: 0;
  max-height: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  flex: 0 1 auto;
  min-height: 0;
  border-radius: var(--radius-xl);
  border: var(--border-default);
  background: var(--bg-card);

  .friends-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--pad-row-card);
    border-bottom: 1px solid var(--divider-line);
  }

  .friends-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .friends-card-title {
    margin: 0;
    font-size: var(--font-section);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    text-transform: none;
    color: var(--text-primary);
  }

  .friends-card-summary {
    font-size: var(--font-compact);
    line-height: 1.35;
    color: var(--text-muted);
  }

  .friends-card-link,
  .friends-card-more {
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--accent-primary);
    text-decoration: none;
    flex-shrink: 0;

    &:hover {
      color: var(--accent-primary-hover);
    }
  }

  .friends-card-more {
    display: block;
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--divider-line);
    color: var(--text-muted);
    font-weight: 500;
  }

  .friends-card-empty {
    margin: 0;
    padding: var(--space-4);
    font-size: var(--font-meta);
    line-height: 1.5;
    color: var(--text-muted);

    a {
      color: var(--text-primary);
      font-weight: 600;
    }
  }

  .friends-card-loading {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .friends-skel {
    height: 52px;
    border-radius: var(--radius-md);
    background: var(--control-fill);
  }

  .friends-card-list {
    list-style: none;
    margin: 0;
    padding: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    overflow: visible;
  }

  .friends-card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    min-height: 52px;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition: background var(--duration-fast) var(--ease);

    &:hover {
      background: var(--control-fill);
    }
  }

  .friends-card-main {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
  }

  .friends-card-name {
    font-size: var(--font-meta);
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    text-decoration: none;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: var(--accent-primary);
    }
  }

  .friends-card-status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
    font-size: var(--font-compact);
    color: var(--text-muted);
  }

  .friends-card-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .friends-invite-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-compact);

    svg {
      width: 13px;
      height: 13px;
    }
  }

  .status-text--active {
    color: var(--warning);
    font-weight: 600;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: var(--radius-pill);
    flex-shrink: 0;
  }

  .status-dot--online {
    background: var(--success);
  }

  .status-dot--active {
    background: var(--warning);
  }

  .status-dot--offline {
    background: var(--text-subtle);
  }
`

export default StyledHomeFriendsCard
