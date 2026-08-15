import Link from 'next/link'
import { FC, useState } from 'react'
import { HeartIcon as HeartIconOutline } from '@heroicons/react/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/solid'
import { MapType } from '@types'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { mapNameInitials } from '@utils/helpers/mapPreviewSrc'
import { mailman, showToast } from '@utils/helpers'
import { StyledLikedMapCard } from './'

type Props = {
  map: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  reloadMaps: (mapId: string) => void
}

const LikedMapCard: FC<Props> = ({ map, reloadMaps }) => {
  const [isHoveringLike, setIsHoveringLike] = useState(false)
  const countryCode = typeof map._id === 'string' ? parseEquitableCountryMapKey(map._id) : null
  const flag = countryCode ? flagEmojiFromIsoAlpha2(countryCode) : ''

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
      <div className="contentWrapper">
        <div className="mapNameWrapper">
          {countryCode && flag ? (
            <span className="map-flag" title={map.name} aria-hidden>
              {flag}
            </span>
          ) : (
            <span className="map-letter" aria-hidden>
              {mapNameInitials(map.name)}
            </span>
          )}
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
