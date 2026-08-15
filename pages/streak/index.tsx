import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { VisualRestrictionsPanel } from '@components/GameStartForm'
import { StyledPlaySetup } from '@components/GameStartForm/PlaySetup.Styled'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import { WidthController } from '@components/layout'
import { useAppDispatch } from '@redux/hook'
import { updateGameSettings, updateStartTime } from '@redux/slices'
import StyledMapPage from '@styles/MapPage.Styled'
import {
  COUNTRY_STREAK_DETAILS,
  COUNTRY_STREAKS_ID,
  EQUITABLE_COUNTRY_STREAK_DETAILS,
  EQUITABLE_COUNTRY_STREAK_ID,
} from '@utils/constants/random'
import { SITE_NAME } from '@utils/constants/site'
import { mailman, showToast } from '@utils/helpers'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'
import {
  EMPTY_VISUAL_RESTRICTIONS,
  VISUAL_RESTRICTION_CATALOG,
  hasAnyVisualRestriction,
  normalizeVisualRestrictions,
} from '@utils/constants/visualRestrictions'
import type { VisualRestrictions } from '@utils/constants/visualRestrictions'

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

const StreakLobbyPage: NextPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [mapField, setMapField] = useState(EQUITABLE_COUNTRY_STREAK_ID)
  const [submitting, setSubmitting] = useState(false)

  const [defaultsLocked, setDefaultsLocked] = useState(true)
  const [sliderVal, setSliderVal] = useState(0)
  const [canMove, setCanMove] = useState(true)
  const [canPan, setCanPan] = useState(true)
  const [canZoom, setCanZoom] = useState(true)
  const [visualRestrictions, setVisualRestrictions] = useState<VisualRestrictions>({})

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

  const anyFilterOn = VISUAL_RESTRICTION_CATALOG.some(
    ({ key }) => Boolean(normalizeVisualRestrictions(visualRestrictions)[key])
  )

  const onToggleDefaults = useCallback(() => {
    setDefaultsLocked((prev) => {
      if (prev) return false
      setCanMove(true)
      setCanPan(true)
      setCanZoom(true)
      setSliderVal(0)
      setVisualRestrictions({ ...EMPTY_VISUAL_RESTRICTIONS })
      return true
    })
  }, [])

  const start = async () => {
    setSubmitting(true)

    const fx = normalizeVisualRestrictions(visualRestrictions)
    const gameSettings = defaultsLocked
      ? {
          timeLimit: 0,
          canMove: true,
          canPan: true,
          canZoom: true,
          ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
        }
      : {
          timeLimit: sliderVal * 10,
          canMove,
          canPan,
          canZoom,
          ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
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
        gameSettings: {
          canMove: gameSettings.canMove,
          canPan: gameSettings.canPan,
          canZoom: gameSettings.canZoom,
          timeLimit: sliderVal,
          ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
        },
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
    <StyledMapPage>
      <WidthController customWidth="none">
        <Meta title={`${SITE_NAME} — Country streak`} />

        <section className="mapPlayCard">
          <header className="mapPlayHead">
            <PageBackLink href="/" label="Back" compact />
            <h1 className="mapPlayTitle">Country streak</h1>
          </header>

          <StyledPlaySetup>
            <div className="play-col play-col-main">
              <section className="play-card">
                <h2 className="play-heading">Map</h2>
                <MapPickerGrid
                  options={selectOptions}
                  value={mapField}
                  onChange={setMapField}
                  loading={false}
                  visibleCount={4}
                  showDescriptions={false}
                  scrollClassName="play-filter-grid-scroll"
                />
              </section>

              <section className="play-card">
                <h2 className="play-heading">Time & movement</h2>
                <LobbyGameSettings
                  defaultsLocked={defaultsLocked}
                  onToggleDefaults={onToggleDefaults}
                  sliderVal={sliderVal}
                  setSliderVal={setSliderVal}
                  canMove={canMove}
                  canPan={canPan}
                  canZoom={canZoom}
                  setCanMove={setCanMove}
                  setCanPan={setCanPan}
                  setCanZoom={setCanZoom}
                  visualRestrictions={visualRestrictions}
                  setVisualRestrictions={setVisualRestrictions}
                  hideVisualRestrictions
                />
              </section>

              <div className="play-start">
                <Button
                  variant="primary"
                  width="100%"
                  disabled={submitting}
                  isLoading={submitting}
                  onClick={() => void start()}
                >
                  Start
                </Button>
              </div>
            </div>

            <div className="play-col play-col-filters">
              <section className="play-card play-card-filters">
                <div className="play-heading-row">
                  <h2 className="play-heading">Filters</h2>
                  <button
                    type="button"
                    className="play-clear"
                    disabled={!anyFilterOn}
                    onClick={() => setVisualRestrictions({})}
                  >
                    Clear all
                  </button>
                </div>
                <VisualRestrictionsPanel value={visualRestrictions} onChange={setVisualRestrictions} embedded />
              </section>
            </div>
          </StyledPlaySetup>
        </section>
      </WidthController>
    </StyledMapPage>
  )
}

export default StreakLobbyPage
