import styled from 'styled-components'

export const ScrollRegion = styled.div<{ $maxHeight: number }>`
  max-height: ${(p) => p.$maxHeight}px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2px 0 4px;
  margin: 0;
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

export const MapRow = styled.button<{ $accent: string; $selected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 9px 11px 9px 9px;
  min-height: 48px;
  margin: 0;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  border: 1px solid var(--border-subtle);
  border-left: 4px solid ${(p) => p.$accent};
  background-color: ${({ theme }) => theme.color.gray[900]};
  box-shadow: ${(p) =>
    p.$selected
      ? 'var(--shadow-card), 0 0 0 2px rgba(129, 140, 248, 0.55)'
      : 'var(--shadow-card)'};
  transition:
    box-shadow 0.12s ease,
    filter 0.12s ease,
    transform 0.12s ease;

  &:hover {
    filter: brightness(1.04);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid rgba(167, 139, 250, 0.85);
    outline-offset: 2px;
  }
`

export const LeadMedia = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.color.gray[800]};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
`

export const LeadFlag = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
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
  color: #a5b4fc;

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
