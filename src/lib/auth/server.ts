// src/lib/auth/server.ts
// Server-side auth helper — usa cookies para sessão
// Em produção, substitua pelo createServerClient do @supabase/ssr

import { cookies } from "next/headers"
import { db } from "@/lib/db"

export interface SessaoUsuario {
  userId: string
  email: string
  role: string
  nome: string
}

export async function getSessao(): Promise<SessaoUsuario | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("orkestrando_session")

  if (!sessionCookie?.value) return null

  try {
    const sessao = JSON.parse(sessionCookie.value) as SessaoUsuario
    // Verifica se o usuário ainda existe no banco
    const user = await db.user.findUnique({
      where: { id: sessao.userId },
    })
    if (!user) return null
    return sessao
  } catch {
    return null
  }
}

export async function criarSessao(userId: string): Promise<SessaoUsuario | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user || !user.profile) return null

  const sessao: SessaoUsuario = {
    userId: user.id,
    email: user.email,
    role: user.profile.role,
    nome: user.profile.nome,
  }

  return sessao
}
