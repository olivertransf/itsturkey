import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import { TrashIcon } from '@heroicons/react/outline'
import { MapType } from '@types'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { resolveMapImageSrc } from '@utils/helpers/mapPreviewSrc'
import { StyledMapPreviewCard } from './'

type Props = {
  map: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  showDescription?: boolean
  type?: 'large' | 'small'
  openDeleteModal?: () => void
  isForDisplayOnly?: boolean
}

const MapPreviewCard: FC<Props> = ({
  map,
  showDescription,
  type = 'large',
  openDeleteModal,
  isForDisplayOnly,
}) => {
  const countryCode = typeof map._id === 'string' ? parseEquitableCountryMapKey(map._id) : null
  const flag = countryCode ? flagEmojiFromIsoAlpha2(countryCode) : ''
  const playHref = `/map/${encodeURIComponent(String(map._id))}`
  const previewSrc = resolveMapImageSrc(map.previewImg)

  return (
    <StyledMapPreviewCard isForDisplayOnly={isForDisplayOnly}>
      {type === 'large' && (
        <div className="large-card-wrapper">
          <div className="map-avatar">
            <Image src={previewSrc} alt="" layout="fill" objectFit="cover" sizes="384px" />
            <div className="image-gradient"></div>
          </div>
          <div className="contentWrapper">
            <div className="mapNameWrapper">
              {countryCode && flag ? (
                <div className="mapNameRow">
                  <span className="map-flag" title={map.name} aria-hidden>
                    {flag}
                  </span>
                  <div className="mapName">{map.name}</div>
                </div>
              ) : (
                <div className="mapName">{map.name}</div>
              )}
            </div>
            {showDescription && <div className="mapDescription">{map.description}</div>}
            <div className="playWrapper">
              {!isForDisplayOnly ? (
                <Link href={playHref} className="mapPlayBtn">
                  Play
                </Link>
              ) : (
                <div className="mapPlayBtn">Play</div>
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'small' && (
        <div className="small-card-wrapper">
          <div className="preview-image">
            <Image src={previewSrc} alt="" layout="fill" objectFit="cover" sizes="384px" />
          </div>
          <div className="contentWrapper">
            <div className="mapNameWrapper">
              <div className="mapName">{map.name}</div>
            </div>
            <div className="playWrapper">
              {!isForDisplayOnly ? (
                <Link href={playHref} className="mapPlayBtn">
                  Play
                </Link>
              ) : (
                <div className="mapPlayBtn">Play</div>
              )}
              {openDeleteModal ? (
                <button className="mapDeleteBtn" onClick={openDeleteModal} type="button">
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </StyledMapPreviewCard>
  )
}

export default MapPreviewCard
