import { redirect } from 'next/navigation'
import { getSessao } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { DashboardProfessorClient } from './DashboardProfessorClient'

export default async function DashboardProfessorPage() {
  // Check session — redirect to login if not authenticated
  const sessao = await getSessao()
  if (!sessao) {
    redirect('/login')
  }

  // Check role — redirect to correct dashboard if not professor
  if (sessao.role !== 'professor') {
    const roleDashboardMap: Record<string, string> = {
      coordenador: '/dashboard/coordenador',
      aluno: '/dashboard/aluno',
    }
    redirect(roleDashboardMap[sessao.role] || '/login')
  }

  // Get the user's profile from the database
  const user = await db.user.findUnique({
    where: { id: sessao.userId },
    include: { profile: true },
  })

  if (!user?.profile) {
    redirect('/login')
  }

  const profile = user.profile

  return (
    <DashboardProfessorClient
      nomeUsuario={profile.nome}
      avatarUrl={profile.avatarUrl}
    />
  )
}
