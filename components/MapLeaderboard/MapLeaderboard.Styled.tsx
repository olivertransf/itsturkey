import styled from 'styled-components'

const StyledMapLeaderboard = styled.div`
  background-color: var(--bg-card);
  border: var(--border-default);
  border-radius: var(--radius-xl);
  overflow: hidden;

  @media (max-width: 600px) {
    border-radius: var(--radius-lg);
  }

  .leaderboardTop {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--divider-line);
  }

  .title {
    margin: 0;
    font-size: var(--font-compact);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-subtle);
  }

  .notPlayedMsg {
    color: var(--text-muted);
    font-weight: 500;
    display: block;
    padding: 18px;
    font-size: var(--font-meta);
    line-height: 1.45;
  }
`

export default StyledMapLeaderboard
