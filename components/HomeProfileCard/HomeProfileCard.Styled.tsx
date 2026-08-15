import styled from 'styled-components'

const StyledHomeProfileCard = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: var(--border-default);
  background: var(--bg-card);

  .profile-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--pad-row-card);
    border-bottom: 1px solid var(--divider-line);
  }

  .profile-card-title {
    margin: 0;
    font-size: var(--font-meta);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .profile-card-link {
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }

  .profile-card-body {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--pad-row-card);
    min-width: 0;
    text-decoration: none;
    color: inherit;

    &:hover {
      background: var(--bg-elevated);
    }
  }

  .profile-card-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .profile-card-name {
    font-size: var(--font-body);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export default StyledHomeProfileCard
