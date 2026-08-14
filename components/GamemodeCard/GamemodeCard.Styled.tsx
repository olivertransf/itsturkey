import styled from 'styled-components'

type StyledProps = {
  titleColor: string
}

const StyledGamemodeCard = styled.div<StyledProps>`
  background: var(--bg-card);
  border: var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--pad-card);
  box-shadow: var(--shadow-card);

  .gamemode-details {
    margin-bottom: var(--space-5);

    h2 {
      color: var(--text-primary);
      font-weight: 600;
      margin-bottom: var(--space-3);
      letter-spacing: var(--tracking-title);
      font-size: var(--font-display);
    }

    p {
      color: var(--text-muted);
      font-size: var(--font-body);
      font-weight: 500;
    }
  }
`

export default StyledGamemodeCard
