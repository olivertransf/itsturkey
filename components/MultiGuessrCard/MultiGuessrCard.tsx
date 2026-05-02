import { useRouter } from 'next/router'
import { FC } from 'react'
import { useState } from 'react'
import { DEFAULT_MULTI_PER_GUESS_SECONDS, DEFAULT_TOTAL_ROUNDS, MAX_MULTI_PANELS } from '@utils/constants/gameModes'
import { mailman, showToast } from '@utils/helpers'
import StyledMultiGuessrCard from './MultiGuessrCard.Styled'

const MultiGuessrCard: FC = () => {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const startMultiGuessr = async () => {
    setIsStarting(true)

    const res = await mailman(
      'multi',
      'POST',
      JSON.stringify({
        mapId: 'all',
        mapName: 'All Maps',
        gameSettings: {
          timeLimit: DEFAULT_MULTI_PER_GUESS_SECONDS,
          canMove: true,
          canPan: true,
          canZoom: true,
        },
        panelCount: MAX_MULTI_PANELS,
        totalRoundsPerPanel: DEFAULT_TOTAL_ROUNDS,
        perGuessSeconds: DEFAULT_MULTI_PER_GUESS_SECONDS,
      })
    )

    if (res.error) {
      setIsStarting(false)
      showToast('error', res.error.message)
      return
    }

    await router.push(`/multi/${res._id}`)
  }

  return (
    <StyledMultiGuessrCard>
      <div className="large-card-wrapper">
        <div className="map-avatar" aria-hidden />
        <div className="contentWrapper">
          <div className="mapNameWrapper">
            <span className="map-accent-dot" aria-hidden />
            <h2 className="mapName">MultiGuessr</h2>
          </div>
          <p className="mapDescription">Play up to four Street View games at once and combine every panel score.</p>
          <div className="playWrapper">
            <button className="mapPlayBtn" disabled={isStarting} onClick={() => void startMultiGuessr()}>
              {isStarting ? 'Starting...' : 'Play'}
            </button>
          </div>
        </div>
      </div>
    </StyledMultiGuessrCard>
  )
}

export default MultiGuessrCard
