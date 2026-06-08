// prisma/seed.ts
// Seed data para o Orkestrando MVP

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.aula.deleteMany()
  await prisma.disponibilidade.deleteMany()
  await prisma.materia.deleteMany()
  await prisma.turma.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuários com profiles
  const coordUser = await prisma.user.create({
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

  const prof1User = await prisma.user.create({
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

  const prof2User = await prisma.user.create({
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
  const turmaA = await prisma.turma.create({
    data: {
      nome: "Turma A — 2025.2",
      descricao: "Turma do período matutino",
      semestre: "2025.2",
      ano: 2025,
      coordenadorId: coordId,
    },
  })

  const turmaB = await prisma.turma.create({
    data: {
      nome: "Turma B — 2025.2",
      descricao: "Turma do período vespertino",
      semestre: "2025.2",
      ano: 2025,
      coordenadorId: coordId,
    },
  })

  // Matérias
  const matematica = await prisma.materia.create({
    data: {
      nome: "Matemática",
      turmaId: turmaA.id,
      professorId: prof1Id,
    },
  })

  const fisica = await prisma.materia.create({
    data: {
      nome: "Física",
      turmaId: turmaA.id,
      professorId: prof1Id,
    },
  })

  await prisma.materia.create({
    data: {
      nome: "Português",
      turmaId: turmaB.id,
      professorId: prof2User.profile!.id,
    },
  })

  // Disponibilidades do prof1
  // Segunda (1), Quarta (3), Sexta (5): 08:00-12:00 recorrentes
  await prisma.disponibilidade.createMany({
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
  await prisma.aula.createMany({
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

  console.log("✅ Seed concluído com sucesso!")
  console.log(`   Coordenador: ${coordUser.email}`)
  console.log(`   Professor 1: ${prof1User.email}`)
  console.log(`   Professor 2: ${prof2User.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
