import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HeartIcon, LightningBoltIcon, SparklesIcon } from '@heroicons/react/outline'
import {
  CreateAccordion,
  CreateFieldGrow,
  CreateFieldInput,
  CreateFieldLabel,
  CreateLobbyShell,
  CreateModeStrip,
  CreateOnlyNarrow,
  CreateRow,
  CreateSection,
  CreateSectionStatic,
  CreateStickyActions,
  CreateWideAside,
  CreateWideLayout,
  CreateWideMain,
} from '@components/CreateLobby'
import { VisualRestrictionsPanel } from '@components/GameStartForm'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { Button } from '@components/system'
import ToggleSwitch from '@components/system/ToggleSwitch/ToggleSwitch'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { isMapExcludedFromPicker } from '@utils/constants/mapPicker'
import { EQUITABLE_COUNTRY_STREAK_DETAILS, EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
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

/** Same pool duels already draw rounds from; default scoring/UI map matches. */
const EQUITABLE_STREAK_PICKER_ROW: MapPickerRow = {
  _id: EQUITABLE_COUNTRY_STREAK_DETAILS._id,
  name: EQUITABLE_COUNTRY_STREAK_DETAILS.name,
  description: EQUITABLE_COUNTRY_STREAK_DETAILS.description,
  previewImg: EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg,
}

const DuelLobbyPage: NextPage = () => {
  const router = useRouter()
  const { status } = useSession()
  const [mapField, setMapField] = useState(EQUITABLE_COUNTRY_STREAK_ID)
  const [mapOptions, setMapOptions] = useState<MapPickerRow[]>([])
  const [mapsLoading, setMapsLoading] = useState(true)

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

  const [mode, setMode] = useState<'hp' | 'points'>('hp')
  const [rounds, setRounds] = useState(DEFAULT_TOTAL_ROUNDS)
  const [startingHpHost, setStartingHpHost] = useState(6000)
  const [startingHpGuest, setStartingHpGuest] = useState(6000)
  const [multiplierMode, setMultiplierMode] = useState<'round_ramp' | 'win_streak'>('round_ramp')
  const [submitting, setSubmitting] = useState(false)
  const [hostNickname, setHostNickname] = useState('')
  const [defaultsLocked, setDefaultsLocked] = useState(true)
  const [sliderVal, setSliderVal] = useState(0)
  const [canMove, setCanMove] = useState(true)
  const [canPan, setCanPan] = useState(true)
  const [canZoom, setCanZoom] = useState(true)
  const [visualRestrictions, setVisualRestrictions] = useState<VisualRestrictions>({})

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

  const create = async () => {
    setSubmitting(true)

    const totalRounds =
      mode === 'points' ? Math.min(MAX_TOTAL_ROUNDS, Math.max(1, Math.floor(Number(rounds) || DEFAULT_TOTAL_ROUNDS))) : undefined

    const fx = normalizeVisualRestrictions(visualRestrictions)
    const body = {
      mapId: mapField,
      ...(mapNameForField ? { mapName: mapNameForField } : {}),
      gameSettings: {
        timeLimit: defaultsLocked ? 0 : sliderVal * 10,
        canMove: defaultsLocked ? true : canMove,
        canPan: defaultsLocked ? true : canPan,
        canZoom: defaultsLocked ? true : canZoom,
        ...(hasAnyVisualRestriction(fx) ? { visualRestrictions: fx } : {}),
      },
      mode,
      ...(mode === 'points' ? { totalRounds } : {}),
      startingHpHost,
      startingHpGuest,
      multiplierMode,
      ...(status !== 'authenticated' && hostNickname.trim() ? { displayName: hostNickname.trim() } : {}),
    }

    const res = await mailman('duels', 'POST', JSON.stringify(body))

    setSubmitting(false)

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    const shortCode = typeof res.shortCode === 'string' ? res.shortCode.trim() : ''
    const fallbackId = res._id != null ? String(res._id) : ''
    const inviteSegment = shortCode || fallbackId
    if (!inviteSegment) {
      showToast('error', 'Missing duel invite — try again')
      return
    }
    await router.push(`/duel/${inviteSegment}`)
  }

  return (
    <StyledMultiGamePage>
      <Meta title="Create Duel" />

      <CreateLobbyShell
        wide
        title="Create duel"
        tag="1v1 invite — share the link or code. Basics stay on the right; pick a map on the left."
        glyph={<SparklesIcon />}
      >
        <CreateWideLayout>
          <CreateWideAside>
            <CreateSection>
              <CreateSectionStatic>
                <CreateFieldLabel as="div">
                  Map{mapNameForField ? ` · ${mapNameForField}` : ''}
                </CreateFieldLabel>
                <MapPickerGrid
                  options={selectOptions}
                  value={mapField}
                  onChange={setMapField}
                  loading={mapsLoading}
                  maxHeight={420}
                  showDescriptions={false}
                />
              </CreateSectionStatic>
            </CreateSection>
          </CreateWideAside>

          <CreateWideMain>
            <CreateSection>
              <CreateSectionStatic>
                {status !== 'authenticated' && status !== 'loading' ? (
                  <div>
                    <CreateFieldLabel htmlFor="hostNick">Your name (guests)</CreateFieldLabel>
                    <CreateFieldInput
                      id="hostNick"
                      type="text"
                      maxLength={32}
                      placeholder="Optional — lobby display"
                      value={hostNickname}
                      onChange={(e) => setHostNickname(e.target.value)}
                    />
                  </div>
                ) : null}

                <div>
                  <CreateFieldLabel as="div">Mode</CreateFieldLabel>
                  <CreateModeStrip>
                    <ToggleSwitch isActive={mode === 'points'} setIsActive={(on) => setMode(on ? 'points' : 'hp')} />
                    <span className="mode-copy">
                      {mode === 'hp' ? (
                        <>
                          <HeartIcon /> HP · until KO
                        </>
                      ) : (
                        <>
                          <LightningBoltIcon /> Points · {rounds} rounds
                        </>
                      )}
                    </span>
                  </CreateModeStrip>
                </div>

                {mode === 'points' ? (
                  <div>
                    <CreateFieldLabel htmlFor="rounds">Rounds</CreateFieldLabel>
                    <CreateFieldInput
                      id="rounds"
                      type="number"
                      min={1}
                      max={MAX_TOTAL_ROUNDS}
                      value={rounds}
                      onChange={(e) => setRounds(Number(e.target.value))}
                    />
                  </div>
                ) : null}

                <CreateRow>
                  <CreateFieldGrow>
                    <CreateFieldLabel htmlFor="hpHost">Your HP</CreateFieldLabel>
                    <CreateFieldInput
                      id="hpHost"
                      type="number"
                      min={100}
                      value={startingHpHost}
                      onChange={(e) => setStartingHpHost(Number(e.target.value))}
                    />
                  </CreateFieldGrow>
                  <CreateFieldGrow>
                    <CreateFieldLabel htmlFor="hpGuest">Opponent HP</CreateFieldLabel>
                    <CreateFieldInput
                      id="hpGuest"
                      type="number"
                      min={100}
                      value={startingHpGuest}
                      onChange={(e) => setStartingHpGuest(Number(e.target.value))}
                    />
                  </CreateFieldGrow>
                </CreateRow>

                {mode === 'hp' ? (
                  <div>
                    <CreateFieldLabel as="div">Damage multiplier</CreateFieldLabel>
                    <CreateModeStrip>
                      <ToggleSwitch
                        isActive={multiplierMode === 'win_streak'}
                        setIsActive={(on) => setMultiplierMode(on ? 'win_streak' : 'round_ramp')}
                      />
                      <span className="mode-copy">
                        {multiplierMode === 'round_ramp'
                          ? 'Round ramp — climbs each round'
                          : 'Win streak — +0.5× per round won'}
                      </span>
                    </CreateModeStrip>
                  </div>
                ) : null}
              </CreateSectionStatic>
            </CreateSection>

            <CreateOnlyNarrow>
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
            </CreateOnlyNarrow>

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
          </CreateWideMain>
        </CreateWideLayout>

        <CreateStickyActions>
          <Button
            variant="primary"
            style={{ width: '100%' }}
            disabled={submitting || status === 'loading'}
            onClick={() => void create()}
          >
            {submitting ? 'Creating…' : 'Create room'}
          </Button>
        </CreateStickyActions>
      </CreateLobbyShell>
    </StyledMultiGamePage>
  )
}

export default DuelLobbyPage
