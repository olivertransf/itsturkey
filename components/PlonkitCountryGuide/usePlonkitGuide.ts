import { useEffect, useState } from 'react'
import { mailman } from '@utils/helpers'
import type { PlonkitGuidePayload } from './plonkitGuideTypes'

export function usePlonkitGuide(isoCode: string | null, enabled: boolean) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<PlonkitGuidePayload | null>(null)

  useEffect(() => {
    if (!enabled || !isoCode) {
      setLoading(false)
      setError(null)
      setPayload(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setPayload(null)

    void (async () => {
      const res = await mailman(`plonkit-guide?code=${encodeURIComponent(isoCode)}`, 'GET')
      if (cancelled) return
      setLoading(false)
      if (!res || res.error) {
        const err = res?.error as string | { message?: string } | undefined
        const msg =
          typeof err === 'string' ? err : err?.message ?? 'Could not load the Plonk It guide.'
        setError(msg)
        return
      }
      setPayload(res as PlonkitGuidePayload)
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, isoCode])

  return { loading, error, payload }
}
