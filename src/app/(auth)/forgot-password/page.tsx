'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPasswordSchema } from '@/lib/utils/validation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod/v4'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      forgotPasswordSchema.parse({ email })
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

    setLoading(true)
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    setSent(true)
    toast.success('Link de recuperação enviado para seu e-mail!')
  }

  if (sent) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">E-mail enviado!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada.
              </p>
            </div>
            <Button variant="outline" asChild className="mt-2">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail para receber o link de recuperação
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">E-mail</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar link de recuperação
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
