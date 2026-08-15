import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'

type Props = {
  mapId: string
  name: string
  description?: string
}

const HomeWorldCard: FC<Props> = ({ mapId, name, description }) => {
  return (
    <HomeSectionRowCard title={name} description={description}>
      <Link href={`/map/${encodeURIComponent(mapId)}`} className="home-play-btn">
        Play
      </Link>
    </HomeSectionRowCard>
  )
}

export default HomeWorldCard
