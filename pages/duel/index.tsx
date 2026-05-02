import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import ToggleSwitch from '@components/system/ToggleSwitch/ToggleSwitch'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { DEFAULT_TOTAL_ROUNDS, MAX_TOTAL_ROUNDS } from '@utils/constants/gameModes'
import { mailman, showToast } from '@utils/helpers'
import styled from 'styled-components'

const Panel = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 24px 18px;
  color: #eee;

  h1 {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }

  label {
    display: block;
    margin: 14px 0 6px;
    font-size: 13px;
    opacity: 0.85;
  }

  input[type='number'],
  input[type='text'] {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #444;
    background: #151515;
    color: #eee;
    box-sizing: border-box;
  }

  .row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .field {
    flex: 1;
    min-width: 140px;
  }
`

const DuelLobbyPage: NextPage = () => {
  const router = useRouter()
  const [mapField, setMapField] = useState(OFFICIAL_WORLD_ID)

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.mapId
    if (typeof q === 'string' && q.length > 0) setMapField(q)
  }, [router.isReady, router.query.mapId])

  const [mode, setMode] = useState<'hp' | 'points'>('hp')
  const [rounds, setRounds] = useState(DEFAULT_TOTAL_ROUNDS)
  const [startingHpHost, setStartingHpHost] = useState(6000)
  const [startingHpGuest, setStartingHpGuest] = useState(6000)
  const [damageMultHost, setDamageMultHost] = useState(1)
  const [damageMultGuest, setDamageMultGuest] = useState(1)
  const [useRamp, setUseRamp] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const create = async () => {
    setSubmitting(true)

    const totalRounds =
      mode === 'points' ? Math.min(MAX_TOTAL_ROUNDS, Math.max(1, Math.floor(Number(rounds) || DEFAULT_TOTAL_ROUNDS))) : undefined

    const body = {
      mapId: mapField,
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
    }

    const res = await mailman('duels', 'POST', JSON.stringify(body))

    setSubmitting(false)

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    const id = res._id as string
    await router.push(`/duel/${id}`)
  }

  return (
    <StyledMultiGamePage>
      <Meta title="Create Duel" />

      <Panel>
        <PageBackLink href="/" label="Home" />

        <h1>Create duel</h1>
        <p style={{ opacity: 0.85, marginBottom: 8 }}>
          1v1 Street View duel with invite link. No account required — guests should join from another browser or incognito.
        </p>

        <label htmlFor="mapId">Map ID</label>
        <input id="mapId" type="text" value={mapField} onChange={(e) => setMapField(e.target.value)} />

        <label>Mode</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ToggleSwitch isActive={mode === 'points'} setIsActive={(on) => setMode(on ? 'points' : 'hp')} />
          <span>{mode === 'hp' ? 'HP duel (KO)' : `Points race (${rounds} rounds)`}</span>
        </div>

        {mode === 'points' && (
          <>
            <label htmlFor="rounds">Rounds</label>
            <input
              id="rounds"
              type="number"
              min={1}
              max={MAX_TOTAL_ROUNDS}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
            />
          </>
        )}

        <div className="row">
          <div className="field">
            <label htmlFor="hpHost">Host starting HP</label>
            <input
              id="hpHost"
              type="number"
              min={100}
              value={startingHpHost}
              onChange={(e) => setStartingHpHost(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="hpGuest">Guest starting HP</label>
            <input
              id="hpGuest"
              type="number"
              min={100}
              value={startingHpGuest}
              onChange={(e) => setStartingHpGuest(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="dmh">Host damage multiplier</label>
            <input
              id="dmh"
              type="number"
              min={0.1}
              step={0.1}
              value={damageMultHost}
              onChange={(e) => setDamageMultHost(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="dmg">Guest damage multiplier</label>
            <input
              id="dmg"
              type="number"
              min={0.1}
              step={0.1}
              value={damageMultGuest}
              onChange={(e) => setDamageMultGuest(Number(e.target.value))}
            />
          </div>
        </div>

        <label style={{ marginTop: 16 }}>GeoGuessr-style damage ramp from round 5</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ToggleSwitch isActive={useRamp} setIsActive={setUseRamp} />
          <span>{useRamp ? 'Enabled' : 'Off'}</span>
        </div>

        <Button variant="solidGray" style={{ marginTop: 22 }} disabled={submitting} onClick={() => void create()}>
          {submitting ? 'Creating…' : 'Create duel'}
        </Button>
      </Panel>
    </StyledMultiGamePage>
  )
}

export default DuelLobbyPage
