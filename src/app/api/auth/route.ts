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
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>
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

// Shape returned by POST /api/auth and POST /api/auth/register
interface LoginResponse {
  user: Profile
  tokens: AuthTokens
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'orkestrando-token'
const REFRESH_TOKEN_KEY = 'orkestrando-refresh-token'

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + TOKEN_KEY + '=([^;]+)'))
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
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

/**
 * Extract a human-readable message from any API error response shape.
 * Handles: { error: string }, { error: { message: string } }, { message: string }
 */
function extractErrorMessage(data: Record<string, unknown>, fallback: string): string {
  if (typeof data?.error === 'string') return data.error
  if (typeof (data?.error as Record<string, unknown>)?.message === 'string') {
    return (data.error as Record<string, unknown>).message as string
  }
  if (typeof data?.message === 'string') return data.message
  return fallback
}

/** Resolve role → dashboard path. Pages live directly under / (route group (dashboard)). */
function dashboardPathForRole(role: string | null | undefined): string {
  switch (role) {
    case 'COORDINATOR':
      return '/coordinator'
    case 'PROFESSOR':
      return '/professor'
    case 'STUDENT':
      return '/student'
    default:
      return '/coordinator' // safe fallback
  }
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

  // Initial auth check
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookieToken()
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      if (isTokenExpired(token)) {
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
          if (refreshRes.ok) {
            const data = await refreshRes.json()
            if (data.tokens?.accessToken) {
              setCookieToken(data.tokens.accessToken, data.tokens.expiresIn || 86400)
            }
          } else {
            deleteCookieToken()
            setState((prev) => ({ ...prev, user: null, isAuthenticated: false, isLoading: false }))
            return
          }
        } catch {
          deleteCookieToken()
          setState((prev) => ({ ...prev, user: null, isAuthenticated: false, isLoading: false }))
          return
        }
      }

      // FIX: /api/auth (GET) – was incorrectly called as /api/auth/me
      try {
        const profileRes = await fetch('/api/auth', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        })

        if (profileRes.ok) {
          const data = await profileRes.json()
          // GET /api/auth returns the user object directly (flat shape)
          if (data?.id) {
            setState({ user: data, isAuthenticated: true, isLoading: false, error: null })
          } else {
            deleteCookieToken()
            setState((prev) => ({ ...prev, user: null, isAuthenticated: false, isLoading: false }))
          }
        } else {
          deleteCookieToken()
          setState((prev) => ({ ...prev, user: null, isAuthenticated: false, isLoading: false }))
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false, error: null }))
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh before token expiry
  useEffect(() => {
    if (!state.isAuthenticated) return
    const token = getCookieToken()
    if (!token) return
    const payload = decodeJwtPayload(token)
    if (!payload?.exp) return
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
              setCookieToken(data.tokens.accessToken, data.tokens.expiresIn || 86400)
            }
          }
        } catch {
          // Silently ignore
        }
      }, refreshBefore)
      return () => clearTimeout(timer)
    }
  }, [state.isAuthenticated])

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // FIX: was /api/auth/login – the correct endpoint is POST /api/auth
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Falha ao fazer login'))
      }

      const loginData = data as LoginResponse

      if (loginData.tokens?.accessToken) {
        const maxAge = rememberMe
          ? 60 * 60 * 24 * 30 // 30 days
          : loginData.tokens.expiresIn || 86400
        setCookieToken(loginData.tokens.accessToken, maxAge)
      }

      setState({ user: loginData.user, isAuthenticated: true, isLoading: false, error: null })

      // FIX: redirect to actual route group paths (no /dashboard prefix)
      window.location.href = dashboardPathForRole(loginData.user?.role as string)
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Erro inesperado ao fazer login',
      }))
      throw err
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
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
        throw new Error(extractErrorMessage(responseData, 'Falha ao registrar'))
      }

      setState((prev) => ({ ...prev, isLoading: false }))
      return {
        success: true,
        message: responseData.message || 'Registro realizado com sucesso! Verifique seu e-mail.',
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Erro inesperado ao registrar',
      }))
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro inesperado ao registrar',
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // FIX: was /api/auth/logout (didn't exist) – use DELETE /api/auth
      await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
    } catch {
      // Continue with local cleanup even if the request fails
    }

    deleteCookieToken()
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null })
    window.location.href = '/login'
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const token = getCookieToken()
      // FIX: was /api/auth/me – correct path is GET /api/auth
      const res = await fetch('/api/auth', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.id) {
          setState((prev) => ({ ...prev, user: data, isAuthenticated: true }))
        }
      }
    } catch {
      // Silently ignore
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
    () => ({ ...state, login, register, logout, refreshProfile, clearError, role }),
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

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  return getCookieToken()
}
