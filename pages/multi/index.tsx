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
import StyledMapPage from '@styles/MapPage.Styled'
import { isMapExcludedFromPicker } from '@utils/constants/mapPicker'
import {
  ALLOWED_MULTI_PANEL_COUNTS,
  DEFAULT_MULTI_PANEL_COUNT,
  DEFAULT_MULTI_PER_GUESS_SECONDS,
  MAX_MULTI_PER_GUESS_SECONDS,
  MIN_MULTI_PER_GUESS_SECONDS,
} from '@utils/constants/gameModes'
import type { AllowedMultiPanelCount } from '@utils/constants/gameModes'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { SITE_NAME } from '@utils/constants/site'
import { DEFAULT_MAP_PREVIEW_FILE } from '@utils/helpers/mapPreviewSrc'
import { loadMapPickerOptions } from '@utils/loadMapPickerOptions'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'
import { mailman, showToast } from '@utils/helpers'
import {
  EMPTY_VISUAL_RESTRICTIONS,
  VISUAL_RESTRICTION_CATALOG,
  hasAnyVisualRestriction,
  normalizeVisualRestrictions,
} from '@utils/constants/visualRestrictions'
import type { VisualRestrictions } from '@utils/constants/visualRestrictions'

const MultiLobbyPage: NextPage = () => {
  const router = useRouter()
  const [mapField, setMapField] = useState<string>(OFFICIAL_WORLD_ID)
  const [mapOptions, setMapOptions] = useState<MapPickerRow[]>([])
  const [mapsLoading, setMapsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [defaultsLocked, setDefaultsLocked] = useState(true)
  const [sliderVal, setSliderVal] = useState(0)
  const [panelCount, setPanelCount] = useState<AllowedMultiPanelCount>(DEFAULT_MULTI_PANEL_COUNT)
  const [canMove, setCanMove] = useState(true)
  const [canPan, setCanPan] = useState(true)
  const [canZoom, setCanZoom] = useState(true)
  const [visualRestrictions, setVisualRestrictions] = useState<VisualRestrictions>({})

  useEffect(() => {
    let cancelled = false
    setMapsLoading(true)
    void loadMapPickerOptions({ includeAllMapsOption: true }).then((opts) => {
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
      setMapField(OFFICIAL_WORLD_ID)
    }
  }, [mapField])

  const selectOptions = useMemo(() => {
    const base = mapOptions.filter((m) => !isMapExcludedFromPicker(m._id))
    const q = typeof router.query.mapId === 'string' && router.query.mapId.length > 0 ? router.query.mapId : ''
    if (q && !isMapExcludedFromPicker(q) && !base.some((m) => m._id === q)) {
      return [...base, { _id: q, name: q, description: undefined, previewImg: DEFAULT_MAP_PREVIEW_FILE }]
    }
    return base
  }, [mapOptions, router.query.mapId])

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

    const useAll = mapField === 'all'
    const perGuessSeconds = defaultsLocked
      ? DEFAULT_MULTI_PER_GUESS_SECONDS
      : Math.min(
          MAX_MULTI_PER_GUESS_SECONDS,
          Math.max(MIN_MULTI_PER_GUESS_SECONDS, sliderVal * 10)
        )

    const fx = normalizeVisualRestrictions(visualRestrictions)
    const body = {
      mapId: useAll ? 'all' : mapField,
      ...(!useAll && mapNameForField ? { mapName: mapNameForField } : {}),
      panelCount,
      perGuessSeconds,
      gameSettings: {
        timeLimit: perGuessSeconds,
        canMove: defaultsLocked ? true : canMove,
        canPan: defaultsLocked ? true : canPan,
        canZoom: defaultsLocked ? true : canZoom,
        ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
      },
    }

    const res = await mailman('multi', 'POST', JSON.stringify(body))

    setSubmitting(false)

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    const id = res?._id != null ? String(res._id) : ''
    if (!id) {
      showToast('error', 'Could not start session')
      return
    }

    await router.push(`/multi/${id}`)
  }

  return (
    <StyledMapPage>
      <WidthController customWidth="none">
        <Meta title={`${SITE_NAME} — MultiGuessr`} />

        <section className="mapPlayCard">
          <header className="mapPlayHead">
            <PageBackLink href="/" label="Back" compact />
            <h1 className="mapPlayTitle">MultiGuessr</h1>
          </header>

          <StyledPlaySetup>
            <div className="play-col play-col-main">
              <section className="play-card">
                <h2 className="play-heading">Map</h2>
                <MapPickerGrid
                  options={selectOptions}
                  value={mapField}
                  onChange={setMapField}
                  loading={mapsLoading}
                  maxHeight={220}
                  showDescriptions={false}
                  scrollClassName="play-filter-grid-scroll"
                />
              </section>

              <section className="play-card">
                <h2 className="play-heading">Panels</h2>
                <div className="play-chip-row">
                  {ALLOWED_MULTI_PANEL_COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`play-chip${panelCount === n ? ' is-active' : ''}`}
                      onClick={() => setPanelCount(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
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
                  disabled={submitting || mapsLoading}
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

export default MultiLobbyPage
