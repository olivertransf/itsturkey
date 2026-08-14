import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ViewGridIcon } from '@heroicons/react/outline'
import {
  CreateAccordion,
  CreateChoiceChip,
  CreateChipRow,
  CreateFieldLabel,
  CreateLobbyShell,
  CreateSection,
  CreateSectionStatic,
  CreateStickyActions,
} from '@components/CreateLobby'
import { VisualRestrictionsPanel } from '@components/GameStartForm'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { Button } from '@components/system'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
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

  const fxCount = useMemo(
    () => VISUAL_RESTRICTION_CATALOG.filter(({ key }) => Boolean(visualRestrictions[key])).length,
    [visualRestrictions]
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
    <StyledMultiGamePage>
      <Meta title="MultiGuessr" />

      <CreateLobbyShell
        title="MultiGuessr"
        tag="Several Street Views at once. Pick panels, then open map or filters only if you need them."
        glyph={<ViewGridIcon />}
      >
        <CreateSection>
          <CreateSectionStatic>
            <CreateFieldLabel as="div">Panels at once</CreateFieldLabel>
            <CreateChipRow>
              {ALLOWED_MULTI_PANEL_COUNTS.map((n) => (
                <CreateChoiceChip
                  key={n}
                  type="button"
                  $active={panelCount === n}
                  onClick={() => setPanelCount(n)}
                >
                  {n}
                </CreateChoiceChip>
              ))}
            </CreateChipRow>
          </CreateSectionStatic>
        </CreateSection>

        <CreateAccordion
          title="Map"
          summary={mapNameForField || (mapsLoading ? 'Loading…' : 'Choose a map')}
          defaultOpen={false}
        >
          <MapPickerGrid
            options={selectOptions}
            value={mapField}
            onChange={setMapField}
            loading={mapsLoading}
            maxHeight={280}
            showDescriptions={false}
          />
        </CreateAccordion>

        <CreateAccordion
          title="Round & movement"
          summary={defaultsLocked ? 'Default time & movement' : 'Custom time & movement'}
          defaultOpen={false}
        >
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
        </CreateAccordion>

        <CreateAccordion
          title="Wacky filters"
          summary={fxCount > 0 ? `${fxCount} filter${fxCount === 1 ? '' : 's'} on` : 'None'}
          defaultOpen={fxCount > 0}
        >
          <VisualRestrictionsPanel
            value={visualRestrictions}
            onChange={setVisualRestrictions}
            listMaxHeight={220}
          />
        </CreateAccordion>

        <CreateStickyActions>
          <Button
            variant="primary"
            style={{ width: '100%' }}
            disabled={submitting || mapsLoading}
            onClick={() => void start()}
          >
            {submitting ? 'Starting…' : 'Start'}
          </Button>
        </CreateStickyActions>
      </CreateLobbyShell>
    </StyledMultiGamePage>
  )
}

export default MultiLobbyPage
