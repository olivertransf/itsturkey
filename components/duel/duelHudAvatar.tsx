import styled from 'styled-components'
import { USER_AVATAR_PATH } from '@utils/constants/random'
import type { DuelGuessAvatar } from './duelApiTypes'

export const DUEL_AVATAR_ACCENT_FALLBACK = '#94a3b8'

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.trim().replace('#', '')
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16)
    const g = parseInt(h[1] + h[1], 16)
    const b = parseInt(h[2] + h[2], 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  return `rgba(148, 163, 184, ${alpha})`
}

export const DuelHudMiniAvatar = styled.span<{ $color: string; $size?: 'md' | 'sm' | 'xs' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => ($size === 'xs' ? 22 : $size === 'sm' ? 28 : 40)}px;
  height: ${({ $size }) => ($size === 'xs' ? 22 : $size === 'sm' ? 28 : 40)}px;
  flex-shrink: 0;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ $color }) => hexToRgba($color, 0.4)};
  box-shadow: 0 0 0 2px ${({ $color }) => $color};

  img {
    width: ${({ $size }) => ($size === 'xs' ? 14 : $size === 'sm' ? 18 : 26)}px;
    height: ${({ $size }) => ($size === 'xs' ? 14 : $size === 'sm' ? 18 : 26)}px;
    object-fit: contain;
  }
`

export function duelAvatarAccent(avatar: DuelGuessAvatar): string {
  return avatar.color?.trim() || DUEL_AVATAR_ACCENT_FALLBACK
}

export function duelHudAvatarIcon(avatar: DuelGuessAvatar, size: 'md' | 'sm' | 'xs' = 'md') {
  const c = duelAvatarAccent(avatar)
  return (
    <DuelHudMiniAvatar $color={c} $size={size}>
      <img src={`${USER_AVATAR_PATH}/${avatar.emoji}.svg`} alt="" />
    </DuelHudMiniAvatar>
  )
}
