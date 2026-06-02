'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AuthLayout } from '@/components/layout/auth-layout'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!firstName.trim()) {
      errors.firstName = 'O nome é obrigatório.'
    }
    if (!lastName.trim()) {
      errors.lastName = 'O sobrenome é obrigatório.'
    }
    if (!email.trim()) {
      errors.email = 'O e-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Insira um e-mail válido.'
    }
    if (!password) {
      errors.password = 'A senha é obrigatória.'
    } else if (password.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres.'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.'
    }
    if (!acceptTerms) {
      errors.terms = 'Você precisa aceitar os termos de uso.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccess(false)

    if (!validateForm()) return

    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: role || undefined,
      })

      if (result.success) {
        setSuccess(true)
        setSuccessMessage(result.message)
      } else {
        setFieldErrors({ general: result.message })
      }
    } catch (err) {
      setFieldErrors({
        general:
          err instanceof Error
            ? err.message
            : 'Ocorreu um erro ao criar a conta. Tente novamente.',
      })
    }
  }

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Registro realizado!
          </h2>
          <p className="mb-6 text-sm text-gray-500">{successMessage}</p>
          <Link href="/login">
            <Button className="bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700">
              Ir para o login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const displayError = fieldErrors.general || error

  return (
    <AuthLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Criar conta</h2>
          <p className="mt-1 text-sm text-gray-500">
            Preencha os campos abaixo para se registrar
          </p>
        </div>

        {displayError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Nome
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="João"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  clearFieldError('firstName')
                }}
                disabled={isLoading}
                className={cn(
                  'h-10 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                  fieldErrors.firstName && 'border-red-300 focus-visible:border-red-400'
                )}
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-red-500">{fieldErrors.firstName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Sobrenome
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Silva"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  clearFieldError('lastName')
                }}
                disabled={isLoading}
                className={cn(
                  'h-10 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                  fieldErrors.lastName && 'border-red-300 focus-visible:border-red-400'
                )}
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-red-500">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
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
                clearFieldError('email')
              }}
              autoComplete="email"
              disabled={isLoading}
              className={cn(
                'h-10 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                fieldErrors.email && 'border-red-300 focus-visible:border-red-400'
              )}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Perfil <span className="text-gray-400">(opcional)</span>
            </Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger className="h-10 w-full border-gray-200 bg-white focus:ring-violet-200">
                <SelectValue placeholder="Selecione seu perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROFESSOR">Professor</SelectItem>
                <SelectItem value="COORDINATOR">Coordenador</SelectItem>
                <SelectItem value="STUDENT">Aluno</SelectItem>
                <SelectItem value="ASSISTANT">Assistente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearFieldError('password')
                }}
                autoComplete="new-password"
                disabled={isLoading}
                className={cn(
                  'h-10 border-gray-200 bg-white pr-10 placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                  fieldErrors.password && 'border-red-300 focus-visible:border-red-400'
                )}
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
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
            {/* Password strength indicator */}
            {password && (
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((level) => {
                  const strength =
                    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                      ? 3
                      : password.length >= 8 && /[A-Z]/.test(password)
                        ? 2
                        : password.length >= 6
                          ? 1
                          : 0
                  const colors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-green-400']
                  return (
                    <div
                      key={level}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        level <= strength ? colors[strength] : 'bg-gray-200'
                      )}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirmar Senha
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  clearFieldError('confirmPassword')
                }}
                autoComplete="new-password"
                disabled={isLoading}
                className={cn(
                  'h-10 border-gray-200 bg-white pr-10 placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                  fieldErrors.confirmPassword && 'border-red-300 focus-visible:border-red-400'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex gap-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => {
                setAcceptTerms(checked === true)
                clearFieldError('terms')
              }}
              className="border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm leading-snug text-gray-600">
              Li e aceito os{' '}
              <Link
                href="/terms"
                className="font-medium text-violet-600 hover:underline"
                target="_blank"
              >
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link
                href="/privacy"
                className="font-medium text-violet-600 hover:underline"
                target="_blank"
              >
                Política de Privacidade
              </Link>
            </Label>
          </div>
          {fieldErrors.terms && (
            <p className="-mt-2 text-xs text-red-500">{fieldErrors.terms}</p>
          )}

          {/* Submit */}
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
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
