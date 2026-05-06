import styled from 'styled-components'

export const PickerRoot = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

export const ScrollRegion = styled.div<{ $maxHeight: number }>`
  max-height: ${(p) => p.$maxHeight}px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 10px 12px;
  margin: 0;
  box-sizing: border-box;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.12);
  }
`

export const ColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  padding: ${(p) => (p.$compact ? '7px 10px 7px 8px' : '9px 11px 9px 9px')};
  min-height: ${(p) => (p.$compact ? 44 : 48)}px;
  margin: 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-elevated);
  box-shadow: ${(p) =>
    p.$selected
      ? `0 0 0 2px rgba(47, 127, 255, 0.48), 0 10px 28px rgba(0, 0, 0, 0.32)`
      : `inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 4px 16px rgba(0, 0, 0, 0.22)`};
  transition:
    box-shadow 0.12s ease,
    filter 0.12s ease,
    transform 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid rgba(47, 127, 255, 0.75);
    outline-offset: 2px;
  }
`

export const LeadMedia = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.color.gray[800]};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
`

export const LeadFlag = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
  background: ${({ theme }) => theme.color.gray[800]};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  user-select: none;
`

export const TextCol = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`

export const RowTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: ${({ theme }) => theme.color.gray[100]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RowDesc = styled.span`
  font-size: 11px;
  font-weight: 400;
  line-height: 1.35;
  color: ${({ theme }) => theme.color.gray[500]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`

export const CheckWrap = styled.span`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--palette-accent);

  .map-picker-check {
    width: 20px;
    height: 20px;
  }
`

export const LoadingHint = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: #a1a1aa;
`

export const SearchWrap = styled.div`
  margin: 0 0 10px;
  width: 100%;
  min-width: 0;

  .map-picker-search {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus {
      border-color: rgba(47, 127, 255, 0.55);
      box-shadow: 0 0 0 2px rgba(47, 127, 255, 0.2);
    }
  }
`
