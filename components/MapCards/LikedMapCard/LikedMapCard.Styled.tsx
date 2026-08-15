import styled from 'styled-components'

const StyledLikedMapCard = styled.div`
  border-radius: var(--radius-xl);
  background-color: var(--bg-card);
  border: var(--border-default);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;

  .map-avatar {
    height: 168px;
    width: 100%;
    position: relative;
    flex-shrink: 0;

    .image-gradient {
      display: none;
    }
  }

  .contentWrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
    padding: var(--space-4);
    flex: 1;
  }

  .mapNameWrapper {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    justify-content: flex-start;

    .map-flag {
      font-size: 22px;
      line-height: 1;
      flex-shrink: 0;
      user-select: none;
    }

    .map-letter {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--text-primary);
      background: var(--control-fill);
      flex-shrink: 0;
    }

    .mapName {
      font-size: var(--font-body);
      font-weight: 700;
      letter-spacing: var(--tracking-title);
      padding: 0;
      z-index: 1;
      width: 100%;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-primary);
    }
  }

  .playWrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: stretch;
    gap: var(--space-2);
    margin-top: auto;
  }

  .mapEditBtn,
  .mapPlayBtn,
  .unlike-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    height: var(--control-height-md);
    padding: 0 var(--space-4);
    font-size: var(--font-body);
    font-weight: 700;
    user-select: none;
  }

  .mapEditBtn {
    flex: 1;
    background-color: var(--control-fill);
    color: var(--text-primary);

    &:hover {
      background-color: var(--control-fill-hover);
    }
  }

  .mapPlayBtn {
    flex: 1;
    background-color: var(--accent-primary);
    color: var(--white);

    :hover {
      background-color: var(--accent-primary-hover);
    }
  }

  .unlike-button {
    padding: 0;
    width: var(--control-height-md);
    background-color: var(--control-fill);
    color: var(--text-primary);

    svg {
      height: var(--icon-md);
      color: var(--danger);
    }

    &:hover {
      background-color: var(--control-fill-hover);
    }
  }
`

export default StyledLikedMapCard
