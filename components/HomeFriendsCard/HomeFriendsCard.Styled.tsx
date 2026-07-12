import styled from 'styled-components'

const StyledHomeFriendsCard = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);

  .friends-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .friends-card-summary {
    font-size: 13px;
    color: var(--text-muted);
  }

  .friends-card-link,
  .friends-card-more {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .friends-card-more {
    align-self: flex-start;
    color: var(--text-muted);
    font-weight: 500;
  }

  .friends-card-empty {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--text-muted);

    a {
      color: var(--text-primary);
      font-weight: 600;
    }
  }

  .friends-card-loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .friends-skel {
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    background-size: 200% 100%;
    animation: friends-shimmer 1.2s ease-in-out infinite;
  }

  @keyframes friends-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  .friends-card-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .friends-card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 36px;
    padding: 6px 8px;
    border-radius: 10px;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  .friends-card-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .friends-card-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-muted);
  }

  .status-text--active {
    color: #fbbf24;
    font-weight: 600;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .status-dot--online {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.45);
  }

  .status-dot--active {
    background: #fbbf24;
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
  }

  .status-dot--offline {
    background: #52525b;
  }
`

export default StyledHomeFriendsCard
