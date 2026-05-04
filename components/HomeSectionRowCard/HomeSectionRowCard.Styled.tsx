import styled from 'styled-components'

const StyledHomeSectionRowCard = styled.div<{ $accentColor: string; $hasDescription: boolean }>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .home-row-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 13px 17px;
    min-height: ${({ $hasDescription }) => ($hasDescription ? '58px' : '50px')};
    box-sizing: border-box;
    border-radius: 12px;
    background-color: ${({ theme }) => theme.color.gray[900]};
    border: 1px solid var(--border-subtle);
    border-left: 4px solid ${({ $accentColor }) => $accentColor};
    box-shadow: var(--shadow-card);
  }

  .home-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: ${({ $hasDescription }) => ($hasDescription ? '5px' : '0')};
  }

  .home-row-title-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .home-row-flag {
    font-size: 22px;
    line-height: 1;
    flex-shrink: 0;
    user-select: none;
  }

  .home-row-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.28;
    color: ${({ theme }) => theme.color.gray[100]};
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-row-desc {
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    color: ${({ theme }) => theme.color.gray[500]};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .home-row-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    flex-shrink: 0;
    flex-wrap: nowrap;
  }

  .home-play-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    padding: 0 16px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    box-sizing: border-box;
    border: none;
    cursor: pointer;
    text-decoration: none;
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

  a.home-play-btn {
    color: #fff;
  }

  .home-play-btn--icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    padding: 0;
    border-radius: 10px;
  }

  .home-play-btn--icon svg {
    display: block;
    flex-shrink: 0;
  }

  .home-play-btn--secondary {
    background-color: transparent;
    color: ${({ theme }) => theme.color.gray[200]};
    border: 1px solid ${({ theme }) => theme.color.gray[600]};

    &:hover {
      background-color: ${({ theme }) => theme.color.gray[800]};
      border-color: ${({ theme }) => theme.color.gray[500]};
    }
  }
`

export default StyledHomeSectionRowCard
