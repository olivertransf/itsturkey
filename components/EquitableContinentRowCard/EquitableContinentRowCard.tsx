import { FC } from 'react'
import { HomeMapTile } from '@components/HomeMapTile'
import { MapType } from '@types'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { equitableContinentAccentColor } from '@utils/helpers/equitableContinentAccent'
import { mapNameInitials } from '@utils/helpers/mapPreviewSrc'

type Props = {
  map: Pick<MapType, '_id' | 'name'>
  isForDisplayOnly?: boolean
}

const EquitableContinentRowCard: FC<Props> = ({ map, isForDisplayOnly }) => {
  const slug = typeof map._id === 'string' ? parseEquitableContinentMapKey(map._id) : null
  if (!slug) return null

  const title = map.name?.trim() || slug.toUpperCase()
  const href = `/map/${encodeURIComponent(String(map._id))}`

  return (
    <HomeMapTile
      href={isForDisplayOnly ? undefined : href}
      name={title}
      accent={equitableContinentAccentColor(slug)}
      leading={mapNameInitials(title)}
    />
  )
}

export default EquitableContinentRowCard
