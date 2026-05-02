import { useRouter } from 'next/router'
import { FC } from 'react'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import StyledDuelGuessrCard from './DuelGuessrCard.Styled'

const DuelGuessrCard: FC = () => {
  const router = useRouter()

  const goCreate = () => {
    void router.push(`/duel?mapId=${OFFICIAL_WORLD_ID}`)
  }

  const goJoin = () => {
    void router.push('/duel/join')
  }

  return (
    <StyledDuelGuessrCard>
      <div className="large-card-wrapper">
        <div className="map-avatar" aria-hidden />
        <div className="contentWrapper">
          <div className="mapNameWrapper">
            <span className="map-accent-dot" aria-hidden />
            <h2 className="mapName">Duels</h2>
          </div>
          <p className="mapDescription">
            1v1 HP fights or fixed-round points races. Invite a friend with a link — no account required.
          </p>
          <div className="playWrapper">
            <button type="button" className="mapPlayBtn" onClick={goCreate}>
              Create
            </button>
            <button type="button" className="mapSecondaryBtn" onClick={goJoin}>
              Join
            </button>
          </div>
        </div>
      </div>
    </StyledDuelGuessrCard>
  )
}

export default DuelGuessrCard
