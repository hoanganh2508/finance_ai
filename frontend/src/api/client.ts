const API_BASE_URL = 'http://localhost:3000/api/v1'

const DEFAULT_TIMEOUT_MS = 60000

type RequestOptions = RequestInit & { timeout?: number }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const { timeout: timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        (data && data.error && data.error.message) || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return data as T
  } finally {
    clearTimeout(timeoutId)
  }
}

export const apiClient = {
  post: <T>(path: string, body: unknown, timeout?: number) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...(timeout != null && { timeout }),
    }),
}
