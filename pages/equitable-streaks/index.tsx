import { useEffect, useState } from 'react'
import { PageBackLink } from '@components/PageBackLink'
import { WidthController } from '@components/layout'
import { MapLeaderboard } from '@components/MapLeaderboard'
import { Meta } from '@components/Meta'
import { GameSettingsModal } from '@components/modals'
import { SkeletonLeaderboard, SkeletonMapInfo } from '@components/skeletons'
import { StreakMapStats } from '@components/StreakMapStats'
import { Avatar, Button } from '@components/system'
import { VerifiedBadge } from '@components/VerifiedBadge'
import StyledPlayStreaksPage from '@styles/PlayStreaksPage.Styled'
import { MapLeaderboardType, StreakStatsType } from '@types'
import { EQUITABLE_COUNTRY_STREAK_DETAILS, EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'
import { mailman, showToast } from '@utils/helpers'
import { SITE_NAME } from '@utils/constants/site'

const EquitableStreaksPage = () => {
  const [streakStats, setStreakStats] = useState<StreakStatsType>()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  useEffect(() => {
    getStreakStats()
  }, [])

  const getStreakStats = async () => {
    const res = await mailman(`streaks/stats?mapId=${encodeURIComponent(EQUITABLE_COUNTRY_STREAK_ID)}`)

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setStreakStats(res)
  }

  const handleClickPlay = () => {
    setSettingsModalOpen(true)
  }

  return (
    <StyledPlayStreaksPage>
      <WidthController customWidth="1100px" mobilePadding="0px">
        <Meta title={`${SITE_NAME} — ${EQUITABLE_COUNTRY_STREAK_DETAILS.name}`} />
        <PageBackLink href="/" label="Back to home" />

        {streakStats ? (
          <div className="mapDetailsSection">
            <div className="mapDescriptionWrapper">
              <div className="descriptionColumnWrapper">
                <div className="descriptionColumn">
                  <Avatar type="map" src={EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg} size={50} />
                  <div className="map-details">
                    <div className="name-container">
                      <div className="name-wrapper">
                        <span className="name">{EQUITABLE_COUNTRY_STREAK_DETAILS.name}</span>
                      </div>
                      <VerifiedBadge size={20} />
                    </div>
                    <span className="description">{EQUITABLE_COUNTRY_STREAK_DETAILS.description}</span>
                  </div>
                </div>
                <Button className="play-button" onClick={() => handleClickPlay()}>
                  Play Now
                </Button>
              </div>
            </div>

            <div className="statsWrapper">
              <StreakMapStats streakStats={streakStats} />
            </div>
          </div>
        ) : (
          <SkeletonMapInfo />
        )}

        {streakStats ? (
          <MapLeaderboard leaderboard={streakStats.scores as MapLeaderboardType[]} />
        ) : (
          <SkeletonLeaderboard />
        )}
      </WidthController>

      <GameSettingsModal
        isOpen={settingsModalOpen}
        closeModal={() => setSettingsModalOpen(false)}
        mapDetails={EQUITABLE_COUNTRY_STREAK_DETAILS}
        gameMode="streak"
      />
    </StyledPlayStreaksPage>
  )
}

export default EquitableStreaksPage
