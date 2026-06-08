import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body as { email?: string; senha?: string }

    // Validate required fields
    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Query user with profile
    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true },
    })

    // User not found
    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      )
    }

    // Password doesn't match (plaintext for MVP)
    if (user.senha !== senha) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      )
    }

    // No profile associated
    if (!user.profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 403 }
      )
    }

    // Create session data
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.profile.role,
      nome: user.profile.nome,
    }

    // Build response with session cookie
    const response = NextResponse.json(
      {
        data: {
          userId: user.id,
          email: user.email,
          role: user.profile.role,
          nome: user.profile.nome,
        },
      },
      { status: 200 }
    )

    response.cookies.set("orkestrando_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[auth/login] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
