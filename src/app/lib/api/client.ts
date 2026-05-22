import { ApiError } from '@/app/lib/api/errors'
import { getStoredToken } from '@/app/lib/auth/tokenStorage'
import type { ApiErrorBody } from '@/app/types/auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_TIMEOUT_MS = 30_000

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      let body: ApiErrorBody = {}
      try {
        body = (await response.json()) as ApiErrorBody
      } catch {
        body = {}
      }
      throw new ApiError(response.status, body)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, {
        detail:
          'API 요청 시간이 초과되었거나 서버에 연결할 수 없습니다. 백엔드(8080) 실행 여부를 확인해 주세요.',
      })
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}
