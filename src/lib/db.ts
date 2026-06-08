import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client singleton.
 *
 * - Local dev: connects to SQLite via DATABASE_URL=file:./db/custom.db
 * - Vercel:    connects to Supabase PostgreSQL via DATABASE_URL=postgresql://...
 *
 * No adapters needed — Prisma handles both natively.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
