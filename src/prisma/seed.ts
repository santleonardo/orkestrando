import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'

async function main() {
  console.log('🌱 Seeding database...')

  // Create organization
  const org = await db.organization.upsert({
    where: { slug: 'orkestrando-demo' },
    update: {},
    create: {
      name: 'Orkestrando Demo',
      slug: 'orkestrando-demo',
      settings: '{}',
    },
  })

  console.log(`✅ Organization: ${org.name}`)

  // Create coordinator profile
  const coordProfile = await db.profile.upsert({
    where: { user_id: 'coord-1' },
    update: {},
    create: {
      user_id: 'coord-1',
      org_id: org.id,
      role: 'COORDINATOR',
      first_name: 'Maria',
      last_name: 'Silva',
      email: 'coordenador@orkestrando.com',
      is_active: true,
    },
  })

  await db.coordinator.upsert({
    where: { profile_id: coordProfile.id },
    update: {},
    create: {
      profile_id: coordProfile.id,
      department: 'Coordenação Geral',
      level: 3,
    },
  })

  // Create professor profile
  const profProfile = await db.profile.upsert({
    where: { user_id: 'prof-1' },
    update: {},
    create: {
      user_id: 'prof-1',
      org_id: org.id,
      role: 'PROFESSOR',
      first_name: 'Carlos',
      last_name: 'Oliveira',
      email: 'professor@orkestrando.com',
      is_active: true,
    },
  })

  const teacher = await db.teacher.upsert({
    where: { profile_id: profProfile.id },
    update: {},
    create: {
      profile_id: profProfile.id,
      department: 'Matemática',
      specializations: '["Álgebra", "Cálculo"]',
      bio: 'Professor de Matemática com 15 anos de experiência.',
    },
  })

  // Create student profile
  const studProfile = await db.profile.upsert({
    where: { user_id: 'student-1' },
    update: {},
    create: {
      user_id: 'student-1',
      org_id: org.id,
      role: 'STUDENT',
      first_name: 'Ana',
      last_name: 'Santos',
      email: 'aluno@orkestrando.com',
      is_active: true,
    },
  })

  const student = await db.student.upsert({
    where: { profile_id: studProfile.id },
    update: {},
    create: {
      profile_id: studProfile.id,
      enrollment_number: '2024001',
      course: 'Ciência da Computação',
      semester: 3,
      shift: 'Manhã',
      status: 'active',
    },
  })

  console.log(`✅ Profiles: Coordenador, Professor, Aluno`)

  // Create semester
  const semester = await db.semester.create({
    data: {
      org_id: org.id,
      name: '1º Semestre 2026',
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-06-30'),
      status: 'ACTIVE',
    },
  })

  // Create course
  const course = await db.course.create({
    data: {
      org_id: org.id,
      name: 'Ciência da Computação',
      code: 'CC',
      description: 'Bacharelado em Ciência da Computação',
      duration: 8,
      total_credits: 240,
    },
  })

  // Create subject
  const subject = await db.subject.create({
    data: {
      org_id: org.id,
      course_id: course.id,
      name: 'Cálculo I',
      code: 'MAT101',
      description: 'Limites, derivadas e integrais',
      credits: 4,
      workload: 60,
      semester: 1,
      prerequisites: '[]',
    },
  })

  // Create room
  const room = await db.room.create({
    data: {
      org_id: org.id,
      name: 'Sala 101',
      code: 'S101',
      capacity: 40,
      type: 'CLASSROOM',
      building: 'Bloco A',
      floor: 1,
      resources: '["Projetor", "Quadro Digital"]',
    },
  })

  // Create class
  const turma = await db.class.create({
    data: {
      org_id: org.id,
      subject_id: subject.id,
      semester_id: semester.id,
      teacher_id: teacher.id,
      room_id: room.id,
      name: 'Cálculo I - Turma A',
      code: 'MAT101-A',
      schedule: '[{"weekday":"Segunda","start":"08:00","end":"10:00"},{"weekday":"Quarta","start":"08:00","end":"10:00"}]',
      max_students: 40,
      current_students: 1,
      status: 'ACTIVE',
    },
  })

  // Enroll student
  await db.enrollment.create({
    data: {
      org_id: org.id,
      student_id: student.id,
      class_id: turma.id,
      semester_id: semester.id,
      status: 'ACTIVE',
    },
  })

  console.log(`✅ Course, Subject, Room, Class, Enrollment created`)
  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
