import { useRouter } from 'next/router'
import { FC } from 'react'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import HomeSectionRowCard from '@components/HomeSectionRowCard'

const ACCENT = '#fb923c'

const DuelGuessrCard: FC = () => {
  const router = useRouter()

  const goCreate = () => {
    void router.push(`/duel?mapId=${OFFICIAL_WORLD_ID}`)
  }

  const goJoin = () => {
    void router.push('/duel/join')
  }

  return (
    <HomeSectionRowCard
      accentColor={ACCENT}
      title="Duels"
      description="1v1 HP fights or fixed-round races. Invite a friend with a link — no account required."
    >
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
