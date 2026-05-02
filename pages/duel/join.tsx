import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import { LinkIcon, UserGroupIcon } from '@heroicons/react/outline'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { GamifiedCenterStage, GamifiedFormCard } from '@styles/GamifiedHubShell.Styled'
import { showToast } from '@utils/helpers'
import { parseDuelInviteInput } from '@utils/helpers/duelInvite'
import styled from 'styled-components'

const CardHero = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;

  .glyph {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.18);
    border: 1px solid rgba(96, 165, 250, 0.42);
    color: #bfdbfe;

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
    color: #fafafa;
  }

  .tag {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.45;
    color: #a1a1aa;
  }
`

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
`

const FieldInput = styled.input`
  width: 100%;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f4f4f5;
  font-size: 15px;
  box-sizing: border-box;
  margin-bottom: 18px;

  &:focus {
    border-color: rgba(96, 165, 250, 0.55);
    outline: none;
  }

  &::placeholder {
    color: #71717a;
  }
`

const DuelJoinPage: NextPage = () => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const segment = parseDuelInviteInput(value)
    if (!segment) {
      showToast('error', 'Paste your duel link, the 4-letter code, or the full duel ID')
      return
    }
    setBusy(true)
    void router.push(`/duel/${segment}`)
  }

  return (
    <StyledMultiGamePage>
      <Meta title="Join Duel" />

      <GamifiedCenterStage>
        <GamifiedFormCard>
          <div style={{ marginBottom: 18 }}>
            <PageBackLink href="/" label="Home" />
          </div>

          <CardHero>
            <div className="glyph">
              <UserGroupIcon />
            </div>
            <div>
              <h1>Join a duel</h1>
              <p className="tag">Paste the host&apos;s invite link or the raw duel ID from the URL.</p>
            </div>
          </CardHero>

          <form onSubmit={onSubmit}>
            <FieldLabel htmlFor="duelRef">Invite link or ID</FieldLabel>
            <FieldInput
              id="duelRef"
              type="text"
              autoComplete="off"
              placeholder="Link or code (e.g. X7K2)"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
            />
            <Button type="submit" variant="primary" width="100%" disabled={busy}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <LinkIcon style={{ width: 18, height: 18 }} />
                {busy ? 'Opening…' : 'Enter room'}
              </span>
            </Button>
          </form>
        </GamifiedFormCard>
      </GamifiedCenterStage>
    </StyledMultiGamePage>
  )
}

export default DuelJoinPage
