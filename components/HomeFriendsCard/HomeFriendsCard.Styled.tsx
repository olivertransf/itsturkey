import styled from 'styled-components'

const StyledHomeFriendsCard = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 14px 12px;
  border-radius: 12px;
  border: var(--border-default);
  background: var(--palette-surface);
  box-shadow: var(--shadow-card);

  .friends-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .friends-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .friends-card-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .friends-card-summary {
    font-size: 12px;
    color: var(--text-muted);
  }

  .friends-card-link,
  .friends-card-more {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
    flex-shrink: 0;

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
    height: 44px;
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
    gap: 8px;
    min-height: 44px;
    padding: 6px 8px;
    border-radius: 10px;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  .friends-card-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .friends-card-name {
    font-size: 13px;
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
    gap: 6px;
    flex-shrink: 0;
    font-size: 11px;
    color: var(--text-muted);
  }

  .friends-invite-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;

    svg {
      width: 13px;
      height: 13px;
    }
  }

  .status-text--active {
    color: #fbbf24;
    font-weight: 600;
  }

  .status-dot {
    width: 7px;
    height: 7px;
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
