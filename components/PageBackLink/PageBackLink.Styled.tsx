import styled from 'styled-components'

const StyledPageBackLink = styled.div<{ $compact?: boolean }>`
  padding: ${({ $compact }) => ($compact ? '0' : '8px 0 12px')};

  @media (max-width: 600px) {
    padding: ${({ $compact }) => ($compact ? '0' : '6px 0 10px')};
  }

  .page-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color3);
    text-decoration: none;

    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    &:hover {
      color: var(--color2);
      text-decoration: underline;
    }
  }
`

export default StyledPageBackLink
