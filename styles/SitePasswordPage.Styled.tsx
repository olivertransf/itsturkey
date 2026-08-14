import styled from 'styled-components'

const StyledSitePasswordPage = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  background: var(--bg-primary);
  color: var(--text-primary);

  .password-card {
    width: min(420px, 100%);
    padding: var(--pad-card);
    border-radius: var(--radius-xl);
    background: var(--bg-elevated);
    border: var(--border-default);
    box-shadow: var(--shadow-card);
  }

  h1 {
    margin: 0 0 var(--space-3);
    font-size: var(--font-title);
    letter-spacing: var(--tracking-title);
  }

  p {
    margin: 0 0 var(--space-5);
    color: var(--text-muted);
    line-height: 1.5;
  }

  form {
    display: grid;
    gap: var(--space-3);
  }

  input {
    height: var(--control-height-md);
    padding: 0 var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-strong);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-body);
  }

  .error {
    margin: 0;
    color: var(--danger);
    font-size: var(--font-meta);
  }
`

export default StyledSitePasswordPage
