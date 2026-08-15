import styled from 'styled-components'

const StyledSearchResult = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  cursor: pointer;

  :hover {
    background-color: var(--control-fill);
  }

  .linkWrapper {
    height: 100%;
    width: 100%;
    padding: var(--space-3) var(--space-4);
  }

  .termAvatar {
    height: var(--icon-lg);
    width: var(--icon-lg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .searchResultLabelWrapper {
    display: grid;

    .searchResultLabel {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-primary);
      font-size: var(--font-body);
    }
  }
`

export default StyledSearchResult
