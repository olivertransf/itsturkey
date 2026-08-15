import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import Game from '@backend/models/game'
import MultiSession from '@backend/models/multiSession'
import { NotFound } from '@components/errorViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import { MultiGameView } from '@components/multiGameView'
import type { WatcherChip } from '@components/WatchersIndicator'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { PageType } from '@types'
import { mailman } from '@utils/helpers'
import { spectateFollowDecision } from '@utils/friends/friendPresence'
import { usePresenceHeartbeat } from '@utils/hooks/usePresenceHeartbeat'
import { useVisibleInterval } from '@utils/useVisibleInterval'

type MultiSessionData = {
  session: MultiSession
  panels: Game[]
}

const SPECTATE_POLL_MS = 600
const WATCHERS_POLL_MS = 1500

const MultiGamePage: PageType = () => {
  const [multiData, setMultiData] = useState<MultiSessionData | null>()
  const [isSpectator, setIsSpectator] = useState(false)
  const [watchers, setWatchers] = useState<WatcherChip[]>([])
  const [fatal, setFatal] = useState<string | null>(null)
  const router = useRouter()
  const sessionId = typeof router.query.id === 'string' ? router.query.id : ''
  const spectateMode = router.isReady && router.query.spectate === '1'

  usePresenceHeartbeat(
    isSpectator ? 'spectating' : 'in_game',
    Boolean(multiData),
    sessionId ? { kind: 'multi', id: sessionId } : null
  )

  const fetchMultiSession = useCallback(async () => {
    if (!sessionId) return
    const qs = spectateMode ? '?spectate=1' : ''
    const res = await mailman(`multi/${sessionId}${qs}`)

    if (
      !res ||
      (typeof res === 'object' && res.error) ||
      typeof res !== 'object' ||
      !('session' in res && 'panels' in res)
    ) {
      if (res?.error?.message) setFatal(res.error.message)
      setMultiData(null)
      return
    }

    const asSpectator = Boolean(spectateMode && res.isSpectator)
    if (asSpectator && res.ownerLive) {
      const decision = spectateFollowDecision(
        {
          id: typeof res.ownerLive.userId === 'string' ? res.ownerLive.userId : '',
          online: Boolean(res.ownerLive.online),
          presenceActivity: typeof res.ownerLive.activity === 'string' ? res.ownerLive.activity : undefined,
          presenceSession: res.ownerLive.presenceSession,
        },
        { kind: 'multi', id: sessionId }
      )
      if (decision.action === 'kick') {
        setFatal('Player left')
        setMultiData(null)
        return
      }
      if (decision.action === 'follow') {
        void router.replace(decision.href)
        return
      }
    }

    setIsSpectator(asSpectator)
    setFatal(null)
    setMultiData({
      session: (res as { session: MultiSession }).session,
      panels: (res as { panels: Game[] }).panels,
    })
  }, [sessionId, spectateMode, router])

  const fetchWatchers = useCallback(async () => {
    if (!sessionId || isSpectator) return
    const res = await mailman(`multi/${sessionId}/watchers`)
    if (res?.error || !Array.isArray(res?.watchers)) return
    setWatchers(
      res.watchers.filter(
        (w: unknown): w is WatcherChip =>
          !!w &&
          typeof w === 'object' &&
          typeof (w as WatcherChip).id === 'string' &&
          typeof (w as WatcherChip).name === 'string'
      )
    )
  }, [sessionId, isSpectator])

  useEffect(() => {
    if (!sessionId) return
    void fetchMultiSession()
  }, [sessionId, fetchMultiSession])

  useVisibleInterval(() => void fetchMultiSession(), SPECTATE_POLL_MS, Boolean(isSpectator && multiData))
  useVisibleInterval(() => void fetchWatchers(), WATCHERS_POLL_MS, Boolean(!isSpectator && multiData))

  if (multiData === null) {
    return (
      <NotFound
        title="MultiGuessr Not Found"
        message={fatal || 'This session likely does not exist or does not belong to you.'}
      />
    )
  }

  if (!multiData) {
    return <LoadingPage />
  }

  return (
    <StyledMultiGamePage>
      <Meta title={isSpectator ? 'Spectating MultiGuessr' : 'MultiGuessr'} />
      <MultiGameView
        session={multiData.session}
        panels={multiData.panels}
        isSpectator={isSpectator}
        watchers={watchers}
      />
    </StyledMultiGamePage>
  )
}

MultiGamePage.noLayout = true

export default MultiGamePage
