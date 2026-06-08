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

// Helper to map Aula with relations to API response format
function mapAula(item: {
  id: string
  materiaId: string
  professorId: string
  turmaId: string
  titulo: string
  descricao: string | null
  dataHoraInicio: Date
  dataHoraFim: Date
  semestre: string
  ano: number
  status: string
  createdAt: Date
  updatedAt: Date
  materia: {
    id: string
    nome: string
    turma: {
      id: string
      nome: string
    }
  }
}) {
  return {
    id: item.id,
    materia_id: item.materiaId,
    professor_id: item.professorId,
    turma_id: item.turmaId,
    titulo: item.titulo,
    descricao: item.descricao,
    data_hora_inicio: item.dataHoraInicio,
    data_hora_fim: item.dataHoraFim,
    semestre: item.semestre,
    ano: item.ano,
    status: item.status,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    materia: {
      id: item.materia.id,
      nome: item.materia.nome,
      turma: {
        id: item.materia.turma.id,
        nome: item.materia.turma.nome,
      },
    },
  }
}

// GET /api/calendario/aulas
export async function GET(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const professorIdParam = searchParams.get("professor_id")
    const dataInicio = searchParams.get("data_inicio")
    const dataFim = searchParams.get("data_fim")

    // Build where clause
    const where: Record<string, unknown> = {}

    // Determine professor_id filter
    let effectiveProfessorId = professorIdParam
    if (!effectiveProfessorId && session.role === "professor") {
      // If no professor_id provided and user is a professor, use their own profile ID
      const profile = await db.profile.findUnique({
        where: { userId: session.userId },
      })
      if (profile) {
        effectiveProfessorId = profile.id
      }
    }

    if (effectiveProfessorId) {
      where.professorId = effectiveProfessorId
    }

    // Date range filter
    if (dataInicio || dataFim) {
      const dataHoraInicioFilter: Record<string, unknown> = {}
      if (dataInicio) {
        dataHoraInicioFilter.gte = new Date(dataInicio)
      }
      if (dataFim) {
        dataHoraInicioFilter.lte = new Date(dataFim)
      }
      where.dataHoraInicio = dataHoraInicioFilter
    }

    const aulas = await db.aula.findMany({
      where,
      include: {
        materia: {
          include: {
            turma: true,
          },
        },
      },
      orderBy: { dataHoraInicio: "asc" },
    })

    return NextResponse.json({
      data: aulas.map(mapAula),
    })
  } catch (error) {
    console.error("[calendario/aulas GET] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
