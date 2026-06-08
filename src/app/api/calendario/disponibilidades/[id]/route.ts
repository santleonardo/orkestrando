import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Helper to parse session cookie
function getSession(request: NextRequest): {
  userId: string
  email: string
  role: string
  nome: string
} | null {
  const sessionCookie = request.cookies.get("orkestrando_session")
  if (!sessionCookie?.value) return null
  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

// DELETE /api/calendario/disponibilidades/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    if (session.role !== "professor") {
      return NextResponse.json(
        { error: "Apenas professores podem excluir disponibilidades" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Find the disponibilidade
    const disponibilidade = await db.disponibilidade.findUnique({
      where: { id },
    })

    if (!disponibilidade) {
      return NextResponse.json(
        { error: "Disponibilidade não encontrada" },
        { status: 404 }
      )
    }

    // Verify ownership: the authenticated professor must be the owner
    const profile = await db.profile.findUnique({
      where: { userId: session.userId },
    })

    if (!profile || disponibilidade.professorId !== profile.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Delete the disponibilidade
    await db.disponibilidade.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[calendario/disponibilidades/[id] DELETE] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
