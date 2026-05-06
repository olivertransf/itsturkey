import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PageBackLink } from '@components/PageBackLink'
import { WidthController } from '@components/layout'
import { MapLeaderboard } from '@components/MapLeaderboard'
import { Meta } from '@components/Meta'
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
  const router = useRouter()
  const [streakStats, setStreakStats] = useState<StreakStatsType>()

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

  return (
    <StyledPlayStreaksPage>
      <WidthController customWidth="1100px" mobilePadding="0px">
        <Meta title={`${SITE_NAME} — ${EQUITABLE_COUNTRY_STREAK_DETAILS.name}`} />

        {streakStats ? (
          <div className="mapDetailsSection">
            <div className="mapDescriptionWrapper">
              <div className="descriptionColumnWrapper">
                <div className="page-back-toolbar">
                  <PageBackLink href="/" label="Back to home" compact />
                </div>
                <div className="descriptionColumnRow">
                  <div className="descriptionColumn">
                    <Avatar type="map" src={EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg} size={50} />
                    <div className="map-details">
                      <div className="name-container">
                        <div className="name-wrapper">
                          <span className="name">{EQUITABLE_COUNTRY_STREAK_DETAILS.name}</span>
                        </div>
                        <VerifiedBadge size={20} />
                      </div>
                    </div>
                  </div>
                  <Button className="play-button" onClick={() => void router.push('/streak')}>
                    Play
                  </Button>
                </div>
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
    </StyledPlayStreaksPage>
  )
}

export default EquitableStreaksPage
