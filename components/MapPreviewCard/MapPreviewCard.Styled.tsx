import styled from 'styled-components'

type StyledProps = {
  isForDisplayOnly?: boolean
}

const StyledMapPreviewCard = styled.div<StyledProps>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .large-card-wrapper,
  .small-card-wrapper {
    border-radius: var(--radius-xl);
    background-color: var(--bg-card);
    border: var(--border-default);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
  }

  .map-avatar,
  .preview-image {
    height: 168px;
    width: 100%;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;

    img {
      object-fit: cover;
    }
  }

  .map-avatar .image-gradient,
  .preview-image::after {
    display: none;
  }

  .preview-image img {
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    opacity: 1;
    border-radius: 0;
  }

  .contentWrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-4) var(--space-4);
    flex: 1;
  }

  .mapNameWrapper {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    min-width: 0;
    padding: 0;
    box-sizing: border-box;

    .mapNameRow {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      min-width: 0;
      gap: var(--space-2);
    }

    .map-flag {
      font-size: 22px;
      line-height: 1;
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
      user-select: none;
    }

    .mapName {
      font-size: var(--font-body);
      font-weight: 700;
      letter-spacing: var(--tracking-title);
      padding: 0;
      z-index: 1;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-primary);
    }
  }

  .small-card-wrapper .playWrapper {
    padding: 0;
  }

  .mapDescription {
    color: var(--text-muted);
    font-weight: 500;
    line-height: 1.45;
    text-align: left;
    padding: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    overflow: hidden;
    -webkit-box-orient: vertical;
    word-break: break-word;
    font-size: var(--font-meta);
  }

  .playWrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: stretch;
    gap: var(--space-2);
    padding: 0;
    margin-top: auto;
  }


  .mapEditBtn,
  .mapDeleteBtn,
  .mapPlayBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    height: var(--control-height-md);
    padding: 0 var(--space-4);
    font-size: var(--font-body);
    font-weight: 700;
    user-select: none;
    width: 100%;
  }

  .mapEditBtn,
  .mapDeleteBtn {
    width: auto;
    background-color: var(--control-fill);
    color: var(--text-primary);

    svg {
      height: var(--icon-md);
      color: var(--text-primary);
    }

    &:hover {
      background-color: var(--control-fill-hover);

      &.mapDeleteBtn {
        background-color: var(--danger-fill-hover);
      }
    }
  }

  .mapPlayBtn {
    background-color: var(--accent-primary);
    color: var(--white);

    ${({ isForDisplayOnly }) =>
      isForDisplayOnly &&
      `
         background-color: var(--control-fill);
         color: var(--text-subtle);
      `}

    :hover {
      background-color: ${({ isForDisplayOnly }) => !isForDisplayOnly && 'var(--accent-primary-hover)'};
    }
  }
`

export default StyledMapPreviewCard
