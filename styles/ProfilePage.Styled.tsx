import styled from 'styled-components'

type StyledProps = {
  isEditing?: boolean
}

const StyledProfilePage = styled.div<StyledProps>`
  .profile-settings-embed {
    margin-top: 8px;
    width: 100%;
    max-width: 100%;
  }

  .profile-details {
    max-width: 720px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    z-index: 2;
    margin-top: 0;
    padding: 0 0 32px;

    .profile-heading {
      padding-bottom: 20px;
      margin-bottom: 10px;

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
      gap: 18px;
      margin-top: 12px;

      .stat-group {
        border-radius: 16px;
        border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
        background: rgba(255, 255, 255, 0.03);
        padding: 14px 14px 12px;
      }

      .stat-group-title {
        margin: 0 0 10px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .stat-group-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 8px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        padding: 10px 11px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.04);
      }

      .stat-value {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
      }

      .stat-label {
        font-size: 12px;
        line-height: 1.3;
        color: var(--text-muted);
      }
    }

    .personal-bests {
      margin-top: 28px;

      .personal-bests-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--color2);
        margin-bottom: 12px;
      }

      .personal-bests-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .personal-best-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px 16px;
        padding: 14px 16px;
        border-radius: 12px;
        background-color: #2a2a2a;
        border: 1px solid var(--border-strong);

        a {
          color: var(--color2);
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }

        .personal-best-meta {
          font-size: 13px;
          color: rgb(255, 255, 255, 0.55);
        }

        .personal-best-results {
          font-size: 13px;
          font-weight: 500;
          color: rgb(255, 255, 255, 0.75);
        }
      }
    }

    .user-maps {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 30px;
    }

    .no-results-message {
      color: var(--color3);
    }

    .friends-panel {
      margin-top: 24px;

      .friends-hint {
        font-size: 14px;
        color: rgb(255, 255, 255, 0.45);
        margin-bottom: 16px;
        line-height: 1.45;

        a {
          color: var(--color2);
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .friends-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .friend-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 12px;
        background-color: #2a2a2a;
        border: 1px solid var(--border-strong);
      }

      .friend-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;

        a {
          color: var(--color2);
          font-weight: 600;
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          &:hover {
            text-decoration: underline;
          }
        }

        .friend-code {
          font-size: 12px;
          color: rgb(255, 255, 255, 0.45);
          font-family: ui-monospace, monospace;
        }
      }

      .friend-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
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
