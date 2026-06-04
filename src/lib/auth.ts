import bcrypt from 'bcryptjs'
import { db } from './db'

// In-memory token store (simplified)
const tokenStore = new Map<string, { profileId: string; role: string; expiresAt: number }>()

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(profileId: string, role: string): string {
  const token = crypto.randomUUID()
  tokenStore.set(token, { profileId, role, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  return token
}

export function validateToken(token: string): { profileId: string; role: string } | null {
  const entry = tokenStore.get(token)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token)
    return null
  }
  return { profileId: entry.profileId, role: entry.role }
}

export function revokeToken(token: string): void {
  tokenStore.delete(token)
}
