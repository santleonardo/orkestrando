'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Profile, UserRole } from '@/lib/types'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRole
    organizationId?: string
  }) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!error && data) {
        setState((prev) => ({
          ...prev,
          profile: data as Profile,
          role: data.role as UserRole,
        }))
      }
    },
    [supabase]
  )

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setState((prev) => ({
            ...prev,
            user: session.user as unknown as User,
          }))
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: 'Erro ao inicializar autenticação',
        }))
      } finally {
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({ ...prev, loading: true }))
      if (session?.user) {
        setState((prev) => ({
          ...prev,
          user: session.user as unknown as User,
          error: null,
        }))
        await fetchProfile(session.user.id)
      } else {
        setState({
          user: null,
          profile: null,
          role: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Login realizado com sucesso!')
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao fazer login'
        setState((prev) => ({ ...prev, error: message }))
        toast.error(message)
        throw err
      } finally {
        setState((prev) => ({ ...prev, loading: false }))
      }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        profile: null,
        role: null,
        loading: false,
        error: null,
      })
      toast.success('Logout realizado com sucesso')
    } catch (err) {
      toast.error('Erro ao fazer logout')
    }
  }, [supabase])

  const signUp = useCallback(
    async (data: {
      email: string
      password: string
      firstName: string
      lastName: string
      role: UserRole
      organizationId?: string
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              role: data.role,
              organization_id: data.organizationId,
            },
          },
        })
        if (error) throw error
        toast.success(
          'Conta criada! Verifique seu email para confirmar o cadastro.'
        )
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao criar conta'
        setState((prev) => ({ ...prev, error: message }))
        toast.error(message)
        throw err
      } finally {
        setState((prev) => ({ ...prev, loading: false }))
      }
    },
    [supabase]
  )

  const updateProfile = useCallback(
    async (profileData: Partial<Profile>) => {
      if (!state.user) return
      try {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', state.user.id)
        if (error) throw error
        await fetchProfile(state.user.id)
        toast.success('Perfil atualizado com sucesso')
      } catch (err) {
        toast.error('Erro ao atualizar perfil')
      }
    },
    [supabase, state.user, fetchProfile]
  )

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        toast.success('Email de recuperação enviado!')
      } catch (err) {
        toast.error('Erro ao enviar email de recuperação')
        throw err
      }
    },
    [supabase]
  )

  return { ...state, signIn, signOut, signUp, updateProfile, resetPassword }
}
