// src/lib/auth/client.ts
// Client-side auth helper — adaptação para funcionar com API routes
// Em produção, substitua pelo createBrowserClient do @supabase/ssr

import type { Profile } from "@/lib/types"

const API_BASE = "/api"

export async function getProfileClient(): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_BASE}/usuarios/me`)
    if (!res.ok) return null
    const data = await res.json()
    return data.data ?? null
  } catch {
    return null
  }
}

export async function loginClient(
  email: string,
  senha: string
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.error ?? "Erro ao fazer login" }
    }
    return { success: true, profile: data.data }
  } catch {
    return { success: false, error: "Erro de conexão" }
  }
}

export async function logoutClient(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST" })
  } catch {
    // silently fail
  }
}
