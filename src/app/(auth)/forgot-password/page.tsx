'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/auth-layout'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    if (!email.trim()) {
      setFieldError('O e-mail é obrigatório.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Insira um e-mail válido.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Erro ao enviar e-mail.')
      }

      setEmailSent(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao processar sua solicitação.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            E-mail enviado!
          </h2>
          <p className="mb-2 text-sm text-gray-500">
            Enviamos instruções para redefinir sua senha para
          </p>
          <p className="mb-6 text-sm font-medium text-violet-600">{email}</p>
          <p className="mb-6 text-xs text-gray-400">
            Não recebeu? Verifique sua pasta de spam ou{' '}
            <button
              type="button"
              onClick={() => {
                setEmailSent(false)
                setEmail('')
              }}
              className="font-medium text-violet-600 hover:underline"
            >
              tente novamente com outro e-mail
            </button>
            .
          </p>
          <Link href="/login">
            <Button
              variant="outline"
              className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recuperar senha</h2>
          <p className="mt-1 text-sm text-gray-500">
            Informe seu e-mail e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail cadastrado
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldError) setFieldError(null)
                if (error) setError(null)
              }}
              autoComplete="email"
              disabled={isLoading}
              className={cn(
                'h-10 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                fieldError && 'border-red-300 focus-visible:border-red-400'
              )}
            />
            {fieldError && (
              <p className="text-xs text-red-500">{fieldError}</p>
            )}
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
                Enviando...
              </>
            ) : (
              'Enviar link de recuperação'
            )}
          </Button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
