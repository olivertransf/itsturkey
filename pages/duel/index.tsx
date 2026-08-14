import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HeartIcon, LightningBoltIcon } from '@heroicons/react/outline'
import { VisualRestrictionsPanel } from '@components/GameStartForm'
import { StyledPlaySetup } from '@components/GameStartForm/PlaySetup.Styled'
import { LobbyGameSettings } from '@components/LobbyGameSettings'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button, Slider, ToggleSwitch } from '@components/system'
import { WidthController } from '@components/layout'
import StyledMapPage from '@styles/MapPage.Styled'
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
import { SITE_NAME } from '@utils/constants/site'

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
    <StyledMapPage>
      <WidthController customWidth="none">
        <Meta title={`${SITE_NAME} — Create duel`} />

        <section className="mapPlayCard">
          <header className="mapPlayHead">
            <PageBackLink href="/" label="Back" compact />
            <h1 className="mapPlayTitle">Create duel</h1>
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
                  maxHeight={280}
                  showDescriptions={false}
                  scrollClassName="play-filter-grid-scroll"
                />
              </section>

              <section className="play-card">
                <h2 className="play-heading">Mode</h2>
                {status !== 'authenticated' && status !== 'loading' ? (
                  <div className="play-field">
                    <label className="play-field-label" htmlFor="hostNick">
                      Your name
                    </label>
                    <input
                      id="hostNick"
                      className="play-input"
                      type="text"
                      maxLength={32}
                      placeholder="Optional"
                      value={hostNickname}
                      onChange={(e) => setHostNickname(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="play-mode-row">
                  <ToggleSwitch isActive={mode === 'points'} setIsActive={(on) => setMode(on ? 'points' : 'hp')} />
                  <span className="play-mode-copy">
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
                </div>

                {mode === 'points' ? (
                  <div className="play-field">
                    <span className="roundTimeLabel">
                      <span className="roundLabelGroup">Rounds</span>
                      <span className="timeLimit">
                        {rounds}
                        <span className="labelHint"> / {MAX_TOTAL_ROUNDS}</span>
                      </span>
                    </span>
                    <Slider
                      value={rounds}
                      min={1}
                      max={MAX_TOTAL_ROUNDS}
                      onChange={setRounds}
                    />
                  </div>
                ) : null}

                <div className="play-field-row">
                  <div className="play-field">
                    <label className="play-field-label" htmlFor="hpHost">
                      Your HP
                    </label>
                    <input
                      id="hpHost"
                      className="play-input"
                      type="number"
                      min={100}
                      value={startingHpHost}
                      onChange={(e) => setStartingHpHost(Number(e.target.value))}
                    />
                  </div>
                  <div className="play-field">
                    <label className="play-field-label" htmlFor="hpGuest">
                      Opponent HP
                    </label>
                    <input
                      id="hpGuest"
                      className="play-input"
                      type="number"
                      min={100}
                      value={startingHpGuest}
                      onChange={(e) => setStartingHpGuest(Number(e.target.value))}
                    />
                  </div>
                </div>

                {mode === 'hp' ? (
                  <div className="play-mode-row">
                    <ToggleSwitch
                      isActive={multiplierMode === 'win_streak'}
                      setIsActive={(on) => setMultiplierMode(on ? 'win_streak' : 'round_ramp')}
                    />
                    <span className="play-mode-copy">
                      {multiplierMode === 'round_ramp'
                        ? 'Round ramp, climbs each round'
                        : 'Win streak, +0.5x per round won'}
                    </span>
                  </div>
                ) : null}
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
                  disabled={submitting || status === 'loading'}
                  isLoading={submitting}
                  onClick={() => void create()}
                >
                  Create room
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

export default DuelLobbyPage
