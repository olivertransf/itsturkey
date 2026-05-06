import { useRouter } from 'next/router'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'

const DuelGuessrCard: FC = () => {
  const router = useRouter()

  const goCreate = () => {
    void router.push('/duel')
  }

  const goJoin = () => {
    void router.push('/duel/join')
  }

  return (
    <HomeSectionRowCard title="Duels">
      <button type="button" className="home-play-btn" onClick={goCreate}>
        Create
      </button>
      <button type="button" className="home-play-btn home-play-btn--secondary" onClick={goJoin}>
        Join
      </button>
    </HomeSectionRowCard>
  )
}

export default DuelGuessrCard
