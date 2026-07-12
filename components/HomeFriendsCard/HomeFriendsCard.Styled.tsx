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
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 42%),
    var(--palette-surface, #1c1e22);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 18px 40px rgba(0, 0, 0, 0.28);

  .friends-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 16px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .friends-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .friends-card-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-primary);
  }

  .friends-card-summary {
    font-size: 12px;
    line-height: 1.35;
    color: var(--text-muted);
  }

  .friends-card-link,
  .friends-card-more {
    font-size: 12px;
    font-weight: 600;
    color: var(--palette-accent, #2f7fff);
    text-decoration: none;
    flex-shrink: 0;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .friends-card-more {
    display: block;
    padding: 12px 16px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    color: var(--text-muted);
    font-weight: 500;
  }

  .friends-card-empty {
    margin: 0;
    padding: 18px 16px 20px;
    font-size: 13px;
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
    gap: 8px;
    padding: 12px;
  }

  .friends-skel {
    height: 52px;
    border-radius: 12px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.07),
      rgba(255, 255, 255, 0.03)
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
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: min(42vh, 420px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  }

  .friends-card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 52px;
    padding: 8px 10px;
    border-radius: 12px;
    transition: background 0.12s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
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
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
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
    letter-spacing: 0.01em;
    color: var(--text-muted);
  }

  .friends-invite-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;

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
