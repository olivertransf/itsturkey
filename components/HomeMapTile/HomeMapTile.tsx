import Link from 'next/link'
import { FC, ReactNode } from 'react'
import StyledHomeMapTile from './HomeMapTile.Styled'

type Props = {
  href?: string
  name: string
  accent: string
  leading: ReactNode
  leadingFlag?: boolean
}

const HomeMapTile: FC<Props> = ({ href, name, accent, leading, leadingFlag }) => {
  const inner = (
    <>
      <span className={`home-map-tile-swatch${leadingFlag ? ' home-map-tile-swatch--flag' : ''}`} aria-hidden>
        {leading}
      </span>
      <span className="home-map-tile-name">{name}</span>
    </>
  )

  return (
    <StyledHomeMapTile>
      {href ? (
        <Link href={href} className="home-map-tile" style={{ ['--tile-accent' as string]: accent }}>
          {inner}
        </Link>
      ) : (
        <div className="home-map-tile" style={{ ['--tile-accent' as string]: accent }}>
          {inner}
        </div>
      )}
    </StyledHomeMapTile>
  )
}

export default HomeMapTile
