import { FC } from 'react'
import { HomeMapTile } from '@components/HomeMapTile'
import { MapType } from '@types'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { equitableCountryAccentColor } from '@utils/helpers/equitableCountryAccent'

type Props = {
  map: Pick<MapType, '_id' | 'name'>
  isForDisplayOnly?: boolean
}

const EquitableCountryRowCard: FC<Props> = ({ map, isForDisplayOnly }) => {
  const code = typeof map._id === 'string' ? parseEquitableCountryMapKey(map._id) : null
  if (!code) return null

  const countryName = map.name?.trim() || code.toUpperCase()
  const flag = flagEmojiFromIsoAlpha2(code)
  const href = `/map/${encodeURIComponent(String(map._id))}`

  return (
    <HomeMapTile
      href={isForDisplayOnly ? undefined : href}
      name={countryName}
      accent={equitableCountryAccentColor(code)}
      leading={flag || code.toUpperCase()}
      leadingFlag={Boolean(flag)}
    />
  )
}

export default EquitableCountryRowCard
