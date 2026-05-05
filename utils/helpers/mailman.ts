// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API responses are heterogeneous (arrays, envelopes, primitives)
const mailman = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: BodyInit
): Promise<any> => {
  const fetchConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  }

  try {
    const serverUrl = `/api/${endpoint}`

    const responseRaw = await fetch(serverUrl, fetchConfig)
    const rawText = await responseRaw.text()

    let parsed: unknown = null
    const trimmed = rawText.trim()
    if (trimmed) {
      try {
        parsed = JSON.parse(trimmed) as unknown
      } catch {
        console.log(`mailman JSON parse failed for ${endpoint}`)
        return {
          error: {
            message: 'Invalid server response',
            code: responseRaw.status || 500,
          },
        }
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
  } catch (err) {
    console.log(`ERR FROM CATCH: ${err}}`)
    return null
  }
}

export default mailman
