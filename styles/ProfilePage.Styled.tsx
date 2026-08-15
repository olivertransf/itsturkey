import styled from 'styled-components'

type StyledProps = {
  isEditing?: boolean
}

const StyledProfilePage = styled.div<StyledProps>`
  .profile-stack,
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .profile-card {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: var(--radius-lg);
    border: var(--border-default);
    background: var(--bg-card);
  }

  .profile-card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--divider-line);
  }

  .profile-card-title {
    margin: 0;
    font-size: var(--font-meta);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .profile-card-body {
    padding: var(--space-4);
  }

  .profile-settings-embed {
    margin-top: 0;
    width: 100%;
    max-width: 100%;
  }

  .profile-details {
    max-width: 720px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    z-index: 2;
    padding: 0 0 32px;

    .profile-heading {
      padding: var(--space-4);

      .avatar-wrapper {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        .profile-avatar {
          background-color: var(--palette-surface, #1c1e22);
          width: 72px;
          height: 72px;
          border-radius: 50%;
          position: relative;
          box-shadow: 0 0 0 2px var(--border-subtle, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            ${({ isEditing }) =>
              isEditing &&
              `
              outline: 1px solid #1c1c1c;
              outline-offset: 5px;
          `}
          }

          .emoji {
            padding: 20% !important;
          }

          .profile-avatar-editing-icon {
            background-color: #363636;
            border-radius: 50rem;
            padding: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.15);
            position: absolute;
            top: -0.5rem;
            right: 0;
            height: 42px;
            width: 42px;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
              height: 20px;
              color: var(--color2);
              position: relative;
              top: -1px;
            }
          }
        }
      }

      .profile-name {
        margin-top: 20px;
        font-size: 28px;
        font-weight: 600;

        input {
          font-size: 28px;
          font-weight: 600;
          color: white;
          border-radius: 2px;
          width: 100%;
          background: rgb(255, 255, 255, 0.05);
          box-shadow: 0 0 0 2px rgb(255, 255, 255, 0.05);
        }

        .name-container {
          display: flex;
          align-items: center;

          .name-wrapper {
            display: grid;

            .name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }

      .profile-bio {
        display: block;
        margin-top: 6px;
        color: rgb(255, 255, 255, 0.5);

        textarea {
          color: rgb(255, 255, 255, 0.5);
          font-weight: 500;
          width: 100%;
          min-height: 50px;
          max-height: 300px;
          border-radius: 2px;
          background: rgb(255, 255, 255, 0.05);
          box-shadow: 0 0 0 2px rgb(255, 255, 255, 0.05);
          resize: vertical;
        }
      }

      .profile-actions {
        margin-top: 30px;
        display: flex;

        button {
          padding: 1px 14px 0 14px;
          font-weight: 500;
          color: rgb(255, 255, 255, 0.7);
          transition: 0.2s;

          &.cancel-btn {
            color: #fee2e2;
          }

          &:not(:last-child) {
            margin-right: 10px;
          }

          svg {
            height: 20px;
            position: relative;
            top: -1px;
          }
        }
      }
    }

    .profile-tabs {
      margin-bottom: 20px;
      border-bottom: 1px solid #222;
      font-weight: 400;
    }

    .user-stats {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .stat-group-list {
      list-style: none;
      margin: 0;
      padding: var(--space-4);
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-3);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 650;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .stat-label {
      font-size: var(--font-compact);
      line-height: 1.3;
      color: var(--text-muted);
    }

    .personal-bests-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .personal-best-row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px 16px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--divider-line);

      &:last-child {
        border-bottom: 0;
      }

      a {
        color: var(--text-primary);
        font-weight: 600;
        text-decoration: none;

        &:hover {
          color: var(--text-primary);
        }
      }

      .personal-best-meta {
        font-size: var(--font-meta);
        color: var(--text-muted);
      }

      .personal-best-results {
        font-size: var(--font-meta);
        font-weight: 600;
        color: var(--text-muted);
      }
    }

    .user-maps {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 30px;
    }

    .no-results-message {
      color: var(--text-muted);
      font-size: var(--font-meta);
    }
  }

  @media (max-width: 600px) {
    .profile-details {
      padding-top: 16px;

      .profile-heading {
        border: 0;
        margin-bottom: 0;

        .avatar-wrapper {
          .profile-avatar {
            height: 64px;
            width: 64px;

            .profile-avatar-editing-icon {
              top: -6px;
              right: -6px;
              height: 36px;
              width: 36px;

              svg {
                height: 16px;
              }
            }
          }
        }
      }
    }
  }
`

export default StyledProfilePage
