import { FC } from 'react'
import styled from 'styled-components'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import { mapNameInitials } from '@utils/helpers/mapPreviewSrc'

type Props = {
  mapId?: string
  name: string
  size?: number
}

const Tile = styled.span<{ $size: number; $flag: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ $flag, $size }) => ($flag ? '50%' : $size > 40 ? 'var(--radius-md)' : 'var(--radius-sm)')};
  background: ${({ $flag }) => ($flag ? 'transparent' : 'var(--control-fill)')};
  color: var(--text-primary);
  font-size: ${({ $flag, $size }) => ($flag ? `${Math.round($size * 0.72)}px` : `${Math.max(11, Math.round($size * 0.32))}px`)};
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  user-select: none;
`

const MapRowTile: FC<Props> = ({ mapId, name, size = 36 }) => {
  const code = typeof mapId === 'string' ? parseEquitableCountryMapKey(mapId) : null
  const flag = code ? flagEmojiFromIsoAlpha2(code) : ''

  if (code && flag) {
    return (
      <Tile $size={size} $flag title={name} aria-hidden>
        {flag}
      </Tile>
    )
  }

  return (
    <Tile $size={size} $flag={false} aria-hidden>
      {mapNameInitials(name || '?')}
    </Tile>
  )
}

export default MapRowTile
