'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { loginSchema } from '@/lib/utils/validation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod/v4'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      loginSchema.parse(formData)
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
      await signIn(formData.email, formData.password)
      toast.success('Login realizado com sucesso!')
      router.push('/')
    } catch {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar a plataforma
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="current-password"
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
