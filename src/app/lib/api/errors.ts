import type { ApiErrorBody } from '@/app/types/auth'

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody = {}) {
    super(body.detail ?? `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}
