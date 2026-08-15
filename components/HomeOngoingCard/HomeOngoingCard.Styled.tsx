import styled from 'styled-components'

const StyledHomeOngoingCard = styled.section`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: var(--border-default);
  background: var(--bg-card);

  .ongoing-link {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 16px;
    border-top: 1px solid var(--divider-line);
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }

  .ongoing-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ongoing-item {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid var(--divider-line);

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      background: var(--bg-elevated);
    }
  }

  .ongoing-row {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    min-height: 56px;
    padding: 14px 8px 14px 16px;
    text-decoration: none;
  }

  .ongoing-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ongoing-name {
    font-size: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ongoing-meta {
    font-size: var(--font-meta);
    line-height: 1.35;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ongoing-resume {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height-sm);
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-meta);
    font-weight: 600;
    background: var(--accent-primary);
    color: var(--white);
    flex-shrink: 0;
  }

  .ongoing-item:hover .ongoing-resume {
    background: var(--accent-primary-hover);
  }

  .ongoing-hide,
  .ongoing-restore {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    height: var(--control-height-sm);
    padding: 0 var(--space-3);
    margin-right: 12px;
    border-radius: var(--radius-sm);
    font-size: var(--font-meta);
    font-weight: 600;
    background: transparent;
    color: var(--text-muted);
    border: 0;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      color: var(--text-primary);
    }
  }

  .ongoing-empty {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-4);

    p {
      margin: 0;
      font-size: var(--font-meta);
      color: var(--text-muted);
    }
  }

  .ongoing-restore {
    margin-right: 0;
    border: 1px solid var(--border-subtle);

    &:hover {
      border-color: var(--border-strong);
    }
  }
`

export default StyledHomeOngoingCard
