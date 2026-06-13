import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { NotFound } from '@components/errorViews'
import { PageBackLink } from '@components/PageBackLink'
import { MapPlayInline } from '@components/GameStartForm'
import { WidthController } from '@components/layout'
import { MapLeaderboard } from '@components/MapLeaderboard'
import { Meta } from '@components/Meta'
import { SkeletonMapInfo } from '@components/skeletons'
import { Tab, Tabs } from '@components/system'
import StyledMapPage from '@styles/MapPage.Styled'
import { MapLeaderboardType, MapType } from '@types'
import { mailman } from '@utils/helpers'
import { recordRecentMapId } from '@utils/helpers/recentMapsStorage'
import { isCustomMapPlaceholderPreview, resolveMapImageSrc } from '@utils/helpers/mapPreviewSrc'
import { SITE_NAME } from '@utils/constants/site'
import {
  LEADERBOARD_BUCKET_LABELS,
  LEADERBOARD_SETTINGS_BUCKETS,
} from '@utils/constants/standardLeaderboard'
import type { LeaderboardSettingsBucket } from '@utils/constants/standardLeaderboard'
import { mapScoresPublicChannel } from '@utils/pusherChannels'
import { usePusherRealtimeHealthy } from '@utils/usePusherRealtimeHealthy'
import { usePusherSubscription } from '@utils/usePusherSubscription'

const LB_POLL_FAST_MS = 12_000
const LB_POLL_SLOW_MS = 120_000

const MapPage: FC = () => {
  const [mapDetails, setMapDetails] = useState<MapType | null>()
  const [topScores, setTopScores] = useState<MapLeaderboardType[]>([])
  const [lowScores, setLowScores] = useState<MapLeaderboardType[]>([])
  const [leaderboardBucket, setLeaderboardBucket] = useState<LeaderboardSettingsBucket>('moving')

  const router = useRouter()
  const rawMapId = router.query.id
  const mapId = Array.isArray(rawMapId) ? rawMapId[0] : rawMapId

  const pushHealthy = usePusherRealtimeHealthy()
  const pushConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY

  const leaderboardChannel = mapId ? mapScoresPublicChannel(mapId) : null

  const lbPollMs = useMemo(() => {
    if (!pushConfigured || !pushHealthy) return LB_POLL_FAST_MS
    return LB_POLL_SLOW_MS
  }, [pushHealthy, pushConfigured])

  const fetchMapDetails = useCallback(async () => {
    if (!mapId) return
    const res = await mailman(`maps/${mapId}`)

    if (res?.error) {
      return setMapDetails(null)
    }

    setMapDetails(res)
  }, [mapId])

  const fetchLeaderboards = useCallback(async () => {
    if (!mapId) return
    const bucketQuery = `bucket=${encodeURIComponent(leaderboardBucket)}`
    const highPath = `scores/${encodeURIComponent(mapId)}?${bucketQuery}`
    const lowPath = `scores/${encodeURIComponent(mapId)}?variant=low&${bucketQuery}`
    const [highRes, lowRes] = await Promise.all([mailman(highPath), mailman(lowPath)])
    setTopScores(Array.isArray(highRes) ? highRes : [])
    setLowScores(Array.isArray(lowRes) ? lowRes : [])
  }, [mapId, leaderboardBucket])

  usePusherSubscription(
    leaderboardChannel,
    'leaderboard.updated',
    () => void fetchLeaderboards(),
    !!leaderboardChannel
  )

  useEffect(() => {
    if (!mapId) {
      return
    }

    recordRecentMapId(mapId)
    fetchMapDetails()
  }, [mapId, fetchMapDetails])

  useEffect(() => {
    if (!mapId) {
      return
    }

    let cancelled = false

    ;(async () => {
      const bucketQuery = `bucket=${encodeURIComponent(leaderboardBucket)}`
      const highPath = `scores/${encodeURIComponent(mapId)}?${bucketQuery}`
      const lowPath = `scores/${encodeURIComponent(mapId)}?variant=low&${bucketQuery}`
      const [highRes, lowRes] = await Promise.all([mailman(highPath), mailman(lowPath)])
      if (cancelled) return
      setTopScores(Array.isArray(highRes) ? highRes : [])
      setLowScores(Array.isArray(lowRes) ? lowRes : [])
    })()

    const handlePageVisibleRefresh = () => {
      if (document.visibilityState === 'visible') {
        void fetchLeaderboards()
      }
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchLeaderboards()
      }
    }, lbPollMs)

    window.addEventListener('focus', handlePageVisibleRefresh)
    document.addEventListener('visibilitychange', handlePageVisibleRefresh)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handlePageVisibleRefresh)
      document.removeEventListener('visibilitychange', handlePageVisibleRefresh)
    }
  }, [mapId, fetchLeaderboards, lbPollMs, leaderboardBucket])

  const mapHeroCustomPlaceholderGradient = useMemo(
    () => (mapDetails ? isCustomMapPlaceholderPreview(mapDetails.previewImg) : false),
    [mapDetails]
  )

  if (mapDetails === null) {
    return (
      <NotFound
        title="Map Not Found"
        message="This map either does not exist, has not been published, or was recently deleted."
      />
    )
  }

  return (
    <StyledMapPage>
      <WidthController customWidth="1100px" mobilePadding="0px">
        <Meta title={mapDetails?.name ? `${SITE_NAME} — ${mapDetails.name}` : SITE_NAME} />

        {mapDetails ? (
          <>
            <div className="mapDetailsSection">
              <div className="mapPageHero">
                <div
                  className={`mapPageHeroMedia${
                    mapHeroCustomPlaceholderGradient ? ' mapPageHeroMedia--placeholder' : ''
                  }`}
                  style={
                    mapHeroCustomPlaceholderGradient
                      ? undefined
                      : { backgroundImage: `url(${resolveMapImageSrc(mapDetails.previewImg)})` }
                  }
                />
                <div className="mapPageHeroScrim" />
                <div className="mapPageHeroInner">
                  <div className="page-back-toolbar">
                    <PageBackLink href="/" label="Back to home" compact />
                  </div>
                  <h1 className="mapPageHeroTitle">{mapDetails.name}</h1>
                </div>
              </div>

              <div className="statsWrapper">
                <MapPlayInline mapDetails={mapDetails} gameMode="standard" />
              </div>
            </div>

            <div className="mapLeaderboardSection">
              <div className="mapLeaderboardBucketTabs">
                <Tabs>
                  {LEADERBOARD_SETTINGS_BUCKETS.map((bucket) => (
                    <Tab
                      key={bucket}
                      isActive={leaderboardBucket === bucket}
                      onClick={() => setLeaderboardBucket(bucket)}
                    >
                      {LEADERBOARD_BUCKET_LABELS[bucket]}
                    </Tab>
                  ))}
                </Tabs>
              </div>
              <div className="mapLeaderboardGrid">
                <div className="mapLeaderboardPanel">
                  <MapLeaderboard leaderboard={topScores} title="High scores" />
                </div>
                <div className="mapLeaderboardPanel">
                  <MapLeaderboard
                    leaderboard={lowScores}
                    title="Low scores"
                    noResultsMessage="No low-score entries yet. Finish a 5-round standard game with these settings to qualify!"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <SkeletonMapInfo />
        )}
      </WidthController>
    </StyledMapPage>
  )
}

export default MapPage
