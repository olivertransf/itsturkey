import Image from 'next/image'
import { FC, ImgHTMLAttributes } from 'react'
import { USER_AVATAR_PATH } from '@utils/constants/random'
import { resolveMapImageSrc } from '@utils/helpers/mapPreviewSrc'
import { StyledAvatar } from './'

type Props = {
  type: 'user' | 'map'
  size?: number
  backgroundColor?: string
} & ImgHTMLAttributes<HTMLDivElement>

const Avatar: FC<Props> = ({ type, size, backgroundColor, src, alt, className, ...rest }) => {
  if (type === 'user') {
    return (
      <StyledAvatar size={size || 32} backgroundColor={backgroundColor} {...rest}>
        <div className={className ?? 'user-avatar'}>
          <Image src={`${USER_AVATAR_PATH}/${src}.svg`} alt={alt || 'User Avatar'} layout="fill" className="emoji" />
        </div>
      </StyledAvatar>
    )
  }

  const mapSrc = resolveMapImageSrc(typeof src === 'string' ? src : undefined)

  return (
    <StyledAvatar size={size || 32} {...rest}>
      <div className="map-avatar">
        <Image
          src={mapSrc}
          alt={alt || 'Map Avatar'}
          layout="fill"
          objectFit="cover"
          sizes="96px"
        />
      </div>
    </StyledAvatar>
  )
}

export default Avatar
