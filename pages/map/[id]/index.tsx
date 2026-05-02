import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { NotFound } from '@components/errorViews'
import { PageBackLink } from '@components/PageBackLink'
import { MapPlayInline } from '@components/GameStartForm'
import { WidthController } from '@components/layout'
import { MapStats } from '@components/MapStats'
import { Meta } from '@components/Meta'
import { SkeletonMapInfo } from '@components/skeletons'
import { Avatar } from '@components/system'
import { TextWithLinks } from '@components/TextWithLinks'
import StyledMapPage from '@styles/MapPage.Styled'
import { MapType } from '@types'
import { mailman } from '@utils/helpers'
import { SITE_NAME } from '@utils/constants/site'

const MapPage: FC = () => {
  const [mapDetails, setMapDetails] = useState<MapType | null>()

  const router = useRouter()
  const mapId = router.query.id

  useEffect(() => {
    if (!mapId) {
      return
    }

    fetchMapDetails()
  }, [mapId])

  const fetchMapDetails = async () => {
    const res = await mailman(`maps/${mapId}?stats=true`)

    if (res.error) {
      return setMapDetails(null)
    }

    setMapDetails(res)
  }

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
          <div className="mapDetailsSection">
            <div className="map-page-back-row">
              <PageBackLink />
            </div>

            <div className="mapDescriptionWrapper">
              <div className="descriptionColumnWrapper">
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
        ) : (
          <SkeletonMapInfo />
        )}
      </WidthController>
    </StyledMapPage>
  )
}

export default MapPage
