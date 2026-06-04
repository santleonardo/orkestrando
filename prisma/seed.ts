import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ORKESTRANDO database...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  const tables = [
    'AiSuggestion', 'Report', 'MessageRead', 'MessageAttachment', 'Message',
    'ConversationParticipant', 'Conversation',
    'AssignmentSubmission', 'LessonMaterial', 'MaterialVersion', 'Material',
    'Attendance', 'Lesson', 'TeacherAvailability',
    'AcademicCalendar', 'Enrollment', 'Class', 'Room',
    'Semester', 'Discipline', 'Course', 'AuditLog', 'DigitalSignature', 'User'
  ]
  for (const table of tables) {
    try {
      await db.$executeRawUnsafe(`DELETE FROM ${table}`)
    } catch {
      // Table might not exist or be empty
    }
  }

  // ============================================
  // USERS
  // ============================================
  console.log('👥 Creating users...')
  const passwordHash = await hash('123456', 12)

  const admin = await db.user.create({
    data: {
      email: 'admin@orkestrando.com',
      password: passwordHash,
      name: 'Administrador do Sistema',
      role: 'ADMIN',
      phone: '(11) 99999-0001',
    },
  })

  const coordinator = await db.user.create({
    data: {
      email: 'coord@orkestrando.com',
      password: passwordHash,
      name: 'Maria Coordenadora',
      role: 'COORDINATOR',
      phone: '(11) 99999-0002',
    },
  })

  const teacher = await db.user.create({
    data: {
      email: 'prof@orkestrando.com',
      password: passwordHash,
      name: 'Professor João Silva',
      role: 'TEACHER',
      phone: '(11) 99999-0003',
    },
  })

  const student = await db.user.create({
    data: {
      email: 'aluno@orkestrando.com',
      password: passwordHash,
      name: 'Carlos Estudante',
      role: 'STUDENT',
      phone: '(11) 99999-0004',
    },
  })

  console.log(`  ✅ Created ${4} users`)

  // ============================================
  // COURSES
  // ============================================
  console.log('📚 Creating courses...')
  const ccCourse = await db.course.create({
    data: {
      name: 'Ciência da Computação',
      code: 'CC',
      description: 'Bacharelado em Ciência da Computação',
      duration: 8,
    },
  })

  const siCourse = await db.course.create({
    data: {
      name: 'Sistemas de Informação',
      code: 'SI',
      description: 'Bacharelado em Sistemas de Informação',
      duration: 8,
    },
  })

  console.log(`  ✅ Created ${2} courses`)

  // ============================================
  // DISCIPLINES
  // ============================================
  console.log('📖 Creating disciplines...')
  const algorithmDisc = await db.discipline.create({
    data: {
      name: 'Algoritmos e Estrutura de Dados',
      code: 'CC101',
      description: 'Fundamentos de algoritmos e estruturas de dados',
      workload: 60,
      courseId: ccCourse.id,
    },
  })

  const dataStructuresDisc = await db.discipline.create({
    data: {
      name: 'Estruturas de Dados Avançadas',
      code: 'CC201',
      description: 'Árvores, grafos e técnicas avançadas',
      workload: 60,
      courseId: ccCourse.id,
    },
  })

  const databasesDisc = await db.discipline.create({
    data: {
      name: 'Banco de Dados',
      code: 'CC301',
      description: 'Modelagem, SQL e gerenciamento de bancos de dados',
      workload: 60,
      courseId: ccCourse.id,
    },
  })

  const softwareEngDisc = await db.discipline.create({
    data: {
      name: 'Engenharia de Software',
      code: 'SI101',
      description: 'Princípios e práticas de engenharia de software',
      workload: 60,
      courseId: siCourse.id,
    },
  })

  const networksDisc = await db.discipline.create({
    data: {
      name: 'Redes de Computadores',
      code: 'SI201',
      description: 'Fundamentos de redes e protocolos',
      workload: 60,
      courseId: siCourse.id,
    },
  })

  const aiDisc = await db.discipline.create({
    data: {
      name: 'Inteligência Artificial',
      code: 'SI301',
      description: 'Introdução à inteligência artificial e machine learning',
      workload: 60,
      courseId: siCourse.id,
    },
  })

  console.log(`  ✅ Created ${6} disciplines`)

  // ============================================
  // SEMESTER
  // ============================================
  console.log('📅 Creating semester...')
  const semester = await db.semester.create({
    data: {
      name: 'Semestre 2025/1',
      code: '2025/1',
      startDate: new Date('2025-02-03'),
      endDate: new Date('2025-07-11'),
      isActive: true,
    },
  })

  console.log(`  ✅ Created semester: ${semester.name}`)

  // ============================================
  // ROOMS
  // ============================================
  console.log('🏢 Creating rooms...')
  const room101 = await db.room.create({
    data: {
      name: 'Sala 101',
      code: 'S101',
      capacity: 40,
      type: 'classroom',
    },
  })

  const room201 = await db.room.create({
    data: {
      name: 'Lab 201',
      code: 'L201',
      capacity: 30,
      type: 'laboratory',
    },
  })

  const auditorium = await db.room.create({
    data: {
      name: 'Auditório',
      code: 'AUD',
      capacity: 100,
      type: 'auditorium',
    },
  })

  console.log(`  ✅ Created ${3} rooms`)

  // ============================================
  // CALENDAR EVENTS (Holidays)
  // ============================================
  console.log('🗓️ Creating calendar events...')
  const holidays = [
    { title: 'Carnaval', date: '2025-03-04', type: 'holiday' },
    { title: 'Carnaval', date: '2025-03-05', type: 'holiday' },
    { title: 'Páscoa', date: '2025-04-18', type: 'holiday' },
    { title: 'Tiradentes', date: '2025-04-21', type: 'holiday' },
    { title: 'Dia do Trabalho', date: '2025-05-01', type: 'holiday' },
    { title: 'Corpus Christi', date: '2025-06-19', type: 'holiday' },
    { title: 'Independência do Brasil', date: '2025-09-07', type: 'holiday' },
    { title: 'Nossa Senhora Aparecida', date: '2025-10-12', type: 'holiday' },
    { title: 'Fin dos Cursos - 1º Bimestre', date: '2025-04-11', type: 'academic' },
    { title: 'Início das Aulas - 2º Bimestre', date: '2025-04-14', type: 'academic' },
    { title: 'Fin dos Cursos - 2º Bimestre', date: '2025-06-06', type: 'academic' },
    { title: 'Início das Aulas - 3º Bimestre', date: '2025-06-09', type: 'academic' },
    { title: 'Período de Provas Finais', date: '2025-06-30', type: 'exam' },
  ]

  for (const holiday of holidays) {
    await db.academicCalendar.create({
      data: {
        title: holiday.title,
        date: new Date(holiday.date),
        type: holiday.type,
        semesterId: semester.id,
      },
    })
  }

  console.log(`  ✅ Created ${holidays.length} calendar events`)

  // ============================================
  // TEACHER AVAILABILITY
  // ============================================
  console.log('🕐 Creating teacher availability...')
  const availabilities = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '12:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 1, startTime: '14:00', endTime: '18:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 2, startTime: '08:00', endTime: '12:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 3, startTime: '08:00', endTime: '12:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 3, startTime: '14:00', endTime: '18:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 4, startTime: '08:00', endTime: '12:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 5, startTime: '08:00', endTime: '12:00', type: 'AVAILABLE' as const },
    { dayOfWeek: 5, startTime: '14:00', endTime: '16:00', type: 'BLOCKED' as const, reason: 'Reunião de departamento' },
  ]

  for (const avail of availabilities) {
    await db.teacherAvailability.create({
      data: {
        teacherId: teacher.id,
        semesterId: semester.id,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        type: avail.type,
        reason: avail.reason,
        status: 'APPROVED',
        approvedBy: coordinator.id,
        approvedAt: new Date('2025-01-15'),
        effectiveFrom: new Date('2025-02-01'),
        effectiveTo: new Date('2025-07-31'),
      },
    })
  }

  console.log(`  ✅ Created ${availabilities.length} availability records`)

  // ============================================
  // CLASSES
  // ============================================
  console.log('🏫 Creating classes...')
  const class1 = await db.class.create({
    data: {
      name: 'Algoritmos - Turma A',
      code: 'CC101-A',
      disciplineId: algorithmDisc.id,
      semesterId: semester.id,
      teacherId: teacher.id,
      schedule: JSON.stringify({ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }),
      room: room101.code,
      maxStudents: 40,
    },
  })

  const class2 = await db.class.create({
    data: {
      name: 'Engenharia de Software - Turma A',
      code: 'SI101-A',
      disciplineId: softwareEngDisc.id,
      semesterId: semester.id,
      teacherId: teacher.id,
      schedule: JSON.stringify({ dayOfWeek: 3, startTime: '14:00', endTime: '16:00' }),
      room: room201.code,
      maxStudents: 30,
    },
  })

  console.log(`  ✅ Created ${2} classes`)

  // ============================================
  // GENERATE LESSONS
  // ============================================
  console.log('📝 Generating lessons...')

  // Generate lessons for class 1 (Monday 08:00-10:00)
  const semesterStart = new Date(semester.startDate)
  const semesterEnd = new Date(semester.endDate)
  let lessonsCount = 0

  const currentDate = new Date(semesterStart)
  const class1Schedule = { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }
  const class2Schedule = { dayOfWeek: 3, startTime: '14:00', endTime: '16:00' }

  const class1Lessons: Array<{
    classId: string
    teacherId: string
    date: Date
    startTime: string
    endTime: string
    roomCode: string
    topic: string
    status: string
  }> = []

  const class2Lessons: Array<{
    classId: string
    teacherId: string
    date: Date
    startTime: string
    endTime: string
    roomCode: string
    topic: string
    status: string
  }> = []

  let lessonNum1 = 1
  let lessonNum2 = 1

  const holidayDates = new Set(holidays.map((h) => h.date))

  while (currentDate <= semesterEnd) {
    const dayOfWeek = currentDate.getDay()
    const dateStr = currentDate.toISOString().split('T')[0]

    if (dayOfWeek === class1Schedule.dayOfWeek && !holidayDates.has(dateStr)) {
      class1Lessons.push({
        classId: class1.id,
        teacherId: teacher.id,
        date: new Date(currentDate),
        startTime: class1Schedule.startTime,
        endTime: class1Schedule.endTime,
        roomCode: room101.code,
        topic: `Aula ${lessonNum1}`,
        status: lessonNum1 <= 5 ? 'COMPLETED' : 'SCHEDULED',
      })
      lessonNum1++
    }

    if (dayOfWeek === class2Schedule.dayOfWeek && !holidayDates.has(dateStr)) {
      class2Lessons.push({
        classId: class2.id,
        teacherId: teacher.id,
        date: new Date(currentDate),
        startTime: class2Schedule.startTime,
        endTime: class2Schedule.endTime,
        roomCode: room201.code,
        topic: `Aula ${lessonNum2}`,
        status: lessonNum2 <= 5 ? 'COMPLETED' : 'SCHEDULED',
      })
      lessonNum2++
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (class1Lessons.length > 0) {
    await db.lesson.createMany({ data: class1Lessons })
    lessonsCount += class1Lessons.length
  }

  if (class2Lessons.length > 0) {
    await db.lesson.createMany({ data: class2Lessons })
    lessonsCount += class2Lessons.length
  }

  console.log(`  ✅ Generated ${lessonsCount} lessons`)

  // ============================================
  // ENROLLMENTS
  // ============================================
  console.log('📋 Creating enrollments...')
  await db.enrollment.create({
    data: {
      studentId: student.id,
      classId: class1.id,
      status: 'active',
    },
  })

  await db.enrollment.create({
    data: {
      studentId: student.id,
      classId: class2.id,
      status: 'active',
    },
  })

  console.log(`  ✅ Created 2 enrollments`)

  // ============================================
  // ATTENDANCE (for completed lessons)
  // ============================================
  console.log('✅ Creating attendance records...')
  const completedLessonsClass1 = await db.lesson.findMany({
    where: { classId: class1.id, status: 'COMPLETED' },
    select: { id: true },
  })

  const completedLessonsClass2 = await db.lesson.findMany({
    where: { classId: class2.id, status: 'COMPLETED' },
    select: { id: true },
  })

  const allCompletedLessons = [...completedLessonsClass1, ...completedLessonsClass2]

  let attendanceCount = 0
  for (const lesson of allCompletedLessons) {
    const statusRoll = Math.random()
    const status = statusRoll > 0.15 ? statusRoll > 0.05 ? 'PRESENT' : 'LATE' : 'ABSENT'

    await db.attendance.create({
      data: {
        lessonId: lesson.id,
        studentId: student.id,
        status,
        recordedBy: teacher.id,
      },
    })
    attendanceCount++
  }

  console.log(`  ✅ Created ${attendanceCount} attendance records`)

  // ============================================
  // AUDIT LOGS
  // ============================================
  console.log('📝 Creating audit logs...')
  await db.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entity: 'Semester',
        entityId: semester.id,
        details: JSON.stringify({ name: semester.name, code: semester.code }),
        userId: admin.id,
        ipAddress: '127.0.0.1',
      },
      {
        action: 'CREATE',
        entity: 'Class',
        entityId: class1.id,
        details: JSON.stringify({ name: class1.name, code: class1.code }),
        userId: coordinator.id,
        ipAddress: '127.0.0.1',
      },
      {
        action: 'ENROLL',
        entity: 'Student',
        entityId: student.id,
        details: JSON.stringify({ classId: class1.id, className: class1.name }),
        userId: student.id,
        ipAddress: '127.0.0.1',
      },
    ],
  })

  console.log(`  ✅ Created 3 audit log entries`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📧 Test accounts:')
  console.log('  Admin:       admin@orkestrando.com / 123456')
  console.log('  Coordinator: coord@orkestrando.com / 123456')
  console.log('  Teacher:     prof@orkestrando.com / 123456')
  console.log('  Student:     aluno@orkestrando.com / 123456')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
