import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ViewGridIcon } from '@heroicons/react/outline'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import {
  GamifiedCenterStage,
  GamifiedDuelGrid,
  GamifiedDuelMapColumn,
  GamifiedDuelSettingsColumn,
  GamifiedFormCardWide,
} from '@styles/GamifiedHubShell.Styled'
import { DuelLobbyPlonkStrip } from '@components/duel/DuelRoomPanels'
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

const PanelCountRow = styled.div`
  display: flex;
  gap: 8px;
`

const PanelCountBtn = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(47, 127, 255, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(47, 127, 255, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $active }) => ($active ? 'var(--text-primary)' : 'var(--text-muted)')};
  font-size: 14px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: rgba(47, 127, 255, 0.4);
  }
`

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

    const useAll = mapField === 'all'
    const perGuessSeconds = defaultsLocked
      ? DEFAULT_MULTI_PER_GUESS_SECONDS
      : Math.min(
          MAX_MULTI_PER_GUESS_SECONDS,
          Math.max(MIN_MULTI_PER_GUESS_SECONDS, sliderVal * 10)
        )

    const body = {
      mapId: useAll ? 'all' : mapField,
      ...(!useAll && mapNameForField ? { mapName: mapNameForField } : {}),
      panelCount,
      perGuessSeconds,
      gameSettings: {
        timeLimit: perGuessSeconds,
        canMove: defaultsLocked ? true : canMove,
        canPan: defaultsLocked ? true : canPan,
        canZoom: defaultsLocked ? true : canPan,
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

      <GamifiedCenterStage>
        <GamifiedFormCardWide>
          <div style={{ marginBottom: 18 }}>
            <PageBackLink href="/" label="Back to home" />
          </div>

          <CardHero>
            <div className="glyph">
              <ViewGridIcon />
            </div>
            <div>
              <h1>MultiGuessr</h1>
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
                canPan={canPan}
                setCanMove={setCanMove}
                setCanPan={setCanPan}
              />
              <FieldLabel>Panels at once</FieldLabel>
              <PanelCountRow>
                {ALLOWED_MULTI_PANEL_COUNTS.map((n) => (
                  <PanelCountBtn
                    key={n}
                    type="button"
                    $active={panelCount === n}
                    onClick={() => setPanelCount(n)}
                  >
                    {n}
                  </PanelCountBtn>
                ))}
              </PanelCountRow>
              <Button
                variant="primary"
                style={{ marginTop: 16, width: '100%' }}
                disabled={submitting || mapsLoading}
                onClick={() => void start()}
              >
                {submitting ? 'Starting…' : 'Start'}
              </Button>
              <div style={{ marginTop: 18 }}>
                <DuelLobbyPlonkStrip />
              </div>
            </GamifiedDuelSettingsColumn>
          </GamifiedDuelGrid>
        </GamifiedFormCardWide>
      </GamifiedCenterStage>
    </StyledMultiGamePage>
  )
}

export default MultiLobbyPage
