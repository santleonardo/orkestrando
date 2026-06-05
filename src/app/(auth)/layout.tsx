import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ORKESTRANDO - Acesso',
  description: 'Faça login ou crie sua conta na plataforma ORKESTRANDO.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-slate-100/50 dark:bg-slate-800/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-50/30 dark:bg-emerald-950/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
            O
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">ORKESTRANDO</h1>
          <p className="text-sm text-muted-foreground">Gestão Acadêmica Inteligente</p>
        </div>

        {children}
      </div>
    </div>
  )
}
