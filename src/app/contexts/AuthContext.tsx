import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/app/lib/api/auth'
import { ApiError } from '@/app/lib/api/errors'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/app/lib/auth/tokenStorage'
import type { AuthUser, LoginRequest, RegisterRequest } from '@/app/types/auth'

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchMe()
    setUser(me)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getStoredToken()) {
        if (!cancelled) {
          setIsLoading(false)
        }
        return
      }

      try {
        const me = await authApi.fetchMe()
        if (!cancelled) {
          setUser(me)
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredToken()
        }
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const token = await authApi.login(payload)
    setStoredToken(token.access_token)
    const me = await authApi.fetchMe()
    setUser(me)
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    await authApi.register(payload)
    await login({ email: payload.email, password: payload.password })
  }, [login])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
