import styled from 'styled-components'

type StyledProps = {
  isActive?: boolean
}

const StyledTab = styled.div<StyledProps>`
  cursor: pointer;
  line-height: 1.4;
  margin: 0;
  padding: var(--space-1) 0;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--font-body);
  font-weight: 600;
  color: ${({ isActive }) => (isActive ? 'var(--text-primary)' : 'var(--text-muted)')};
  border-bottom: 2px solid ${({ isActive }) => (isActive ? 'var(--accent-primary)' : 'transparent')};
  transition: color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease);

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  span {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    user-select: none;
  }
`

export default StyledTab
