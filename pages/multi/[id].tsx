import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Game from '@backend/models/game'
import MultiSession from '@backend/models/multiSession'
import { NotFound } from '@components/errorViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import { MultiGameView } from '@components/multiGameView'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { PageType } from '@types'
import { mailman } from '@utils/helpers'

type MultiSessionData = {
  session: MultiSession
  panels: Game[]
}

const MultiGamePage: PageType = () => {
  const [multiData, setMultiData] = useState<MultiSessionData | null>()
  const router = useRouter()
  const sessionId = router.query.id as string

  useEffect(() => {
    if (!sessionId) {
      return
    }

    const fetchMultiSession = async () => {
      const res = await mailman(`multi/${sessionId}`)

      if (res.error) {
        setMultiData(null)
        return
      }

      setMultiData({ session: res.session, panels: res.panels })
    }

    void fetchMultiSession()
  }, [sessionId])

  if (multiData === null) {
    return <NotFound title="MultiGuessr Not Found" message="This session likely does not exist or does not belong to you." />
  }

  if (!multiData) {
    return <LoadingPage />
  }

  return (
    <StyledMultiGamePage>
      <Meta title="MultiGuessr" />
      <MultiGameView session={multiData.session} panels={multiData.panels} />
    </StyledMultiGamePage>
  )
}

MultiGamePage.noLayout = true

export default MultiGamePage
