import styled from 'styled-components'

const StyledAuthPage = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);

  .authContainer {
    max-width: 400px;
    width: 100%;
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    border-radius: var(--radius-xl);
    padding: var(--pad-card);
    box-shadow: var(--shadow-card);
    border: var(--border-default);

    @media (max-width: 600px) {
      box-shadow: none;
      border: none;
      padding: var(--space-6) var(--space-4);
      background-color: inherit;
    }
  }

  .title {
    font-weight: 600;
    font-size: var(--font-title);
    letter-spacing: var(--tracking-title);
    margin-bottom: var(--space-5);
    color: var(--text-primary);
  }

  .form-container {
    padding-top: var(--space-5);
    border-top: 1px solid var(--divider-line);

    .inputGroup {
      display: grid;
      gap: var(--space-5);

      @media (max-width: 600px) {
        border-top: none;
        padding-top: var(--space-5);
      }
    }

    .forgot-message {
      font-weight: 500;
      font-size: var(--font-meta);
      color: var(--accent-primary);
      display: block;
      margin: var(--space-3) 0 var(--space-5);
      cursor: pointer;
      width: fit-content;

      &:hover {
        color: var(--accent-primary-hover);
      }
    }

    .submit-button {
      margin-top: var(--space-5);
    }
  }

  .authPrompt {
    font-weight: 500;
    display: block;
    text-align: center;
    color: var(--text-muted);
    margin-top: var(--space-4);
    font-size: var(--font-meta);

    a {
      color: var(--accent-primary);
      display: inline-flex;
      margin-left: var(--space-1);

      &:hover {
        color: var(--accent-primary-hover);
      }
    }
  }

  .logoWrapper {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
  }

  .email-sent-container {
    .email-sent-msg {
      color: var(--text-muted);
      font-weight: 500;
      font-size: var(--font-body);
      line-height: 1.45;

      button {
        background: transparent;
        color: var(--accent-primary);
        font-weight: 500;
        font-size: var(--font-body);
        margin-left: var(--space-1);
      }
    }
  }
`

export default StyledAuthPage
