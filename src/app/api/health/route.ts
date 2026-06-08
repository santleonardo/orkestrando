import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const startTime = Date.now()

  try {
    // Simple query to verify the database connection is working
    const userCount = await db.user.count()

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
      provider: process.env.DATABASE_URL?.startsWith("postgresql") ? "supabase" : "sqlite",
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const responseTime = Date.now() - startTime

    console.error("[api/health] Database connection failed:", error)

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        provider: process.env.DATABASE_URL?.startsWith("postgresql") ? "supabase" : "sqlite",
        responseTimeMs: responseTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
