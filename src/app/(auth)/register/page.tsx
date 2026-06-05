'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { registerSchema } from '@/lib/utils/validation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { ROLE_LABELS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso.')
      return
    }

    try {
      registerSchema.parse(formData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[String(issue.path[0])] = issue.message
          }
        })
        setErrors(fieldErrors)
      }
      return
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      })
      toast.success('Conta criada com sucesso! Verifique seu e-mail.')
      router.push('/login')
    } catch (err) {
      toast.error('Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Criar conta</CardTitle>
        <CardDescription>
          Preencha seus dados para se registrar na plataforma
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                placeholder="João"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                placeholder="Silva"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">E-mail</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de conta</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['coordinator', 'teacher', 'student'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    formData.role === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Senha</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={errors.confirmPassword ? 'border-destructive' : ''}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Aceito os{' '}
              <Link href="#" className="text-primary hover:underline">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link href="#" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
