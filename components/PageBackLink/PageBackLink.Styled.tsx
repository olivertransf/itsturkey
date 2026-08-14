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
    gap: var(--space-2);
    font-size: var(--font-meta);
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;

    svg {
      width: var(--icon-md);
      height: var(--icon-md);
      flex-shrink: 0;
    }

    &:hover {
      color: var(--text-primary);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }
  }
`

export default StyledPageBackLink
