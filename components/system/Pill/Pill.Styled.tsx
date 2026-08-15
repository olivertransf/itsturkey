import styled from 'styled-components'

const StyledPill = styled.div`
  background-color: var(--control-fill);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  user-select: none;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: var(--radius-pill);
  font-size: var(--font-meta);
  font-weight: 500;
  height: var(--control-height-sm);
`

export default StyledPill
