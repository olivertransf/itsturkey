import styled from 'styled-components'

const StyledSitePasswordPage = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-primary);
  color: var(--text-primary);

  .password-card {
    width: min(420px, 100%);
    padding: 28px;
    border-radius: 14px;
    background: ${({ theme }) => theme.color.gray[900]};
    border: 1px solid ${({ theme }) => theme.color.gray[800]};
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  }

  h1 {
    margin: 0 0 10px;
    font-size: 1.5rem;
  }

  p {
    margin: 0 0 20px;
    color: ${({ theme }) => theme.color.gray[500]};
    line-height: 1.5;
  }

  form {
    display: grid;
    gap: 12px;
  }

  input {
    height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.color.gray[700]};
    background: ${({ theme }) => theme.color.gray[800]};
    color: #fff;
    font-size: 1rem;
  }

  .error {
    margin: 0;
    color: #f87171;
    font-size: 0.9rem;
  }
`

export default StyledSitePasswordPage
