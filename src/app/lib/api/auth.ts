import { apiFetch } from '@/app/lib/api/client'
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from '@/app/types/auth'

const AUTH_PREFIX = '/api/v1/auth'

export const login = (payload: LoginRequest): Promise<TokenResponse> =>
  apiFetch<TokenResponse>(`${AUTH_PREFIX}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const register = (payload: RegisterRequest): Promise<AuthUser> =>
  apiFetch<AuthUser>(`${AUTH_PREFIX}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const fetchMe = (): Promise<AuthUser> => apiFetch<AuthUser>(`${AUTH_PREFIX}/me`)
