import { FormEvent, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@components/system'
import StyledSitePasswordPage from '@styles/SitePasswordPage.Styled'
import { PageType } from '@types'

const SitePasswordPage: PageType = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const res = await fetch('/api/site-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
    const body = await res.json()

    if (!res.ok) {
      setIsSubmitting(false)
      setError(body?.error?.message ?? 'Incorrect password')
      return
    }

    const from = typeof router.query.from === 'string' ? router.query.from : '/'
    await router.replace(from)
  }

  return (
    <StyledSitePasswordPage>
      <div className="password-card">
        <h1>Enter password</h1>
        <p>This site is private. Enter the shared password to continue.</p>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <Button type="submit" isLoading={isSubmitting} disabled={!password}>
            Unlock
          </Button>
        </form>
      </div>
    </StyledSitePasswordPage>
  )
}

SitePasswordPage.noLayout = true

export default SitePasswordPage
