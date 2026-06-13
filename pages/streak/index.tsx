import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import { useAppDispatch } from '@redux/hook'
import { updateGameSettings, updateStartTime } from '@redux/slices'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import {
  GamifiedCenterStage,
  GamifiedDuelGrid,
  GamifiedDuelMapColumn,
  GamifiedDuelSettingsColumn,
  GamifiedFormCardWide,
} from '@styles/GamifiedHubShell.Styled'
import {
  COUNTRY_STREAK_DETAILS,
  COUNTRY_STREAKS_ID,
  EQUITABLE_COUNTRY_STREAK_DETAILS,
  EQUITABLE_COUNTRY_STREAK_ID,
} from '@utils/constants/random'
import { mailman, showToast } from '@utils/helpers'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'
import styled from 'styled-components'

const ALLOWED_STREAK_MAP_IDS = new Set([EQUITABLE_COUNTRY_STREAK_ID, COUNTRY_STREAKS_ID])

const STREAK_MAP_OPTIONS: MapPickerRow[] = [
  {
    _id: EQUITABLE_COUNTRY_STREAK_DETAILS._id,
    name: EQUITABLE_COUNTRY_STREAK_DETAILS.name,
    description: EQUITABLE_COUNTRY_STREAK_DETAILS.description,
    previewImg: EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg,
  },
  {
    _id: COUNTRY_STREAK_DETAILS._id,
    name: COUNTRY_STREAK_DETAILS.name,
    description: COUNTRY_STREAK_DETAILS.description,
    previewImg: COUNTRY_STREAK_DETAILS.previewImg,
  },
]

const CardHero = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;

  .glyph {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(47, 127, 255, 0.12);
    border: 1px solid rgba(47, 127, 255, 0.35);
    color: var(--accent-primary);

    svg {
      width: 26px;
      height: 26px;
    }
  }

  h1 {
    margin: 0;
    font-size: clamp(1.35rem, 4vw, 1.65rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: var(--text-primary);
  }
`

const FieldLabel = styled.label`
  display: block;
  margin: 14px 0 7px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
`

const StreakLobbyPage: NextPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [mapField, setMapField] = useState(EQUITABLE_COUNTRY_STREAK_ID)
  const [submitting, setSubmitting] = useState(false)

  const [defaultsLocked, setDefaultsLocked] = useState(true)
  const [sliderVal, setSliderVal] = useState(0)
  const [canMove, setCanMove] = useState(true)
  const [canPan, setCanPan] = useState(true)

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.mapId
    if (typeof q === 'string' && q.length > 0 && ALLOWED_STREAK_MAP_IDS.has(q)) {
      setMapField(q)
    }
  }, [router.isReady, router.query.mapId])

  useEffect(() => {
    if (!ALLOWED_STREAK_MAP_IDS.has(mapField)) {
      setMapField(EQUITABLE_COUNTRY_STREAK_ID)
    }
  }, [mapField])

  const selectOptions = useMemo(() => STREAK_MAP_OPTIONS, [])

  const mapNameForField = useMemo(
    () => selectOptions.find((m) => m._id === mapField)?.name,
    [selectOptions, mapField]
  )

  const onToggleDefaults = useCallback(() => {
    setDefaultsLocked((prev) => {
      if (prev) return false
      setCanMove(true)
      setCanPan(true)
      setSliderVal(0)
      return true
    })
  }, [])

  const start = async () => {
    setSubmitting(true)

    const gameSettings = defaultsLocked
      ? { timeLimit: 0, canMove: true, canPan: true, canZoom: true }
      : {
          timeLimit: sliderVal * 10,
          canMove,
          canPan,
          canZoom: canPan,
        }

    const gameData = {
      mapId: mapField,
      ...(mapNameForField ? { mapName: mapNameForField } : {}),
      gameSettings,
      mode: 'streak' as const,
      unlimited: true,
    }

    dispatch(updateStartTime({ startTime: new Date().getTime() }))
    dispatch(
      updateGameSettings({
        gameSettings: { canMove: gameSettings.canMove, canPan: gameSettings.canPan, canZoom: gameSettings.canZoom, timeLimit: sliderVal },
      })
    )

    const res = await mailman('games', 'POST', JSON.stringify(gameData))

    setSubmitting(false)

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    const id = res?._id != null ? String(res._id) : ''
    if (!id) {
      showToast('error', 'Could not start game')
      return
    }

    await router.push(`/game/${id}`)
  }

  return (
    <StyledMultiGamePage>
      <Meta title="Country streak" />

      <GamifiedCenterStage>
        <GamifiedFormCardWide>
          <div style={{ marginBottom: 18 }}>
            <PageBackLink href="/" label="Back to home" />
          </div>

          <CardHero>
            <div className="glyph">
              <GlobeAltIcon />
            </div>
            <div>
              <h1>Country streak</h1>
            </div>
          </CardHero>

          <GamifiedDuelGrid>
            <GamifiedDuelMapColumn>
              <FieldLabel>Map</FieldLabel>
              <MapPickerGrid
                options={selectOptions}
                value={mapField}
                onChange={setMapField}
                loading={false}
                maxHeight={440}
                showDescriptions={false}
              />
            </GamifiedDuelMapColumn>

            <GamifiedDuelSettingsColumn>
              <LobbyGameSettings
                defaultsLocked={defaultsLocked}
                onToggleDefaults={onToggleDefaults}
                sliderVal={sliderVal}
                setSliderVal={setSliderVal}
                canMove={canMove}
                canPan={canPan}
                setCanMove={setCanMove}
                setCanPan={setCanPan}
              />
              <Button
                variant="primary"
                style={{ marginTop: 16, width: '100%' }}
                disabled={submitting}
                onClick={() => void start()}
              >
                {submitting ? 'Starting…' : 'Start'}
              </Button>
            </GamifiedDuelSettingsColumn>
          </GamifiedDuelGrid>
        </GamifiedFormCardWide>
      </GamifiedCenterStage>
    </StyledMultiGamePage>
  )
}

export default StreakLobbyPage
