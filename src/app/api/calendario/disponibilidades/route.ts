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

// Helper to map Disponibilidade to API response format
function mapDisponibilidade(item: {
  id: string
  professorId: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  recorrente: boolean
  dataEspecifica: string | null
  semestre: string
  ano: number
  createdAt: Date
}) {
  return {
    id: item.id,
    professor_id: item.professorId,
    dia_semana: item.diaSemana,
    hora_inicio: item.horaInicio,
    hora_fim: item.horaFim,
    recorrente: item.recorrente,
    data_especifica: item.dataEspecifica,
    semestre: item.semestre,
    ano: item.ano,
    created_at: item.createdAt,
  }
}

// GET /api/calendario/disponibilidades
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
    const professorId = searchParams.get("professor_id")
    const semestre = searchParams.get("semestre")
    const anoStr = searchParams.get("ano")

    if (!professorId) {
      return NextResponse.json(
        { error: "professor_id é obrigatório" },
        { status: 400 }
      )
    }

    // Role-based access control
    if (session.role === "professor") {
      // Professors can only see their own disponibilidades
      // Look up the profile to verify
      const profile = await db.profile.findUnique({
        where: { userId: session.userId },
      })
      if (!profile || profile.id !== professorId) {
        return NextResponse.json(
          { error: "Acesso negado" },
          { status: 403 }
        )
      }
    }
    // Coordenadores (and other roles) can see any professor's disponibilidades

    // Build where clause
    const where: Record<string, unknown> = { professorId }
    if (semestre) {
      where.semestre = semestre
    }
    if (anoStr) {
      const ano = parseInt(anoStr, 10)
      if (!isNaN(ano)) {
        where.ano = ano
      }
    }

    const disponibilidades = await db.disponibilidade.findMany({
      where,
      orderBy: { diaSemana: "asc" },
    })

    return NextResponse.json({
      data: disponibilidades.map(mapDisponibilidade),
    })
  } catch (error) {
    console.error("[calendario/disponibilidades GET] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST /api/calendario/disponibilidades
export async function POST(request: NextRequest) {
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
        { error: "Apenas professores podem criar disponibilidades" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      dia_semana,
      hora_inicio,
      hora_fim,
      recorrente,
      data_especifica,
      semestre,
      ano,
    } = body as {
      dia_semana?: number
      hora_inicio?: string
      hora_fim?: string
      recorrente?: boolean
      data_especifica?: string
      semestre?: string
      ano?: number
    }

    // Validate required fields
    if (dia_semana === undefined || dia_semana === null) {
      return NextResponse.json(
        { error: "dia_semana é obrigatório" },
        { status: 400 }
      )
    }
    if (!hora_inicio) {
      return NextResponse.json(
        { error: "hora_inicio é obrigatória" },
        { status: 400 }
      )
    }
    if (!hora_fim) {
      return NextResponse.json(
        { error: "hora_fim é obrigatória" },
        { status: 400 }
      )
    }
    if (recorrente === undefined || recorrente === null) {
      return NextResponse.json(
        { error: "recorrente é obrigatório" },
        { status: 400 }
      )
    }
    if (!semestre) {
      return NextResponse.json(
        { error: "semestre é obrigatório" },
        { status: 400 }
      )
    }
    if (ano === undefined || ano === null) {
      return NextResponse.json(
        { error: "ano é obrigatório" },
        { status: 400 }
      )
    }

    // Validate dia_semana range
    if (dia_semana < 0 || dia_semana > 6) {
      return NextResponse.json(
        { error: "dia_semana deve ser entre 0 (domingo) e 6 (sábado)" },
        { status: 400 }
      )
    }

    // Validate hora_fim > hora_inicio (string comparison works for "HH:mm")
    if (hora_fim <= hora_inicio) {
      return NextResponse.json(
        { error: "hora_fim deve ser maior que hora_inicio" },
        { status: 400 }
      )
    }

    // If not recorrente, data_especifica must be provided
    if (!recorrente && !data_especifica) {
      return NextResponse.json(
        { error: "data_especifica é obrigatória quando recorrente é false" },
        { status: 400 }
      )
    }

    // Get the professor's profile ID
    const profile = await db.profile.findUnique({
      where: { userId: session.userId },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 403 }
      )
    }

    const disponibilidade = await db.disponibilidade.create({
      data: {
        professorId: profile.id,
        diaSemana: dia_semana,
        horaInicio: hora_inicio,
        horaFim: hora_fim,
        recorrente,
        dataEspecifica: data_especifica || null,
        semestre,
        ano,
      },
    })

    return NextResponse.json(
      { data: mapDisponibilidade(disponibilidade) },
      { status: 201 }
    )
  } catch (error) {
    console.error("[calendario/disponibilidades POST] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
