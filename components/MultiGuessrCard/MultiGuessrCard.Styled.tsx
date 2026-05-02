import styled from 'styled-components'

const ACCENT = '#22d3ee'

const StyledMultiGuessrCard = styled.div`
  width: 100%;
  --multi-guessr-accent: ${ACCENT};

  .large-card-wrapper {
    border-radius: 14px;
    background-color: ${({ theme }) => theme.color.gray[900]};
    border: 1px solid var(--border-subtle);
    border-top: 4px solid var(--multi-guessr-accent);
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
        #155e75 20%,
        #164e63 40%,
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
        background-color: var(--multi-guessr-accent);
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
      padding: 1rem 1rem 2rem 1rem;
    }

    .mapPlayBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 10px;
      height: 40px;
      padding: 0 25px;
      font-size: 1rem;
      font-weight: 500;
      user-select: none;
      width: clamp(120px, 70%, 300px);
      background-color: var(--indigo-700);
      color: #fff;
      text-decoration: none;
      cursor: pointer;

      &:hover {
        background-color: var(--indigo-600);
      }

      &:disabled {
        cursor: default;
        opacity: 0.75;
      }
    }
  }
`

export default StyledMultiGuessrCard
