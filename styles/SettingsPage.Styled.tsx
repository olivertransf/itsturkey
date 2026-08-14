import styled from 'styled-components'

const StyledSettingsPage = styled.div`
  .header {
    padding-bottom: 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    border-bottom: 1px solid var(--divider-line);

    &.header--embedded {
      padding-bottom: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .header-details {
      h1 {
        font-size: var(--font-title);
        font-weight: 600;
        letter-spacing: var(--tracking-title);
        color: var(--text-primary);
      }

      h2 {
        margin-top: var(--space-1);
        font-size: var(--font-meta);
        font-weight: 500;
        color: var(--text-muted);
      }
    }
  }

  .settings-loader {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-body {
    display: grid;
    grid-template-columns: 1fr;
    justify-content: space-between;
    gap: 40px;

    .settings-form {
      display: grid;
      gap: 25px;
      align-content: flex-start;
    }

    .maps-key-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 14px;
      margin-top: -8px;
    }

    .maps-key-status {
      font-size: 13px;
      line-height: 1.35;
      color: #9e9e9e;
      max-width: 42ch;
    }

    .maps-key-status--ok {
      color: #86efac;
    }

    .maps-key-status--fail {
      color: #fca5a5;
    }

    .maps-key-cta {
      padding: 16px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);

      .cta-title {
        display: block;
        font-weight: 600;
        font-size: var(--font-section);
        letter-spacing: var(--tracking-title);
        color: var(--text-primary);
        line-height: 1.4;
      }

      .cta-description {
        display: block;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: -0.01rem;
        color: #9e9e9e;
        margin: 8px 0 20px 0;
      }

      .cta-button {
        padding: 16px;

        svg {
          height: 20px;
        }
      }
    }

    .custom-key-success-message {
      color: #9e9e9e;
      font-size: 14px;
      display: grid;
      gap: 8px;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background-color: #181818;
    }

    .friends-section {
      padding: 16px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background-color: #181818;
      display: grid;
      gap: 14px;

      .friends-heading {
        font-weight: 500;
        font-size: 18px;
        letter-spacing: -0.02rem;
        color: #f3f3f3;
        margin: 0;
      }

      .friend-code-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #9e9e9e;

        code {
          font-family: ui-monospace, monospace;
          font-size: 15px;
          color: #e5e5e5;
          letter-spacing: 0.06em;
        }
      }

      .friends-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }

      .friend-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 14px;
        color: #e5e5e5;
        padding: 8px 10px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-subtle);
      }

      .friend-add-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: flex-end;
      }
    }

    .logout-btn {
      padding: 1px 14px 0 14px;
      font-weight: 500;
      user-select: none;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      transition: 0.2s;
      border-radius: 6px;
      color: #fee2e2;
      background-color: #7f1d1d;

      &:hover {
        background-color: #991b1b;
      }
    }
  }

  @media (max-width: 600px) {
    .settings-body {
      .maps-key-cta {
        .cta-title {
          font-size: 16px;
        }
      }
    }
  }
`

export default StyledSettingsPage
