import { apiFetch } from '@/app/lib/api/client'
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from '@/app/types/auth'

const AUTH_PREFIX = '/api/v1/auth'

export function login(payload: LoginRequest): Promise<TokenResponse> {
  return apiFetch<TokenResponse>(`${AUTH_PREFIX}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterRequest): Promise<AuthUser> {
  return apiFetch<AuthUser>(`${AUTH_PREFIX}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>(`${AUTH_PREFIX}/me`)
}
