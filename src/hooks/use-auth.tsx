'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import type { Profile, Role } from '@/types'

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

function decodeJwtPayload(token: string): Record<string, unknown> | null {
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

  // Load user profile from /api/auth/me using existing token
  const loadUserFromToken = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        const user = data.data || data.user || data.profile
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }, [])

  // Initialize auth from cookie token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookieToken()
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      // Decode JWT to check expiry
      const payload = decodeJwtPayload(token)
      if (payload?.exp) {
        const isExpired = Date.now() >= (payload.exp as number) * 1000
        if (isExpired) {
          // Try refresh
          try {
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            })
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              if (refreshData.data?.tokens?.accessToken) {
                setCookieToken(
                  refreshData.data.tokens.accessToken,
                  refreshData.data.tokens.expiresIn || 3600
                )
                await loadUserFromToken(refreshData.data.tokens.accessToken)
                return
              }
            }
          } catch {
            // Refresh failed
          }
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

      // Token exists and not expired - fetch user profile
      const loaded = await loadUserFromToken(token)
      if (!loaded) {
        // Try refresh
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            if (refreshData.data?.tokens?.accessToken) {
              setCookieToken(
                refreshData.data.tokens.accessToken,
                refreshData.data.tokens.expiresIn || 3600
              )
              await loadUserFromToken(refreshData.data.tokens.accessToken)
              return
            }
          }
        } catch {
          // Refresh failed
        }
        deleteCookieToken()
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }))
      }
    }

    initializeAuth()
  }, [loadUserFromToken])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return

    const token = getCookieToken()
    if (!token) return

    const payload = decodeJwtPayload(token)
    if (!payload?.exp) return

    const expiresIn = (payload.exp as number) * 1000 - Date.now()
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
            if (data.data?.tokens?.accessToken) {
              setCookieToken(
                data.data.tokens.accessToken,
                data.data.tokens.expiresIn || 3600
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
          throw new Error(data.error?.message || 'Falha ao fazer login')
        }

        // Set token cookie from response
        if (data.data?.tokens?.accessToken) {
          const maxAge = rememberMe
            ? 60 * 60 * 24 * 30
            : data.data.tokens.expiresIn || 3600
          setCookieToken(data.data.tokens.accessToken, maxAge)
        }

        const user = data.data.user
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        // Redirect based on role
        const role = (user?.role || user?.profile?.role || 'STUDENT') as Role
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
          throw new Error(
            responseData.error?.message || 'Falha ao registrar'
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
        const user = data.data || data.user || data.profile
        if (user) {
          setState((prev) => ({
            ...prev,
            user,
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
    // Safe defaults during SSR/prerendering
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: async () => {},
      register: async () => ({ success: false, message: 'Não foi possível conectar ao sistema.' }),
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
