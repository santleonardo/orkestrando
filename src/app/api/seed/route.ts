import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const SEED_KEY = "orkestrando2025"

export async function POST(request: NextRequest) {
  try {
    // Protect with query parameter
    const key = request.nextUrl.searchParams.get("key")
    if (key !== SEED_KEY) {
      return NextResponse.json(
        { error: "Chave de acesso inválida. Use ?key=orkestrando2025" },
        { status: 401 }
      )
    }

    // Limpar dados existentes (na mesma ordem para respeitar foreign keys)
    await db.aula.deleteMany()
    await db.disponibilidade.deleteMany()
    await db.materia.deleteMany()
    await db.turma.deleteMany()
    await db.profile.deleteMany()
    await db.user.deleteMany()

    // Criar usuários com profiles
    const coordUser = await db.user.create({
      data: {
        email: "coord@orkestrando.com",
        senha: "123456",
        profile: {
          create: {
            role: "coordenador",
            nome: "Maria Coordenadora",
            email: "coord@orkestrando.com",
          },
        },
      },
      include: { profile: true },
    })

    const prof1User = await db.user.create({
      data: {
        email: "prof1@orkestrando.com",
        senha: "123456",
        profile: {
          create: {
            role: "professor",
            nome: "Carlos Silva",
            email: "prof1@orkestrando.com",
          },
        },
      },
      include: { profile: true },
    })

    const prof2User = await db.user.create({
      data: {
        email: "prof2@orkestrando.com",
        senha: "123456",
        profile: {
          create: {
            role: "professor",
            nome: "Ana Lima",
            email: "prof2@orkestrando.com",
          },
        },
      },
      include: { profile: true },
    })

    const prof1Id = prof1User.profile!.id
    const coordId = coordUser.profile!.id

    // Turmas
    const turmaA = await db.turma.create({
      data: {
        nome: "Turma A — 2025.2",
        descricao: "Turma do período matutino",
        semestre: "2025.2",
        ano: 2025,
        coordenadorId: coordId,
      },
    })

    const turmaB = await db.turma.create({
      data: {
        nome: "Turma B — 2025.2",
        descricao: "Turma do período vespertino",
        semestre: "2025.2",
        ano: 2025,
        coordenadorId: coordId,
      },
    })

    // Matérias
    const matematica = await db.materia.create({
      data: {
        nome: "Matemática",
        turmaId: turmaA.id,
        professorId: prof1Id,
      },
    })

    const fisica = await db.materia.create({
      data: {
        nome: "Física",
        turmaId: turmaA.id,
        professorId: prof1Id,
      },
    })

    await db.materia.create({
      data: {
        nome: "Português",
        turmaId: turmaB.id,
        professorId: prof2User.profile!.id,
      },
    })

    // Disponibilidades do prof1
    // Segunda (1), Quarta (3), Sexta (5): 08:00-12:00 recorrentes
    await db.disponibilidade.createMany({
      data: [
        {
          professorId: prof1Id,
          diaSemana: 1,
          horaInicio: "08:00",
          horaFim: "12:00",
          recorrente: true,
          semestre: "2025.2",
          ano: 2025,
        },
        {
          professorId: prof1Id,
          diaSemana: 3,
          horaInicio: "08:00",
          horaFim: "12:00",
          recorrente: true,
          semestre: "2025.2",
          ano: 2025,
        },
        {
          professorId: prof1Id,
          diaSemana: 5,
          horaInicio: "08:00",
          horaFim: "12:00",
          recorrente: true,
          semestre: "2025.2",
          ano: 2025,
        },
        {
          professorId: prof1Id,
          diaSemana: 4,
          horaInicio: "14:00",
          horaFim: "18:00",
          recorrente: false,
          dataEspecifica: "2025-08-14",
          semestre: "2025.2",
          ano: 2025,
        },
      ],
    })

    // Aulas agendadas para prof1
    await db.aula.createMany({
      data: [
        {
          materiaId: matematica.id,
          professorId: prof1Id,
          turmaId: turmaA.id,
          titulo: "Aula de Álgebra",
          descricao: "Introdução a equações do 2º grau",
          dataHoraInicio: new Date("2025-08-04T08:00:00Z"),
          dataHoraFim: new Date("2025-08-04T10:00:00Z"),
          semestre: "2025.2",
          ano: 2025,
          status: "agendada",
        },
        {
          materiaId: fisica.id,
          professorId: prof1Id,
          turmaId: turmaA.id,
          titulo: "Aula de Mecânica",
          descricao: "Leis de Newton",
          dataHoraInicio: new Date("2025-08-06T08:00:00Z"),
          dataHoraFim: new Date("2025-08-06T10:00:00Z"),
          semestre: "2025.2",
          ano: 2025,
          status: "agendada",
        },
        {
          materiaId: matematica.id,
          professorId: prof1Id,
          turmaId: turmaA.id,
          titulo: "Aula de Geometria",
          descricao: "Teorema de Pitágoras",
          dataHoraInicio: new Date("2025-09-01T08:00:00Z"),
          dataHoraFim: new Date("2025-09-01T10:00:00Z"),
          semestre: "2025.2",
          ano: 2025,
          status: "agendada",
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: "Seed concluído com sucesso!",
      data: {
        users: [coordUser.email, prof1User.email, prof2User.email],
        turmas: [turmaA.nome, turmaB.nome],
      },
    })
  } catch (error) {
    console.error("[api/seed] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao executar seed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
