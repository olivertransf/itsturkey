import styled from 'styled-components'

const StyledPageBackLink = styled.div<{ $compact?: boolean }>`
  padding: ${({ $compact }) => ($compact ? '0' : `0 0 var(--stack-gap-sm)`)};
  width: ${({ $compact }) => ($compact ? 'auto' : '100%')};

  @media (max-width: 600px) {
    padding: ${({ $compact }) => ($compact ? '0' : `0 0 var(--stack-gap-xs)`)};
  }

  .page-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;

    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    &:hover {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
`

export default StyledPageBackLink
