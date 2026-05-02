import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { Button } from '@components/system'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { showToast } from '@utils/helpers'
import styled from 'styled-components'

const Panel = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 18px;
  color: #eee;

  h1 {
    font-size: 1.5rem;
    margin: 0 0 12px;
  }

  p {
    margin: 0 0 16px;
    line-height: 1.5;
    color: ${({ theme }) => theme.color.gray[400]};
    font-size: 14px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: ${({ theme }) => theme.color.gray[400]};
  }

  input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.color.gray[600]};
    background: ${({ theme }) => theme.color.gray[900]};
    color: #eee;
    font-size: 15px;
    box-sizing: border-box;
    margin-bottom: 16px;
  }
`

const parseDuelId = (raw: string): string | null => {
  const s = raw.trim()
  const fromUrl = s.match(/\/duel\/([a-f\d]{24})\b/i)
  if (fromUrl) return fromUrl[1]
  if (/^[a-f\d]{24}$/i.test(s)) return s
  return null
}

const DuelJoinPage: NextPage = () => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const id = parseDuelId(value)
    if (!id) {
      showToast('error', 'Paste a full duel link or a 24-character duel ID')
      return
    }
    setBusy(true)
    void router.push(`/duel/${id}`)
  }

  return (
    <StyledMultiGamePage>
      <Meta title="Join Duel" />

      <Panel>
        <PageBackLink href="/" label="Home" />
        <h1>Join a duel</h1>
        <p>Paste the invite link your host shared, or enter the duel ID (24-character code from the URL).</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="duelRef">Link or ID</label>
          <input
            id="duelRef"
            type="text"
            autoComplete="off"
            placeholder="https://…/duel/… or paste ID"
            value={value}
            onChange={(ev) => setValue(ev.target.value)}
          />
          <Button type="submit" variant="solidGray" disabled={busy}>
            {busy ? 'Opening…' : 'Join duel'}
          </Button>
        </form>
      </Panel>
    </StyledMultiGamePage>
  )
}

export default DuelJoinPage
