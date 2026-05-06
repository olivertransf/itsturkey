export type MailmanOptions = {
  signal?: AbortSignal
  /** Idempotent GET retries after fetch/network failures (not HTTP 4xx/5xx). Default 1. */
  retries?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function envelopeParseFail(endpoint: string, status: number) {
  return {
    error: {
      message: 'Invalid server response',
      code: status || 500,
    },
  }
}

function envelopeNetwork(message: string, code = 0) {
  return { error: { message, code } }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API responses are heterogeneous (arrays, envelopes, primitives)
const mailman = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: BodyInit,
  opts?: MailmanOptions
): Promise<any> => {
  const serverUrl = `/api/${endpoint}`
  const fetchConfig: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    signal: opts?.signal,
  }

  const maxAttempts =
    method === 'GET' ? Math.max(0, opts?.retries !== undefined ? opts.retries : 1) + 1 : 1

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const responseRaw = await fetch(serverUrl, fetchConfig)
      const rawText = await responseRaw.text()
      const trimmed = rawText.trim()

      let parsed: unknown = null
      if (trimmed) {
        try {
          parsed = JSON.parse(trimmed) as unknown
        } catch {
          console.log(`mailman JSON parse failed for ${endpoint}`)
          return envelopeParseFail(endpoint, responseRaw.status || 500)
        }
      }

      if (!responseRaw.ok) {
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed
        }
        return {
          error: {
            message: responseRaw.statusText || 'Request failed',
            code: responseRaw.status,
          },
        }
      }

      return parsed as any
    } catch (err: unknown) {
      const aborted =
        (err instanceof DOMException && err.name === 'AbortError') ||
        (typeof err === 'object' &&
          err !== null &&
          (err as { name?: string }).name === 'AbortError')

      if (aborted) {
        return envelopeNetwork('Request aborted', 499)
      }

      if (attempt >= maxAttempts - 1) {
        console.log(`mailman network failure (${endpoint}): ${String(err)}`)
        return envelopeNetwork('Network error', 0)
      }

      await sleep(220 * (attempt + 1))
    }
  }

  return envelopeNetwork('Network error', 0)
}

export default mailman
