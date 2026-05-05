import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useState } from 'react'
import { NotFound } from '@components/errorViews'
import { PageBackLink } from '@components/PageBackLink'
import { MapPlayInline } from '@components/GameStartForm'
import { WidthController } from '@components/layout'
import { MapLeaderboard } from '@components/MapLeaderboard'
import { MapStats } from '@components/MapStats'
import { Meta } from '@components/Meta'
import { SkeletonMapInfo } from '@components/skeletons'
import { Avatar } from '@components/system'
import { TextWithLinks } from '@components/TextWithLinks'
import StyledMapPage from '@styles/MapPage.Styled'
import { MapLeaderboardType, MapType } from '@types'
import { mailman } from '@utils/helpers'
import { SITE_NAME } from '@utils/constants/site'

const MapPage: FC = () => {
  const [mapDetails, setMapDetails] = useState<MapType | null>()
  const [topScores, setTopScores] = useState<MapLeaderboardType[]>([])
  const [lowScores, setLowScores] = useState<MapLeaderboardType[]>([])

  const router = useRouter()
  const rawMapId = router.query.id
  const mapId = Array.isArray(rawMapId) ? rawMapId[0] : rawMapId

  const fetchMapDetails = useCallback(async () => {
    if (!mapId) return
    const res = await mailman(`maps/${mapId}?stats=true`)

    if (res.error) {
      return setMapDetails(null)
    }

    setMapDetails(res)
  }, [mapId])

  const fetchLeaderboards = useCallback(async () => {
    if (!mapId) return
    const highPath = `scores/${encodeURIComponent(mapId)}`
    const lowPath = `scores/${encodeURIComponent(mapId)}?variant=low`
    const [highRes, lowRes] = await Promise.all([mailman(highPath), mailman(lowPath)])
    setTopScores(Array.isArray(highRes) ? highRes : [])
    setLowScores(Array.isArray(lowRes) ? lowRes : [])
  }, [mapId])

  useEffect(() => {
    if (!mapId) {
      return
    }

    fetchMapDetails()
  }, [mapId, fetchMapDetails])

  useEffect(() => {
    if (!mapId) {
      return
    }

    let cancelled = false

    ;(async () => {
      const highPath = `scores/${encodeURIComponent(mapId)}`
      const lowPath = `scores/${encodeURIComponent(mapId)}?variant=low`
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
    }, 12000)

    window.addEventListener('focus', handlePageVisibleRefresh)
    document.addEventListener('visibilitychange', handlePageVisibleRefresh)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handlePageVisibleRefresh)
      document.removeEventListener('visibilitychange', handlePageVisibleRefresh)
    }
  }, [mapId, fetchLeaderboards])

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
              <div className="mapDescriptionWrapper">
                <div className="descriptionColumnWrapper">
                  <div className="page-back-toolbar">
                    <PageBackLink href="/" label="Back to home" compact />
                  </div>
                  <div className="descriptionColumn">
                    <Avatar type="map" src={mapDetails.previewImg} size={50} />
                    <div className="map-details">
                      <div className="name-wrapper">
                        <span className="name">{mapDetails.name}</span>
                      </div>
                      {mapDetails.description && (
                        <span className="description">
                          <TextWithLinks>{mapDetails.description}</TextWithLinks>
                        </span>
                      )}
                      {!mapDetails.description && mapDetails.creatorDetails && (
                        <span className="map-creator">
                          {'Created by '}
                          <span className="map-creator-link">
                            <Link href={`/user/${mapDetails.creatorDetails._id}` || ''}>
                              <a>{mapDetails.creatorDetails.name}</a>
                            </Link>
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="statsWrapper">
                <MapStats map={mapDetails} />
                <MapPlayInline mapDetails={mapDetails} gameMode="standard" />
              </div>
            </div>

            <div className="mapLeaderboardSection">
              <div className="mapLeaderboardGrid">
                <div className="mapLeaderboardPanel">
                  <MapLeaderboard leaderboard={topScores} title="High scores" />
                </div>
                <div className="mapLeaderboardPanel">
                  <MapLeaderboard
                    leaderboard={lowScores}
                    title="Low scores"
                    noResultsMessage="No low-score entries yet. Finish a standard game on this map to qualify!"
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
