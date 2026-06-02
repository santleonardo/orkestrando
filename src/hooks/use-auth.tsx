'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import type { Profile, Role, AuthTokens, JwtPayload } from '@/types'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
  role: Role | null
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: string
}

interface LoginResponse {
  user: Profile
  tokens: AuthTokens
}

interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'orkestrando-token'
const REFRESH_TOKEN_KEY = 'orkestrando-refresh-token'

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp('(^| )' + TOKEN_KEY + '=([^;]+)')
  )
  return match ? match[2] : null
}

function setCookieToken(token: string, maxAge: number = 60 * 60 * 24): void {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function deleteCookieToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )
    return payload
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Initial auth check - load user from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookieToken()
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      if (isTokenExpired(token)) {
        // Try refresh
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
          if (refreshRes.ok) {
            const data = await refreshRes.json()
            if (data.tokens?.accessToken) {
              setCookieToken(
                data.tokens.accessToken,
                data.tokens.expiresIn || 86400
              )
            }
          } else {
            deleteCookieToken()
            setState((prev) => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            }))
            return
          }
        } catch {
          deleteCookieToken()
          setState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }))
          return
        }
      }

      // Fetch current user profile
      try {
        const profileRes = await fetch('/api/auth/me', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        })

        if (profileRes.ok) {
          const data = await profileRes.json()
          const profile = data.profile || data.user || data.data
          if (profile) {
            setState({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            deleteCookieToken()
            setState((prev) => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            }))
          }
        } else {
          deleteCookieToken()
          setState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }))
        }
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }))
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return

    const token = getCookieToken()
    if (!token) return

    const payload = decodeJwtPayload(token)
    if (!payload?.exp) return

    // Refresh 5 minutes before expiry
    const expiresIn = payload.exp * 1000 - Date.now()
    const refreshBefore = expiresIn - 5 * 60 * 1000

    if (refreshBefore > 0) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
          if (res.ok) {
            const data = await res.json()
            if (data.tokens?.accessToken) {
              setCookieToken(
                data.tokens.accessToken,
                data.tokens.expiresIn || 86400
              )
            }
          }
        } catch {
          // Silently fail refresh
        }
      }, refreshBefore)

      return () => clearTimeout(timer)
    }
  }, [state.isAuthenticated])

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, rememberMe }),
        })

        const data = await res.json()

        if (!res.ok) {
          const apiError = data as ApiError
          throw new Error(apiError.error || apiError.message || 'Falha ao fazer login')
        }

        const loginData = data as LoginResponse
        if (loginData.tokens?.accessToken) {
          const maxAge = rememberMe
            ? 60 * 60 * 24 * 30 // 30 days
            : loginData.tokens.expiresIn || 86400 // default 1 day
          setCookieToken(loginData.tokens.accessToken, maxAge)
        }

        setState({
          user: loginData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        // Redirect based on role
        const role = loginData.user.role as Role
        if (role === 'SUPER_ADMIN') {
          window.location.href = '/dashboard'
        } else if (role === 'COORDINATOR') {
          window.location.href = '/dashboard/coordinator'
        } else if (role === 'PROFESSOR') {
          window.location.href = '/dashboard/professor'
        } else if (role === 'STUDENT') {
          window.location.href = '/dashboard/student'
        } else {
          window.location.href = '/dashboard'
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Erro inesperado ao fazer login',
        }))
        throw err
      }
    },
    []
  )

  const register = useCallback(
    async (
      data: RegisterData
    ): Promise<{ success: boolean; message: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        })

        const responseData = await res.json()

        if (!res.ok) {
          const apiError = responseData as ApiError
          throw new Error(
            apiError.error || apiError.message || 'Falha ao registrar'
          )
        }

        setState((prev) => ({ ...prev, isLoading: false }))

        return {
          success: true,
          message:
            responseData.message ||
            'Registro realizado com sucesso! Verifique seu e-mail.',
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            err instanceof Error ? err.message : 'Erro inesperado ao registrar',
        }))
        return {
          success: false,
          message:
            err instanceof Error ? err.message : 'Erro inesperado ao registrar',
        }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Continue with local cleanup even if API call fails
    }

    deleteCookieToken()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })

    window.location.href = '/login'
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const token = getCookieToken()
      const res = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        const profile = data.profile || data.user || data.data
        if (profile) {
          setState((prev) => ({
            ...prev,
            user: profile,
            isAuthenticated: true,
          }))
        }
      }
    } catch {
      // Silently fail
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const role = useMemo(() => {
    if (!state.user) return null
    return state.user.role as Role
  }, [state.user])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshProfile,
      clearError,
      role,
    }),
    [state, login, register, logout, refreshProfile, clearError, role]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return safe defaults during SSR/prerendering when no AuthProvider is present
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async () => { throw new Error('AuthProvider not found') },
      register: async () => ({ success: false, message: 'AuthProvider not found' }),
      logout: async () => {},
      refreshProfile: async () => {},
      clearError: () => {},
      role: null,
    }
  }
  return context
}

// -----------------------------------------------------------------------------
// Utility: Get current auth token from cookies (for use in API calls)
// -----------------------------------------------------------------------------

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  return getCookieToken()
}
