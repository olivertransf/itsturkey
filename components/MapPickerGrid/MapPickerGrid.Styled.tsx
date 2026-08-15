import styled from 'styled-components'

export const PickerRoot = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`

export const ScrollRegion = styled.div<{ $maxHeight: number }>`
  max-height: ${(p) => p.$maxHeight}px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.38);
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-pill);
  }
`

export const ColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
`

export const MapRow = styled.button<{ $selected: boolean; $compact?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${(p) => (p.$compact ? 8 : 10)}px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: ${(p) => (p.$compact ? '6px 8px' : '8px 10px')};
  min-height: ${(p) => (p.$compact ? 36 : 44)}px;
  margin: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  border: 1px solid ${(p) => (p.$selected ? 'rgba(47, 127, 255, 0.55)' : 'var(--border-subtle)')};
  background-color: ${(p) => (p.$selected ? 'rgba(47, 127, 255, 0.16)' : 'var(--bg-surface)')};

  &:hover {
    border-color: ${(p) => (p.$selected ? 'rgba(47, 127, 255, 0.55)' : 'rgba(255, 255, 255, 0.16)')};
  }

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }
`

export const LeadMedia = styled.span<{ $placeholder?: boolean }>`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
  background: ${({ $placeholder }) => ($placeholder ? 'var(--bg-surface)' : 'var(--bg-elevated)')};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);

  &::after {
    content: ${({ $placeholder }) => ($placeholder ? "''" : 'none')};
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 68% 34%, rgba(251, 191, 36, 0.95) 0 3px, transparent 4px),
      radial-gradient(ellipse 70% 45% at 42% 58%, rgba(255, 255, 255, 0.16), transparent 70%);
    pointer-events: none;
  }
`

export const LeadFlag = styled.span`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  background: var(--bg-elevated);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  user-select: none;
`

export const LeadInitials = styled(LeadFlag)`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`

export const TextCol = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const RowTitle = styled.span`
  font-size: var(--font-meta);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RowDesc = styled.span`
  font-size: var(--font-compact);
  font-weight: 400;
  line-height: 1.3;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`

export const CheckWrap = styled.span`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--palette-accent);

  .map-picker-check {
    width: 16px;
    height: 16px;
  }
`

export const LoadingHint = styled.p`
  margin: 0;
  font-size: var(--font-meta);
  color: var(--text-muted);
`

export const SearchWrap = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding-right: 10px;

  .search-field {
    position: relative;
    width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--text-muted);
    pointer-events: none;
  }

  .map-picker-search {
    width: 100%;
    height: var(--control-height-sm);
    box-sizing: border-box;
    padding: 0 8px 0 30px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-meta);

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }
  }
`
