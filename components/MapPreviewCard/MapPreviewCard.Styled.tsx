import styled from 'styled-components'

type StyledProps = {
  isForDisplayOnly?: boolean
}

const StyledMapPreviewCard = styled.div<StyledProps>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .large-card-wrapper {
    border-radius: var(--radius-lg);
    background-color: var(--bg-card);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-card);
    display: grid;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    gap: 1rem;

    ${({ isForDisplayOnly }) =>
      isForDisplayOnly &&
      `
      width: 100%;
    `}

    .map-avatar {
      height: 125px;
      width: 100%;
      overflow: hidden;
      border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
      position: relative;

      span img {
        border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
      }

      .image-gradient {
        z-index: 1;
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: rgba(8, 10, 15, 0.55);
      }
    }

    .contentWrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 18px;
    margin-top: 0;
    }

    .mapNameWrapper {
      display: flex;
      justify-content: center;
      width: 100%;
      min-width: 0;
      padding: 0 1.7rem;
      box-sizing: border-box;

      .mapNameRow {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-width: 0;
        gap: 5px;
      }

      .map-flag {
        font-size: 26px;
        line-height: 1;
        user-select: none;
      }

      .mapName {
        font-size: 20px;
        font-weight: 600;
        padding: 0;
        z-index: 1;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .mapDescription {
      color: var(--text-muted);
      font-weight: 400;
      line-height: 25px;
      text-align: center;
      padding: 0 1.7rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      overflow: hidden;
      -webkit-box-orient: vertical;
      word-break: break-word;
      height: auto;
      min-height: 0;
      font-size: inherit;
    }

    .playWrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1rem 1rem 2rem 1rem;
    }

    .mapEditBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      height: var(--control-height-md);
      padding: 0 var(--space-5);
      font-size: var(--font-body);
      font-weight: 600;
      user-select: none;
      width: clamp(120px, 70%, 300px);
      background-color: var(--control-fill);
      color: var(--text-muted);

      &:hover {
        background-color: var(--control-fill-hover);
      }
    }

    .mapPlayBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      height: var(--control-height-md);
      padding: 0 var(--space-5);
      font-size: var(--font-body);
      font-weight: 600;
      user-select: none;
      width: clamp(120px, 70%, 300px);
      background-color: var(--accent-primary);
      color: #fff;

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
  }

  .small-card-wrapper {
    border-radius: var(--radius-lg);
    background-color: var(--bg-card);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-card);
    position: relative;

    .preview-image {
      position: relative;
      height: 120px;
      display: flex;
      align-items: flex-end;
      justify-content: center;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(8, 10, 15, 0.5);
      }

      img {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        object-fit: cover;
        height: 100%;
        width: 100%;
        opacity: 0.4;
        border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
      }
    }

    .mapNameWrapper {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 0 1rem;
      box-sizing: border-box;

      .mapName {
        font-size: 20px;
        font-weight: 600;
        padding: 0;
        position: relative;
        z-index: 1;
        margin-bottom: 4px;
        width: 100%;
        max-width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .playWrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 10px;
      padding: 20px;
    }

    .mapEditBtn,
    .mapDeleteBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      padding: 10px;
      font-size: 1rem;
      font-weight: 500;
      user-select: none;
      background-color: var(--control-fill);
      color: var(--text-muted);

      svg {
        height: 20px;
        color: #fff;
      }

      &:hover {
        background-color: var(--control-fill-hover);

        &.mapDeleteBtn {
          background-color: var(--danger-fill-hover);
        }
      }
    }

    .mapPlayBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      height: var(--control-height-md);
      padding: 0 var(--space-5);
      font-size: var(--font-body);
      font-weight: 600;
      user-select: none;
      background-color: var(--accent-primary);
      color: #fff;
      width: 100%;

      :hover {
        background-color: var(--accent-primary-hover);
      }
    }
  }
`

export default StyledMapPreviewCard
