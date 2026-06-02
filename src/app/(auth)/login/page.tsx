'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthLayout } from '@/components/layout/auth-layout'
import { cn } from '@/lib/utils'

import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const { login, isLoading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    // Client-side validation
    if (!email.trim()) {
      setLocalError('O e-mail é obrigatório.')
      return
    }
    if (!password) {
      setLocalError('A senha é obrigatória.')
      return
    }

    try {
      await login(email.trim(), password, rememberMe)
      // Redirect is handled by the login function based on role
      if (callbackUrl) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao fazer login. Tente novamente.'
      )
    }
  }

  const displayError = localError || error

  return (
    <AuthLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm text-gray-500">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {displayError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (localError) setLocalError(null)
              }}
              autoComplete="email"
              disabled={isLoading}
              className="h-10 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200"
            />
          </div>

          {/* Password Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (localError) setLocalError(null)
                }}
                autoComplete="current-password"
                disabled={isLoading}
                className="h-10 border-gray-200 bg-white pr-10 placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm text-gray-600"
            >
              Lembrar de mim
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              'mt-2 h-11 w-full bg-violet-600 text-white font-medium shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 hover:shadow-violet-700/30 active:scale-[0.98]',
              isLoading && 'opacity-80 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Register link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
