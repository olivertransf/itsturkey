import Image from 'next/image'
import Link from 'next/link'
import { FC, useState } from 'react'
import { HeartIcon as HeartIconOutline } from '@heroicons/react/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/solid'
import { MapType } from '@types'
import { isGenericMapPreview, mapNameInitials, resolveMapImageSrc } from '@utils/helpers/mapPreviewSrc'
import { mailman, showToast } from '@utils/helpers'
import { StyledLikedMapCard } from './'

type Props = {
  map: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  reloadMaps: (mapId: string) => void
}

const LikedMapCard: FC<Props> = ({ map, reloadMaps }) => {
  const [isHoveringLike, setIsHoveringLike] = useState(false)
  const showPhoto = !isGenericMapPreview(map.previewImg)

  const handleUnlike = async () => {
    const res = await mailman(`likes/${map._id}`, 'DELETE')

    if (res.error) {
      return showToast('error', res.error.message)
    }

    showToast('success', res.message)

    reloadMaps(map._id as string)
  }

  return (
    <StyledLikedMapCard>
      {showPhoto ? (
        <div className="map-avatar">
          <Image src={resolveMapImageSrc(map.previewImg)} alt="" layout="fill" objectFit="cover" sizes="720px" />
        </div>
      ) : null}

      <div className="contentWrapper">
        <div className="mapNameWrapper">
          {!showPhoto ? (
            <span className="map-letter" aria-hidden>
              {mapNameInitials(map.name)}
            </span>
          ) : null}
          <div className="mapName">{map.name}</div>
        </div>
        <div className="playWrapper">
          <Link href={`/map/${map._id}`} className="mapPlayBtn">
            Play
          </Link>
          <button
            className="unlike-button"
            onClick={() => handleUnlike()}
            onMouseEnter={() => setIsHoveringLike(true)}
            onMouseLeave={() => setIsHoveringLike(false)}
          >
            {isHoveringLike ? <HeartIconOutline /> : <HeartIconSolid />}
          </button>
        </div>
      </div>
    </StyledLikedMapCard>
  )
}

export default LikedMapCard
