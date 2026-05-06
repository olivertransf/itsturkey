import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { HeartIcon, LightningBoltIcon, SparklesIcon } from '@heroicons/react/outline'
import { MapPickerGrid } from '@components/MapPickerGrid'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import ToggleSwitch from '@components/system/ToggleSwitch/ToggleSwitch'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import {
  GamifiedCenterStage,
  GamifiedDuelGrid,
  GamifiedDuelMapColumn,
  GamifiedDuelSettingsColumn,
  GamifiedFormCardWide,
} from '@styles/GamifiedHubShell.Styled'
import { isMapExcludedFromPicker } from '@utils/constants/mapPicker'
import { EQUITABLE_COUNTRY_STREAK_DETAILS, EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
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
    background: rgba(110, 178, 232, 0.14);
    border: 1px solid rgba(157, 200, 240, 0.4);
    color: #9dc8f0;

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
    color: #fafafa;
  }

  .tag {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-muted);
  }
`

const FieldLabel = styled.label`
  display: block;
  margin: 14px 0 7px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
`

const FieldInput = styled.input`
  width: 100%;
  padding: 11px 13px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f4f4f5;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(157, 200, 240, 0.55);
    outline: none;
  }
`

const ModeStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);

  span.mode-copy {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);

    svg {
      width: 18px;
      height: 18px;
      opacity: 0.9;
    }
  }
`

const Row = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: flex-end;
`

const FieldGrow = styled.div`
  flex: 1;
  min-width: 140px;
`

/** Same pool duels already draw rounds from (`DUEL_ROUND_LOCATION_POOL_ID`); default scoring/UI map matches. */
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
  const [damageMultHost, setDamageMultHost] = useState(1)
  const [damageMultGuest, setDamageMultGuest] = useState(1)
  const [useRamp, setUseRamp] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hostNickname, setHostNickname] = useState('')

  const create = async () => {
    setSubmitting(true)

    const totalRounds =
      mode === 'points' ? Math.min(MAX_TOTAL_ROUNDS, Math.max(1, Math.floor(Number(rounds) || DEFAULT_TOTAL_ROUNDS))) : undefined

    const body = {
      mapId: mapField,
      ...(mapNameForField ? { mapName: mapNameForField } : {}),
      gameSettings: {
        timeLimit: 90,
        canMove: true,
        canPan: true,
        canZoom: true,
      },
      mode,
      ...(mode === 'points' ? { totalRounds } : {}),
      startingHpHost,
      startingHpGuest,
      damageMultiplierHost: damageMultHost,
      damageMultiplierGuest: damageMultGuest,
      useRoundRamp: useRamp,
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

      <GamifiedCenterStage>
        <GamifiedFormCardWide>
          <div style={{ marginBottom: 18 }}>
            <PageBackLink href="/" label="Home" />
          </div>

          <CardHero>
            <div className="glyph">
              <SparklesIcon />
            </div>
            <div>
              <h1>Create duel room</h1>
              <p className="tag">1v1 invite — share the link or code. Sign in for your name on profile and friends.</p>
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
              {status !== 'authenticated' && status !== 'loading' && (
                <>
                  <FieldLabel htmlFor="hostNick">Your name (guests)</FieldLabel>
                  <FieldInput
                    id="hostNick"
                    type="text"
                    maxLength={32}
                    placeholder="Optional — lobby display"
                    value={hostNickname}
                    onChange={(e) => setHostNickname(e.target.value)}
                    style={{ marginBottom: 12 }}
                  />
                </>
              )}

              <FieldLabel>Mode</FieldLabel>
              <ModeStrip>
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
              </ModeStrip>

              {mode === 'points' && (
                <>
                  <FieldLabel htmlFor="rounds">Rounds</FieldLabel>
                  <FieldInput
                    id="rounds"
                    type="number"
                    min={1}
                    max={MAX_TOTAL_ROUNDS}
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                  />
                </>
              )}

              <Row>
                <FieldGrow>
                  <FieldLabel htmlFor="hpHost">Your HP</FieldLabel>
                  <FieldInput
                    id="hpHost"
                    type="number"
                    min={100}
                    value={startingHpHost}
                    onChange={(e) => setStartingHpHost(Number(e.target.value))}
                  />
                </FieldGrow>
                <FieldGrow>
                  <FieldLabel htmlFor="hpGuest">Opponent HP</FieldLabel>
                  <FieldInput
                    id="hpGuest"
                    type="number"
                    min={100}
                    value={startingHpGuest}
                    onChange={(e) => setStartingHpGuest(Number(e.target.value))}
                  />
                </FieldGrow>
              </Row>

              <Row>
                <FieldGrow>
                  <FieldLabel htmlFor="dmh">Your damage ×</FieldLabel>
                  <FieldInput
                    id="dmh"
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={damageMultHost}
                    onChange={(e) => setDamageMultHost(Number(e.target.value))}
                  />
                </FieldGrow>
                <FieldGrow>
                  <FieldLabel htmlFor="dmg">Their damage ×</FieldLabel>
                  <FieldInput
                    id="dmg"
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={damageMultGuest}
                    onChange={(e) => setDamageMultGuest(Number(e.target.value))}
                  />
                </FieldGrow>
              </Row>

              <FieldLabel style={{ marginTop: 12 }}>Damage ramp (5+)</FieldLabel>
              <ModeStrip style={{ marginTop: 4 }}>
                <ToggleSwitch isActive={useRamp} setIsActive={setUseRamp} />
                <span className="mode-copy">{useRamp ? 'Scaling on' : 'Flat damage'}</span>
              </ModeStrip>

              <Button
                variant="primary"
                style={{ marginTop: 20, width: '100%' }}
                disabled={submitting || status === 'loading'}
                onClick={() => void create()}
              >
                {submitting ? 'Creating…' : 'Create room'}
              </Button>
            </GamifiedDuelSettingsColumn>
          </GamifiedDuelGrid>
        </GamifiedFormCardWide>
      </GamifiedCenterStage>
    </StyledMultiGamePage>
  )
}

export default DuelLobbyPage
