import styled from 'styled-components'

const ACCENT = '#a855f7'

const StyledCountryStreakCard = styled.div`
  width: 100%;
  --country-streak-accent: ${ACCENT};

  .large-card-wrapper {
    border-radius: 6px;
    background-color: ${({ theme }) => theme.color.gray[900]};
    border: 1px solid ${({ theme }) => theme.color.gray[800]};
    border-top: 4px solid var(--country-streak-accent);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    display: grid;
    gap: 1rem;
    max-height: 300px;

    .map-avatar {
      height: 125px;
      width: 100%;
      border-radius: 5px 5px 0 0;
      position: relative;
      background: linear-gradient(
        145deg,
        ${({ theme }) => theme.color.gray[800]} 0%,
        #1e1b4b 42%,
        ${({ theme }) => theme.color.gray[900]} 55%,
        ${({ theme }) => theme.color.gray[800]} 100%
      );

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 5px 5px 0 0;
        background: linear-gradient(
          180deg,
          ${({ theme }) => theme.color.gray[900]}00 0%,
          ${({ theme }) => theme.color.gray[900]}cc 85%
        );
      }
    }

    .contentWrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 14px;
      margin-top: -48px;
    }

    .mapNameWrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;

      .map-accent-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: var(--country-streak-accent);
        box-shadow: 0 0 0 2px ${({ theme }) => theme.color.gray[900]};
      }

      .mapName {
        font-size: 20px;
        font-weight: 600;
        padding: 0 1rem;
        z-index: 1;
        margin: 0;
        text-align: center;
        line-height: 1.25;
        color: #fff;
      }
    }

    .mapDescription {
      margin: 0;
      color: ${({ theme }) => theme.color.gray[500]};
      font-weight: 400;
      line-height: 25px;
      text-align: center;
      padding: 0 1.7rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      overflow: hidden;
      -webkit-box-orient: vertical;
      word-break: break-word;
      height: 50px;
    }

    .playWrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1rem 1rem 2rem 1rem;
    }

    .mapPlayBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      height: 40px;
      padding: 0 25px;
      font-size: 1rem;
      font-weight: 500;
      user-select: none;
      width: clamp(120px, 70%, 300px);
      background-color: var(--indigo-700);
      color: #fff;
      text-decoration: none;

      &:hover {
        background-color: var(--indigo-600);
      }
    }
  }
`

export default StyledCountryStreakCard
