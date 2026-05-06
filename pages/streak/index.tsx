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
import { isMapExcludedFromPicker } from '@utils/constants/mapPicker'
import {
  EQUITABLE_COUNTRY_STREAK_DETAILS,
  EQUITABLE_COUNTRY_STREAK_ID,
} from '@utils/constants/random'
import { DEFAULT_MAP_PREVIEW_FILE } from '@utils/helpers/mapPreviewSrc'
import { loadMapPickerOptions } from '@utils/loadMapPickerOptions'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'
import { mailman, showToast } from '@utils/helpers'
import styled from 'styled-components'

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

const EQUITABLE_STREAK_PICKER_ROW: MapPickerRow = {
  _id: EQUITABLE_COUNTRY_STREAK_DETAILS._id,
  name: EQUITABLE_COUNTRY_STREAK_DETAILS.name,
  description: EQUITABLE_COUNTRY_STREAK_DETAILS.description,
  previewImg: EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg,
}

const StreakLobbyPage: NextPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [mapField, setMapField] = useState(EQUITABLE_COUNTRY_STREAK_ID)
  const [mapOptions, setMapOptions] = useState<MapPickerRow[]>([])
  const [mapsLoading, setMapsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [defaultsLocked, setDefaultsLocked] = useState(true)
  const [sliderVal, setSliderVal] = useState(0)
  const [canMove, setCanMove] = useState(true)
  const [canZoom, setCanZoom] = useState(true)

  useEffect(() => {
    let cancelled = false
    setMapsLoading(true)
    void loadMapPickerOptions({ includeAllMapsOption: false }).then((opts) => {
      if (cancelled) return
      setMapOptions(opts)
      setMapsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.mapId
    if (typeof q === 'string' && q.length > 0 && !isMapExcludedFromPicker(q)) {
      setMapField(q)
    }
  }, [router.isReady, router.query.mapId])

  useEffect(() => {
    if (isMapExcludedFromPicker(mapField)) {
      setMapField(EQUITABLE_COUNTRY_STREAK_ID)
    }
  }, [mapField])

  const selectOptions = useMemo(() => {
    const base = mapOptions.filter((m) => !isMapExcludedFromPicker(m._id))
    const withEquitableDefault =
      base.some((m) => m._id === EQUITABLE_COUNTRY_STREAK_ID) ? base : [EQUITABLE_STREAK_PICKER_ROW, ...base]
    const q = typeof router.query.mapId === 'string' && router.query.mapId.length > 0 ? router.query.mapId : ''
    if (q && !isMapExcludedFromPicker(q) && !withEquitableDefault.some((m) => m._id === q)) {
      return [...withEquitableDefault, { _id: q, name: q, description: undefined, previewImg: DEFAULT_MAP_PREVIEW_FILE }]
    }
    return withEquitableDefault
  }, [mapOptions, router.query.mapId])

  const mapNameForField = useMemo(
    () => selectOptions.find((m) => m._id === mapField)?.name,
    [selectOptions, mapField]
  )

  const onToggleDefaults = useCallback(() => {
    setDefaultsLocked((prev) => {
      if (prev) return false
      setCanMove(true)
      setCanZoom(true)
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
          canPan: canMove,
          canZoom,
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
                loading={mapsLoading}
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
                canZoom={canZoom}
                setCanMove={setCanMove}
                setCanZoom={setCanZoom}
              />
              <Button
                variant="primary"
                style={{ marginTop: 16, width: '100%' }}
                disabled={submitting || mapsLoading}
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
