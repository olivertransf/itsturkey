import styled from 'styled-components'

const ACCENT = '#fb923c'

const StyledDuelGuessrCard = styled.div`
  width: 100%;
  --duel-guessr-accent: ${ACCENT};

  .large-card-wrapper {
    border-radius: 14px;
    background-color: ${({ theme }) => theme.color.gray[900]};
    border: 1px solid var(--border-subtle);
    border-top: 4px solid var(--duel-guessr-accent);
    box-shadow: var(--shadow-card);
    display: grid;
    gap: 1rem;
    max-height: 300px;

    .map-avatar {
      height: 125px;
      width: 100%;
      border-radius: 13px 13px 0 0;
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        155deg,
        ${({ theme }) => theme.color.gray[800]} 0%,
        #9a3412 20%,
        #7c2d12 40%,
        #1e293b 66%,
        ${({ theme }) => theme.color.gray[900]} 92%,
        ${({ theme }) => theme.color.gray[900]} 100%
      );

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(
          180deg,
          rgba(23, 23, 23, 0) 0%,
          rgba(23, 23, 23, 0) 28%,
          rgba(23, 23, 23, 0.38) 52%,
          rgba(23, 23, 23, 0.78) 74%,
          rgba(23, 23, 23, 0.96) 91%,
          rgb(23, 23, 23) 100%
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 0 1.7rem;
      box-sizing: border-box;

      .map-accent-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: var(--duel-guessr-accent);
        box-shadow: 0 0 0 2px ${({ theme }) => theme.color.gray[900]};
      }

      .mapName {
        font-size: 20px;
        font-weight: 600;
        padding: 0;
        z-index: 1;
        margin: 0;
        width: 100%;
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
      flex-wrap: wrap;
      padding: 1rem 1rem 2rem 1rem;
      box-sizing: border-box;
    }

    .mapPlayBtn,
    .mapSecondaryBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      height: 40px;
      padding: 0 18px;
      font-size: 1rem;
      font-weight: 500;
      user-select: none;
      flex: 1 1 auto;
      min-width: 108px;
      max-width: 160px;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
    }

    .mapPlayBtn {
      border: none;
      background-color: var(--indigo-700);
      color: #fff;

      &:hover {
        background-color: var(--indigo-600);
      }

      &:disabled {
        cursor: default;
        opacity: 0.75;
      }
    }

    .mapSecondaryBtn {
      border: 1px solid ${({ theme }) => theme.color.gray[600]};
      background-color: transparent;
      color: ${({ theme }) => theme.color.gray[200]};

      &:hover {
        background-color: ${({ theme }) => theme.color.gray[800]};
        border-color: ${({ theme }) => theme.color.gray[500]};
      }
    }
  }
`

export default StyledDuelGuessrCard
