import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Read session cookie from request
    const sessionCookie = request.cookies.get("orkestrando_session")

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Parse session JSON
    let session: { userId: string; email: string; role: string; nome: string }
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Query user with profile
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      )
    }

    if (!user.profile) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      data: {
        id: user.profile.id,
        userId: user.id,
        role: user.profile.role,
        nome: user.profile.nome,
        email: user.profile.email,
        avatar_url: user.profile.avatarUrl,
      },
    })
  } catch (error) {
    console.error("[usuarios/me] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
