import { FC } from 'react'
import { HomeMapTile } from '@components/HomeMapTile'
import { getHomeMapAccentColor } from '@utils/helpers'
import { mapNameInitials } from '@utils/helpers/mapPreviewSrc'

type Props = {
  mapId: string
  name: string
  description?: string
}

const HomeWorldCard: FC<Props> = ({ mapId, name }) => {
  return (
    <HomeMapTile
      href={`/map/${encodeURIComponent(mapId)}`}
      name={name}
      accent={getHomeMapAccentColor(name)}
      leading={mapNameInitials(name)}
    />
  )
}

export default HomeWorldCard
