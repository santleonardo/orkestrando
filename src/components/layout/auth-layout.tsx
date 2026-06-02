import React from 'react'
import { GraduationCap } from 'lucide-react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-100/20 blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #7c3aed 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/30">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold tracking-tight text-violet-900">
              ORKESTRANDO
            </h1>
            <p className="text-xs font-medium text-violet-500">
              Sistema de Gestão Acadêmica
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-violet-100/80 bg-white/80 px-8 py-8 shadow-xl shadow-violet-900/5 backdrop-blur-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Orkestrando. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
