export type UserRole = 'user' | 'admin'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest & {
  role?: UserRole
}

export type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type ApiErrorBody = {
  detail?: string
  code?: string
}
