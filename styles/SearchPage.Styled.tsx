import styled from 'styled-components'

const StyledSearchPage = styled.div`
  width: 100%;

  .tabs-wrapper {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-subtle);
    gap: var(--stack-gap-md);
    margin-bottom: var(--stack-gap-md);

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      border-right: 1px solid var(--border-subtle);
      padding-right: var(--stack-gap-md);
    }

    .filter-tab {
      display: flex;
      align-items: center;
      font-size: 16px;

      svg {
        height: 20px;
        color: var(--text-muted);
        margin-left: 6px;
      }

      span {
        position: relative;
        top: 1px;
      }

      .result-count-bubble {
        background-color: var(--bg-elevated);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 8px;
        color: var(--text-muted);
        font-size: 12px;
        height: 18px;
        width: 24px;
      }
    }
  }

  .search-results-wrapper {
    display: grid;
    gap: var(--stack-gap-sm);

    .search-result {
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: var(--bg-surface);
      padding: var(--stack-gap-sm) var(--stack-gap-md);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);

      &:hover {
        background-color: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.1);
      }
    }

    .no-search-results {
      font-size: 18px;
      color: #efeff1;
      font-weight: 400;
      margin-top: 1rem;

      span {
        font-weight: 500;
      }
    }

    .num-search-results {
      font-size: 1rem;
      color: var(--text-muted);
      font-weight: 500;
    }
  }

  @media (max-width: 700px) {
    .tabs-wrapper {
      .page-title {
        display: none;
      }
    }
  }
`

export default StyledSearchPage
