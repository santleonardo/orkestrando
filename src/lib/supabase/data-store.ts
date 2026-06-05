// =============================================================================
// ORKESTRANDO - In-Memory Data Store
// Fallback when Supabase is unavailable, with realistic Brazilian seed data
// =============================================================================

import { v4 as uuidv4 } from 'uuid'
import type {
  Teacher, Student, Class, Room, Course, Subject, Semester,
  TeacherAvailability, Holiday, ClassSession, Enrollment, Attendance,
  Material, Conversation, Message, Notification, AuditLog,
  DayOfWeek, RecurringPattern, AvailabilityStatus,
  ClassStatus, SessionStatus, EnrollmentStatus,
  MessageStatus, AttendanceStatus, MaterialType, NotificationType,
  NotificationChannel, AuditAction,
} from '@/lib/types'

// ---- Supabase-style result wrapper ----
export interface StoreResult<T> {
  data: T | null
  error: { message: string; code?: string } | null
}

export interface StoreListResult<T> {
  data: T[]
  count: number
  error: { message: string; code?: string } | null
}

// ---- In-Memory Store ----
export interface DataStore {
  organizationId: string
  teachers: Teacher[]
  students: Student[]
  classes: Class[]
  rooms: Room[]
  courses: Course[]
  subjects: Subject[]
  semesters: Semester[]
  availability: TeacherAvailability[]
  holidays: Holiday[]
  sessions: ClassSession[]
  enrollments: Enrollment[]
  attendance: Attendance[]
  materials: Material[]
  conversations: Conversation[]
  messages: Message[]
  notifications: Notification[]
  auditLogs: AuditLog[]
}

const DEFAULT_ORG_ID = 'org-mock-001'

let store: DataStore | null = null

export function getStore(): DataStore {
  if (!store) {
    seedStore()
  }
  return store!
}

// ---- Profile helper names (used in joins) ----
const profileNames: Record<string, { fullName: string; firstName: string; lastName: string; email: string }> = {}

function getProfileName(id: string) {
  return profileNames[id] || { fullName: 'Usuário Desconhecido', firstName: 'Usuário', lastName: '', email: '' }
}

// ---- UUID pool for cross-referencing ----
const ids = {
  org: DEFAULT_ORG_ID,

  // Profiles / Users
  profile1: 'prof-carlos-01', profile2: 'prof-maria-02', profile3: 'prof-joao-03',
  profile4: 'prof-ana-04', profile5: 'prof-pedro-05', profile6: 'prof-lucia-06',
  user1: 'user-carlos-01', user2: 'user-maria-02', user3: 'user-joao-03',
  user4: 'user-ana-04', user5: 'user-pedro-05', user6: 'user-lucia-06',

  // Students
  student1: 'stu-lucas-01', student2: 'stu-julia-02', student3: 'stu-rafael-03',
  student4: 'stu-camila-04', student5: 'stu-gustavo-05', student6: 'stu-isabela-06',
  student7: 'stu-bruno-07', student8: 'stu-fernanda-08', student9: 'stu-diego-09',
  student10: 'stu-amanda-10', student11: 'stu-thiago-11', student12: 'stu-larissa-12',
  student13: 'stu-vinicius-13', student14: 'stu-natália-14', student15: 'stu-gabriel-15',
  stuProfile1: 'prof-lucas-s1', stuProfile2: 'prof-julia-s2', stuProfile3: 'prof-rafael-s3',
  stuProfile4: 'prof-camila-s4', stuProfile5: 'prof-gustavo-s5', stuProfile6: 'prof-isabela-s6',
  stuProfile7: 'prof-bruno-s7', stuProfile8: 'prof-fernanda-s8', stuProfile9: 'prof-diego-s9',
  stuProfile10: 'prof-amanda-s10', stuProfile11: 'prof-thiago-s11', stuProfile12: 'prof-larissa-s12',
  stuProfile13: 'prof-vinicius-s13', stuProfile14: 'prof-natália-s14', stuProfile15: 'prof-gabriel-s15',
  stuUser1: 'user-lucas-s1', stuUser2: 'user-julia-s2', stuUser3: 'user-rafael-s3',
  stuUser4: 'user-camila-s4', stuUser5: 'user-gustavo-s5', stuUser6: 'user-isabela-s6',
  stuUser7: 'user-bruno-s7', stuUser8: 'user-fernanda-s8', stuUser9: 'user-diego-s9',
  stuUser10: 'user-amanda-s10', stuUser11: 'user-thiago-s11', stuUser12: 'user-larissa-s12',
  stuUser13: 'user-vinicius-s13', stuUser14: 'user-natália-s14', stuUser15: 'user-gabriel-s15',

  // Teachers
  teacher1: 'tch-carlos-01', teacher2: 'tch-maria-02', teacher3: 'tch-joao-03',
  teacher4: 'tch-ana-04',

  // Rooms
  room1: 'rm-sala-101', room2: 'rm-sala-102', room3: 'rm-lab-info-01',
  room4: 'rm-audit-main', room5: 'rm-sala-201', room6: 'rm-lab-idio-01',

  // Courses
  course1: 'crs-ingles-inter', course2: 'crs-ingles-avan', course3: 'crs-esp-basico',
  course4: 'crs-mat-aplicada', course5: 'crs-port-literatura', course6: 'crs-filosofia',

  // Subjects
  subject1: 'sub-gramatica-uk', subject2: 'sub-conversacao-uk', subject3: 'sub-writing-uk',
  subject4: 'sub-gramatica-esp', subject5: 'sub-calculo-1', subject6: 'sub-literatura-br',
  subject7: 'sub-filos-contemp', subject8: 'sub-ingles-negocios',

  // Semesters
  semester1: 'sem-2025-1', semester2: 'sem-2025-2', semester3: 'sem-2024-2',

  // Classes
  class1: 'cls-ing-inter-a', class2: 'cls-ing-inter-b', class3: 'cls-ing-avan-a',
  class4: 'cls-esp-bas-a', class5: 'cls-mat-apl-a', class6: 'cls-port-lit-a',

  // Sessions
  session1: 'sess-001', session2: 'sess-002', session3: 'sess-003',
  session4: 'sess-004', session5: 'sess-005', session6: 'sess-006',
  session7: 'sess-007', session8: 'sess-008', session9: 'sess-009',
  session10: 'sess-010',

  // Holidays
  holiday1: 'hol-carnaval-25', holiday2: 'hol-sexta-santa-25', holiday3: 'hol-tiradentes-25',
  holiday4: 'hol-dia-trabalho-25', holiday5: 'hol-independencia-25',

  // Materials
  material1: 'mat-apostila-1', material2: 'mat-audio-1', material3: 'mat-video-1',

  // Conversations
  conv1: 'conv-carlos-maria-01', conv2: 'conv-turma-a-geral',

  // Notifications
  notif1: 'notif-welcome-01', notif2: 'notif-schedule-01', notif3: 'notif-alert-01',
}

// Populate profile names
profileNames[ids.profile1] = { fullName: 'Carlos Eduardo Silva', firstName: 'Carlos Eduardo', lastName: 'Silva', email: 'carlos.silva@escola.com' }
profileNames[ids.profile2] = { fullName: 'Maria Fernanda Costa', firstName: 'Maria Fernanda', lastName: 'Costa', email: 'maria.costa@escola.com' }
profileNames[ids.profile3] = { fullName: 'João Pedro Oliveira', firstName: 'João Pedro', lastName: 'Oliveira', email: 'joao.oliveira@escola.com' }
profileNames[ids.profile4] = { fullName: 'Ana Paula Souza', firstName: 'Ana Paula', lastName: 'Souza', email: 'ana.souza@escola.com' }
profileNames[ids.profile5] = { fullName: 'Pedro Henrique Lima', firstName: 'Pedro Henrique', lastName: 'Lima', email: 'pedro.lima@escola.com' }
profileNames[ids.profile6] = { fullName: 'Lúcia Beatriz Santos', firstName: 'Lúcia Beatriz', lastName: 'Santos', email: 'lucia.santos@escola.com' }

profileNames[ids.stuProfile1] = { fullName: 'Lucas Gabriel Mendes', firstName: 'Lucas Gabriel', lastName: 'Mendes', email: 'lucas.mendes@aluno.com' }
profileNames[ids.stuProfile2] = { fullName: 'Júlia Rodrigues Almeida', firstName: 'Júlia', lastName: 'Almeida', email: 'julia.almeida@aluno.com' }
profileNames[ids.stuProfile3] = { fullName: 'Rafael Martins Pereira', firstName: 'Rafael', lastName: 'Pereira', email: 'rafael.pereira@aluno.com' }
profileNames[ids.stuProfile4] = { fullName: 'Camila Fernandes Barbosa', firstName: 'Camila', lastName: 'Barbosa', email: 'camila.barbosa@aluno.com' }
profileNames[ids.stuProfile5] = { fullName: 'Gustavo Andrade Ribeiro', firstName: 'Gustavo', lastName: 'Ribeiro', email: 'gustavo.ribeiro@aluno.com' }
profileNames[ids.stuProfile6] = { fullName: 'Isabela Ferreira Gomes', firstName: 'Isabela', lastName: 'Gomes', email: 'isabela.gomes@aluno.com' }
profileNames[ids.stuProfile7] = { fullName: 'Bruno Cardoso Nascimento', firstName: 'Bruno', lastName: 'Nascimento', email: 'bruno.nascimento@aluno.com' }
profileNames[ids.stuProfile8] = { fullName: 'Fernanda Vieira Campos', firstName: 'Fernanda', lastName: 'Campos', email: 'fernanda.campos@aluno.com' }
profileNames[ids.stuProfile9] = { fullName: 'Diego Souza Teixeira', firstName: 'Diego', lastName: 'Teixeira', email: 'diego.teixeira@aluno.com' }
profileNames[ids.stuProfile10] = { fullName: 'Amanda Rocha Pinto', firstName: 'Amanda', lastName: 'Pinto', email: 'amanda.pinto@aluno.com' }
profileNames[ids.stuProfile11] = { fullName: 'Thiago Lopes Moreira', firstName: 'Thiago', lastName: 'Moreira', email: 'thiago.moreira@aluno.com' }
profileNames[ids.stuProfile12] = { fullName: 'Larissa Mota Dias', firstName: 'Larissa', lastName: 'Dias', email: 'larissa.dias@aluno.com' }
profileNames[ids.stuProfile13] = { fullName: 'Vinícius Freitas Monteiro', firstName: 'Vinícius', lastName: 'Monteiro', email: 'vinicius.monteiro@aluno.com' }
profileNames[ids.stuProfile14] = { fullName: 'Natália Carvalho Nunes', firstName: 'Natália', lastName: 'Nunes', email: 'natalia.nunes@aluno.com' }
profileNames[ids.stuProfile15] = { fullName: 'Gabriel Santos Ramos', firstName: 'Gabriel', lastName: 'Ramos', email: 'gabriel.ramos@aluno.com' }

function now(): string {
  return new Date().toISOString()
}

function seedStore(): void {
  const orgId = ids.org

  // Pre-generate sessions (needed for attendance generation)
  const preSessions = [
    // Sessions for class 1 (ING-201-A, Monday 08:00-10:00)
    ...generateSessionsForClass(ids.class1, ids.teacher1, ids.room1, 1, '08:00', '10:00', '2025-02-03', '2025-06-28',
      ['2025-03-03', '2025-03-04'], 12),
    // Sessions for class 2 (ING-201-B, Tuesday 08:00-10:00)
    ...generateSessionsForClass(ids.class2, ids.teacher2, ids.room6, 2, '08:00', '10:00', '2025-02-04', '2025-06-28',
      ['2025-04-18', '2025-04-21'], 10),
    // Sessions for class 3 (ING-301-A, Wednesday 08:00-10:00)
    ...generateSessionsForClass(ids.class3, ids.teacher1, ids.room3, 3, '08:00', '10:00', '2025-02-05', '2025-06-28',
      ['2025-05-01'], 8),
  ]

  // Pre-generate attendance for first 8 sessions of class 1
  const preAttendance: Attendance[] = preSessions.slice(0, 8).flatMap((session, si) =>
    (session.status !== 'cancelled' ? [ids.student1, ids.student2, ids.student3, ids.student4, ids.student5, ids.student7, ids.student9, ids.student10] : [])
      .map((studentId) => {
        const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'present', 'present', 'absent', 'late', 'present']
        const status = statuses[si % statuses.length] || 'present'
        return {
          id: uuidv4(), sessionId: session.id, studentId, classId: ids.class1,
          status, recordedBy: ids.teacher1,
          checkInTime: status !== 'absent' ? `${session.date}T${session.startTime}:00.000Z` : undefined,
          createdAt: session.createdAt, updatedAt: now(),
        }
      })
  )

  store = {
    organizationId: orgId,

    teachers: [
      {
        id: ids.teacher1, profileId: ids.profile1, userId: ids.user1, organizationId: orgId,
        hireDate: '2022-02-15T00:00:00.000Z', contractType: 'full_time',
        subjects: [ids.subject1, ids.subject2, ids.subject8],
        maxWeeklyHours: 40, specialties: ['Inglês para Negócios', 'Gramática Avançada'],
        qualifications: 'Doutor em Letras Inglesas - USP, CELTA, CPE',
        salary: 8500, isActive: true,
        createdAt: '2022-02-15T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.teacher2, profileId: ids.profile2, userId: ids.user2, organizationId: orgId,
        hireDate: '2021-08-01T00:00:00.000Z', contractType: 'full_time',
        subjects: [ids.subject3, ids.subject1],
        maxWeeklyHours: 40, specialties: ['Writing', 'Redação Acadêmica'],
        qualifications: 'Mestre em Linguística Aplicada - Unicamp, DELTA',
        salary: 7200, isActive: true,
        createdAt: '2021-08-01T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.teacher3, profileId: ids.profile3, userId: ids.user3, organizationId: orgId,
        hireDate: '2023-01-10T00:00:00.000Z', contractType: 'part_time',
        subjects: [ids.subject4, ids.subject7],
        maxWeeklyHours: 20, specialties: ['Espanhol Conversação', 'Filosofia Contemporânea'],
        qualifications: 'Mestre em Filosofia - UFRJ, DELE B2',
        salary: 4500, isActive: true,
        createdAt: '2023-01-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.teacher4, profileId: ids.profile4, userId: ids.user4, organizationId: orgId,
        hireDate: '2020-03-20T00:00:00.000Z', contractType: 'full_time',
        subjects: [ids.subject5, ids.subject6],
        maxWeeklyHours: 40, specialties: ['Cálculo', 'Literatura Brasileira'],
        qualifications: 'Doutor em Matemática - IMPA, Pós em Literatura - UFMG',
        salary: 9200, isActive: true,
        createdAt: '2020-03-20T10:00:00.000Z', updatedAt: now(),
      },
    ],

    students: [
      {
        id: ids.student1, profileId: ids.stuProfile1, userId: ids.stuUser1, organizationId: orgId,
        enrollmentNumber: '2025-001', enrollmentDate: '2025-01-10T00:00:00.000Z',
        courseLevel: 'intermediate', semester: 3, overallGpa: 8.5, totalCredits: 60,
        isActive: true,
        createdAt: '2025-01-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student2, profileId: ids.stuProfile2, userId: ids.stuUser2, organizationId: orgId,
        enrollmentNumber: '2025-002', enrollmentDate: '2025-01-10T00:00:00.000Z',
        courseLevel: 'intermediate', semester: 3, overallGpa: 9.1, totalCredits: 72,
        isActive: true,
        createdAt: '2025-01-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student3, profileId: ids.stuProfile3, userId: ids.stuUser3, organizationId: orgId,
        enrollmentNumber: '2025-003', enrollmentDate: '2025-01-15T00:00:00.000Z',
        courseLevel: 'beginner', semester: 1, overallGpa: 7.8, totalCredits: 24,
        guardianName: 'Roberto Martins', guardianPhone: '11987654321',
        isActive: true,
        createdAt: '2025-01-15T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student4, profileId: ids.stuProfile4, userId: ids.stuUser4, organizationId: orgId,
        enrollmentNumber: '2025-004', enrollmentDate: '2025-01-15T00:00:00.000Z',
        courseLevel: 'intermediate', semester: 2, overallGpa: 8.3, totalCredits: 48,
        isActive: true,
        createdAt: '2025-01-15T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student5, profileId: ids.stuProfile5, userId: ids.stuUser5, organizationId: orgId,
        enrollmentNumber: '2025-005', enrollmentDate: '2025-02-01T00:00:00.000Z',
        courseLevel: 'advanced', semester: 5, overallGpa: 9.4, totalCredits: 120,
        isActive: true,
        createdAt: '2025-02-01T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student6, profileId: ids.stuProfile6, userId: ids.stuUser6, organizationId: orgId,
        enrollmentNumber: '2025-006', enrollmentDate: '2025-02-01T00:00:00.000Z',
        courseLevel: 'beginner', semester: 1, overallGpa: 7.2, totalCredits: 24,
        guardianName: 'Cláudia Gomes', guardianPhone: '11976543210', guardianEmail: 'claudia.gomes@email.com',
        isActive: true,
        createdAt: '2025-02-01T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student7, profileId: ids.stuProfile7, userId: ids.stuUser7, organizationId: orgId,
        enrollmentNumber: '2024-107', enrollmentDate: '2024-02-15T00:00:00.000Z',
        courseLevel: 'advanced', semester: 6, overallGpa: 9.0, totalCredits: 144,
        isActive: true,
        createdAt: '2024-02-15T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student8, profileId: ids.stuProfile8, userId: ids.stuUser8, organizationId: orgId,
        enrollmentNumber: '2024-108', enrollmentDate: '2024-02-15T00:00:00.000Z',
        courseLevel: 'intermediate', semester: 4, overallGpa: 8.0, totalCredits: 96,
        isActive: false,
        createdAt: '2024-02-15T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student9, profileId: ids.stuProfile9, userId: ids.stuUser9, organizationId: orgId,
        enrollmentNumber: '2025-007', enrollmentDate: '2025-02-10T00:00:00.000Z',
        courseLevel: 'beginner', semester: 1, overallGpa: 6.8, totalCredits: 24,
        isActive: true,
        createdAt: '2025-02-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.student10, profileId: ids.stuProfile10, userId: ids.stuUser10, organizationId: orgId,
        enrollmentNumber: '2025-008', enrollmentDate: '2025-02-10T00:00:00.000Z',
        courseLevel: 'intermediate', semester: 2, overallGpa: 8.7, totalCredits: 48,
        isActive: true,
        createdAt: '2025-02-10T10:00:00.000Z', updatedAt: now(),
      },
    ],

    rooms: [
      {
        id: ids.room1, organizationId: orgId, name: 'Sala 101', code: 'S-101',
        capacity: 35, roomType: 'classroom', building: 'Bloco A', floor: 1,
        hasProjector: true, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false,
        wifiAvailable: true, airConditioned: true, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.room2, organizationId: orgId, name: 'Sala 102', code: 'S-102',
        capacity: 30, roomType: 'classroom', building: 'Bloco A', floor: 1,
        hasProjector: true, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false,
        wifiAvailable: true, airConditioned: true, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.room3, organizationId: orgId, name: 'Laboratório de Informática', code: 'LAB-01',
        capacity: 25, roomType: 'lab', building: 'Bloco B', floor: 2,
        hasProjector: true, hasWhiteboard: true, hasAudioSystem: true, hasComputers: true,
        wifiAvailable: true, airConditioned: true,
        accessibilityFeatures: ['rampa', 'elevador'],
        isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.room4, organizationId: orgId, name: 'Auditório Principal', code: 'AUD-01',
        capacity: 200, roomType: 'auditorium', building: 'Bloco Central', floor: 0,
        hasProjector: true, hasWhiteboard: true, hasAudioSystem: true, hasComputers: false,
        wifiAvailable: true, airConditioned: true,
        accessibilityFeatures: ['rampa', 'elevador', 'interprete'],
        isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.room5, organizationId: orgId, name: 'Sala 201', code: 'S-201',
        capacity: 40, roomType: 'classroom', building: 'Bloco A', floor: 2,
        hasProjector: true, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false,
        wifiAvailable: true, airConditioned: false, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.room6, organizationId: orgId, name: 'Laboratório de Idiomas', code: 'LAB-ID-01',
        capacity: 20, roomType: 'lab', building: 'Bloco C', floor: 1,
        hasProjector: true, hasWhiteboard: true, hasAudioSystem: true, hasComputers: true,
        wifiAvailable: true, airConditioned: true, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
    ],

    courses: [
      {
        id: ids.course1, organizationId: orgId, name: 'Inglês Intermediário', code: 'ING-201',
        description: 'Curso de inglês nível intermediário focado em conversação, gramática e writing skills.',
        durationHours: 120, totalCredits: 8, level: 'intermediate', modality: 'in_person',
        tuitionFee: 450, maxCapacity: 30,
        objectives: ['Melhorar fluência oral', 'Dominar tempos verbais avançados', 'Produzir textos acadêmicos'],
        competencies: ['Speaking B2', 'Writing B2', 'Listening B2', 'Reading B2'],
        isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.course2, organizationId: orgId, name: 'Inglês Avançado', code: 'ING-301',
        description: 'Curso avançado de inglês com foco em negociação, apresentação e writing profissional.',
        durationHours: 120, totalCredits: 8, level: 'advanced', modality: 'hybrid',
        tuitionFee: 580, maxCapacity: 25,
        requirements: 'Conclusão do Inglês Intermediário ou aprovação em teste de nivelamento',
        objectives: ['Apresentações profissionais em inglês', 'Negociação em contextos corporativos'],
        isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.course3, organizationId: orgId, name: 'Espanhol Básico', code: 'ESP-101',
        description: 'Curso introdutório de língua espanhola para brasileiros, com ênfase na proximidade linguística.',
        durationHours: 80, totalCredits: 6, level: 'beginner', modality: 'in_person',
        tuitionFee: 350, maxCapacity: 35,
        objectives: ['Comunicação básica', 'Compreensão auditiva elemental'],
        isActive: true,
        createdAt: '2021-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.course4, organizationId: orgId, name: 'Matemática Aplicada', code: 'MAT-101',
        description: 'Fundamentos de cálculo, álgebra linear e estatística aplicada.',
        durationHours: 160, totalCredits: 10, level: 'intermediate', modality: 'in_person',
        tuitionFee: 520, maxCapacity: 40,
        isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.course5, organizationId: orgId, name: 'Português e Literatura', code: 'POR-201',
        description: 'Estudo aprofundado de literatura brasileira e portuguesa, com prática de análise e redação.',
        durationHours: 120, totalCredits: 8, level: 'advanced', modality: 'in_person',
        tuitionFee: 400, maxCapacity: 30,
        isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.course6, organizationId: orgId, name: 'Filosofia Contemporânea', code: 'FIL-301',
        description: 'Estudo dos principais filósofos contemporâneos e suas contribuições para o pensamento moderno.',
        durationHours: 60, totalCredits: 4, level: 'advanced', modality: 'online',
        tuitionFee: 280, maxCapacity: 50,
        isActive: true,
        createdAt: '2022-01-01T00:00:00.000Z', updatedAt: now(),
      },
    ],

    subjects: [
      {
        id: ids.subject1, organizationId: orgId, name: 'Gramática Inglesa Intermediária', code: 'GRM-201',
        description: 'Estruturas gramaticais complexas: conditionals, passive voice, reported speech.',
        courseIds: [ids.course1], workloadHours: 40, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject2, organizationId: orgId, name: 'Conversação Inglesa', code: 'CNV-201',
        description: 'Prática de speaking com temas variados, debate e role-play.',
        courseIds: [ids.course1, ids.course2], workloadHours: 40, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject3, organizationId: orgId, name: 'Writing Skills', code: 'WRT-301',
        description: 'Produção textual avançada: essays, reports, academic articles.',
        courseIds: [ids.course2], workloadHours: 40, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject4, organizationId: orgId, name: 'Gramática Espanhola Básica', code: 'GRM-ESP-101',
        description: 'Fundamentos gramaticais do espanhol para falantes de português.',
        courseIds: [ids.course3], workloadHours: 30, isActive: true,
        createdAt: '2021-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject5, organizationId: orgId, name: 'Cálculo I', code: 'CAL-101',
        description: 'Limites, derivadas e integrais.',
        courseIds: [ids.course4], workloadHours: 80, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject6, organizationId: orgId, name: 'Literatura Brasileira', code: 'LIT-201',
        description: 'Do Romantismo ao Contemporâneo: análise de obras e autores.',
        courseIds: [ids.course5], workloadHours: 60, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject7, organizationId: orgId, name: 'Filosofia Contemporânea', code: 'FIL-301',
        description: 'Foucault, Deleuze, Habermas e pensadores contemporâneos.',
        courseIds: [ids.course6], workloadHours: 60, isActive: true,
        createdAt: '2022-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.subject8, organizationId: orgId, name: 'Inglês para Negócios', code: 'ENG-BIZ-301',
        description: 'Vocabulário corporativo, e-mails profissionais e reuniões em inglês.',
        courseIds: [ids.course2], workloadHours: 40, isActive: true,
        createdAt: '2020-01-01T00:00:00.000Z', updatedAt: now(),
      },
    ],

    semesters: [
      {
        id: ids.semester1, organizationId: orgId, name: '2025/1', year: 2025, term: 1,
        startDate: '2025-02-03T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        currentWeek: 14, totalWeeks: 20, isActive: true, holidays: [ids.holiday1, ids.holiday2, ids.holiday3, ids.holiday4],
        createdAt: '2025-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.semester2, organizationId: orgId, name: '2025/2', year: 2025, term: 2,
        startDate: '2025-08-04T00:00:00.000Z', endDate: '2025-12-20T00:00:00.000Z',
        totalWeeks: 20, isActive: false, holidays: [ids.holiday5],
        createdAt: '2025-01-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.semester3, organizationId: orgId, name: '2024/2', year: 2024, term: 2,
        startDate: '2024-08-05T00:00:00.000Z', endDate: '2024-12-21T00:00:00.000Z',
        totalWeeks: 20, isActive: false, holidays: [],
        createdAt: '2024-01-01T00:00:00.000Z', updatedAt: now(),
      },
    ],

    availability: [
      {
        id: uuidv4(), teacherId: ids.teacher1, organizationId: orgId,
        dayOfWeek: 1 as DayOfWeek, startTime: '08:00', endTime: '12:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        notes: 'Disponível manhãs de segunda',
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher1, organizationId: orgId,
        dayOfWeek: 3 as DayOfWeek, startTime: '08:00', endTime: '12:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        notes: 'Disponível manhãs de quarta',
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher1, organizationId: orgId,
        dayOfWeek: 5 as DayOfWeek, startTime: '14:00', endTime: '18:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher2, organizationId: orgId,
        dayOfWeek: 2 as DayOfWeek, startTime: '08:00', endTime: '16:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher2, organizationId: orgId,
        dayOfWeek: 4 as DayOfWeek, startTime: '08:00', endTime: '12:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher3, organizationId: orgId,
        dayOfWeek: 1 as DayOfWeek, startTime: '13:00', endTime: '17:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher3, organizationId: orgId,
        dayOfWeek: 3 as DayOfWeek, startTime: '13:00', endTime: '17:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher4, organizationId: orgId,
        dayOfWeek: 2 as DayOfWeek, startTime: '07:00', endTime: '11:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher4, organizationId: orgId,
        dayOfWeek: 4 as DayOfWeek, startTime: '07:00', endTime: '11:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'approved' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
      {
        id: uuidv4(), teacherId: ids.teacher4, organizationId: orgId,
        dayOfWeek: 5 as DayOfWeek, startTime: '07:00', endTime: '11:00',
        recurringPattern: 'weekly' as RecurringPattern, status: 'pending' as AvailabilityStatus,
        createdAt: now(), updatedAt: now(),
      },
    ],

    holidays: [
      {
        id: ids.holiday1, organizationId: orgId, name: 'Carnaval',
        date: '2025-03-04T00:00:00.000Z', type: 'national', isRecurring: true, affectsClasses: true,
        createdAt: '2024-12-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.holiday2, organizationId: orgId, name: 'Sexta-feira Santa',
        date: '2025-04-18T00:00:00.000Z', type: 'national', isRecurring: true, affectsClasses: true,
        createdAt: '2024-12-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.holiday3, organizationId: orgId, name: 'Tiradentes',
        date: '2025-04-21T00:00:00.000Z', type: 'national', isRecurring: true, affectsClasses: true,
        createdAt: '2024-12-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.holiday4, organizationId: orgId, name: 'Dia do Trabalho',
        date: '2025-05-01T00:00:00.000Z', type: 'national', isRecurring: true, affectsClasses: true,
        createdAt: '2024-12-01T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.holiday5, organizationId: orgId, name: 'Independência do Brasil',
        date: '2025-09-07T00:00:00.000Z', type: 'national', isRecurring: true, affectsClasses: true,
        createdAt: '2024-12-01T00:00:00.000Z', updatedAt: now(),
      },
    ],

    classes: [
      {
        id: ids.class1, organizationId: orgId, courseId: ids.course1, subjectId: ids.subject2,
        teacherId: ids.teacher1, semesterId: ids.semester1, roomId: ids.room1,
        name: 'Inglês Intermediário - Turma A', code: 'ING-201-A',
        schedule: { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', recurring: true, recurrencePattern: 'weekly' },
        maxCapacity: 25, currentEnrollment: 8, status: 'active' as ClassStatus,
        startDate: '2025-02-03T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        startTime: '08:00', endTime: '10:00', dayOfWeek: 1 as DayOfWeek,
        description: 'Turma de conversação em inglês nível intermediário, segundas pela manhã.',
        createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.class2, organizationId: orgId, courseId: ids.course1, subjectId: ids.subject1,
        teacherId: ids.teacher2, semesterId: ids.semester1, roomId: ids.room6,
        name: 'Inglês Intermediário - Turma B', code: 'ING-201-B',
        schedule: { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', recurring: true, recurrencePattern: 'weekly' },
        maxCapacity: 25, currentEnrollment: 6, status: 'active' as ClassStatus,
        startDate: '2025-02-04T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        startTime: '08:00', endTime: '10:00', dayOfWeek: 2 as DayOfWeek,
        description: 'Turma de gramática inglesa nível intermediário, terças pela manhã.',
        createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.class3, organizationId: orgId, courseId: ids.course2, subjectId: ids.subject8,
        teacherId: ids.teacher1, semesterId: ids.semester1, roomId: ids.room3,
        name: 'Inglês Avançado - Turma A', code: 'ING-301-A',
        schedule: { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', recurring: true, recurrencePattern: 'weekly' },
        maxCapacity: 20, currentEnrollment: 4, status: 'active' as ClassStatus,
        startDate: '2025-02-05T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        startTime: '08:00', endTime: '10:00', dayOfWeek: 3 as DayOfWeek,
        description: 'Inglês para Negócios, turma avançada, quartas pela manhã.',
        createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.class4, organizationId: orgId, courseId: ids.course3, subjectId: ids.subject4,
        teacherId: ids.teacher3, semesterId: ids.semester1, roomId: ids.room2,
        name: 'Espanhol Básico - Turma A', code: 'ESP-101-A',
        schedule: { dayOfWeek: 1, startTime: '13:00', endTime: '15:00', recurring: true, recurrencePattern: 'weekly' },
        maxCapacity: 35, currentEnrollment: 5, status: 'active' as ClassStatus,
        startDate: '2025-02-03T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        startTime: '13:00', endTime: '15:00', dayOfWeek: 1 as DayOfWeek,
        description: 'Espanhol básico para falantes de português, segundas à tarde.',
        createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.class5, organizationId: orgId, courseId: ids.course4, subjectId: ids.subject5,
        teacherId: ids.teacher4, semesterId: ids.semester1, roomId: ids.room5,
        name: 'Cálculo I - Turma A', code: 'MAT-101-A',
        schedule: { dayOfWeek: 2, startTime: '07:00', endTime: '11:00', recurring: true, recurrencePattern: 'weekly' },
        maxCapacity: 40, currentEnrollment: 0, status: 'active' as ClassStatus,
        startDate: '2025-02-04T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        startTime: '07:00', endTime: '11:00', dayOfWeek: 2 as DayOfWeek,
        description: 'Cálculo I, turma de manhã, terças-feiras.',
        createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.class6, organizationId: orgId, courseId: ids.course5, subjectId: ids.subject6,
        teacherId: ids.teacher4, semesterId: ids.semester1, roomId: ids.room1,
        name: 'Literatura Brasileira - Turma A', code: 'POR-201-A',
        schedule: { dayOfWeek: 4, startTime: '07:00', endTime: '09:00', recurring: true, recurrencePattern: 'weekly' },
        maxCapacity: 30, currentEnrollment: 0, status: 'active' as ClassStatus,
        startDate: '2025-02-06T00:00:00.000Z', endDate: '2025-06-28T00:00:00.000Z',
        startTime: '07:00', endTime: '09:00', dayOfWeek: 4 as DayOfWeek,
        description: 'Literatura Brasileira, quintas-feiras.',
        createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now(),
      },
    ],

    sessions: preSessions,

    enrollments: [
      // Class 1 enrollments
      { id: uuidv4(), studentId: ids.student1, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-01-20T00:00:00.000Z', createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student2, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-01-20T00:00:00.000Z', createdAt: '2025-01-20T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student3, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-01-22T00:00:00.000Z', createdAt: '2025-01-22T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student4, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-01-22T00:00:00.000Z', createdAt: '2025-01-22T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student5, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student7, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-05T00:00:00.000Z', createdAt: '2025-02-05T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student9, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-10T00:00:00.000Z', createdAt: '2025-02-10T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student10, classId: ids.class1, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-10T00:00:00.000Z', createdAt: '2025-02-10T00:00:00.000Z', updatedAt: now() },
      // Class 2 enrollments
      { id: uuidv4(), studentId: ids.student1, classId: ids.class2, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-01-22T00:00:00.000Z', createdAt: '2025-01-22T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student4, classId: ids.class2, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-01-22T00:00:00.000Z', createdAt: '2025-01-22T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student6, classId: ids.class2, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student10, classId: ids.class2, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-10T00:00:00.000Z', createdAt: '2025-02-10T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student11, classId: ids.class2, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-15T00:00:00.000Z', createdAt: '2025-02-15T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student12, classId: ids.class2, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-15T00:00:00.000Z', createdAt: '2025-02-15T00:00:00.000Z', updatedAt: now() },
      // Class 3 enrollments
      { id: uuidv4(), studentId: ids.student5, classId: ids.class3, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student7, classId: ids.class3, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-05T00:00:00.000Z', createdAt: '2025-02-05T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student2, classId: ids.class3, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student13, classId: ids.class3, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-20T00:00:00.000Z', createdAt: '2025-02-20T00:00:00.000Z', updatedAt: now() },
      // Class 4 enrollments
      { id: uuidv4(), studentId: ids.student6, classId: ids.class4, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student9, classId: ids.class4, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-10T00:00:00.000Z', createdAt: '2025-02-10T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student14, classId: ids.class4, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-20T00:00:00.000Z', createdAt: '2025-02-20T00:00:00.000Z', updatedAt: now() },
      { id: uuidv4(), studentId: ids.student15, classId: ids.class4, semesterId: ids.semester1, organizationId: orgId, status: 'active' as EnrollmentStatus, enrollmentDate: '2025-02-25T00:00:00.000Z', createdAt: '2025-02-25T00:00:00.000Z', updatedAt: now() },
    ],

    attendance: preAttendance,

    materials: [
      {
        id: ids.material1, organizationId: orgId, classId: ids.class1, uploadedById: ids.teacher1,
        title: 'Apostila de Conversação - Unidade 1', description: 'Material de apoio para conversação em inglês.',
        materialType: 'pdf' as MaterialType, fileUrl: '/uploads/apostila-conversacao-u1.pdf',
        fileSize: 2500000, fileName: 'apostila-conversacao-u1.pdf', mimeType: 'application/pdf',
        version: 1, currentVersionId: ids.material1, downloadCount: 45, isPublished: true,
        tags: ['conversação', 'unidade-1', 'intermediário'],
        createdAt: '2025-02-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.material2, organizationId: orgId, classId: ids.class1, uploadedById: ids.teacher1,
        title: 'Áudio - Listening Practice B2', description: 'Exercícios de compreensão auditiva nível B2.',
        materialType: 'mp3' as MaterialType, fileUrl: '/uploads/listening-practice-b2.mp3',
        fileSize: 8500000, fileName: 'listening-practice-b2.mp3', mimeType: 'audio/mpeg',
        version: 1, currentVersionId: ids.material2, downloadCount: 30, isPublished: true,
        tags: ['listening', 'B2', 'áudio'],
        createdAt: '2025-02-15T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.material3, organizationId: orgId, classId: ids.class3, uploadedById: ids.teacher1,
        title: 'Vídeo - Business English Presentation', description: 'Exemplo de apresentação corporativa em inglês.',
        materialType: 'mp4' as MaterialType, fileUrl: '/uploads/business-presentation.mp4',
        fileSize: 52000000, fileName: 'business-presentation.mp4', mimeType: 'video/mp4',
        version: 1, currentVersionId: ids.material3, downloadCount: 18, isPublished: true,
        tags: ['business', 'apresentação', 'vídeo'],
        createdAt: '2025-03-01T10:00:00.000Z', updatedAt: now(),
      },
    ],

    conversations: [
      {
        id: ids.conv1, organizationId: orgId, type: 'direct',
        title: null, avatarUrl: null,
        participantIds: [ids.teacher1, ids.teacher2],
        lastMessageAt: '2025-03-15T14:30:00.000Z',
        lastMessagePreview: 'Podemos alinhar o cronograma?',
        isArchived: false,
        createdAt: '2025-01-20T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.conv2, organizationId: orgId, type: 'class',
        title: 'ING-201-A - Geral', avatarUrl: null,
        participantIds: [ids.teacher1, ids.student1, ids.student2, ids.student3, ids.student4, ids.student5],
        lastMessageAt: '2025-03-14T09:15:00.000Z',
        lastMessagePreview: 'Lembrar: prova na próxima aula!',
        isArchived: false,
        metadata: { classId: ids.class1 },
        createdAt: '2025-01-20T10:00:00.000Z', updatedAt: now(),
      },
    ],

    messages: [
      {
        id: uuidv4(), conversationId: ids.conv1, senderId: ids.teacher1,
        content: 'Olá Maria, como estão as turmas de gramática?',
        status: 'read' as MessageStatus, messageType: 'text',
        isEdited: false, isPinned: false,
        createdAt: '2025-03-15T14:00:00.000Z', updatedAt: now(),
      },
      {
        id: uuidv4(), conversationId: ids.conv1, senderId: ids.teacher2,
        content: 'Tudo bem! As turmas estão motivadas. Podemos alinhar o cronograma?',
        status: 'read' as MessageStatus, messageType: 'text',
        isEdited: false, isPinned: false,
        createdAt: '2025-03-15T14:30:00.000Z', updatedAt: now(),
      },
      {
        id: uuidv4(), conversationId: ids.conv2, senderId: ids.teacher1,
        content: 'Bom dia turma! Lembrete: prova na próxima aula, estudem as unidades 3 e 4.',
        status: 'sent' as MessageStatus, messageType: 'text',
        isEdited: false, isPinned: true,
        createdAt: '2025-03-14T09:15:00.000Z', updatedAt: now(),
      },
      {
        id: uuidv4(), conversationId: ids.conv2, senderId: ids.student2,
        content: 'Obrigada professor! Já estou revisando.',
        status: 'read' as MessageStatus, messageType: 'text',
        isEdited: false, isPinned: false,
        createdAt: '2025-03-14T09:20:00.000Z', updatedAt: now(),
      },
      {
        id: uuidv4(), conversationId: ids.conv2, senderId: ids.student1,
        content: 'Professor, a prova é individual ou em grupo?',
        status: 'sent' as MessageStatus, messageType: 'text',
        isEdited: false, isPinned: false,
        createdAt: '2025-03-14T09:25:00.000Z', updatedAt: now(),
      },
    ],

    notifications: [
      {
        id: ids.notif1, userId: ids.student1, organizationId: orgId,
        title: 'Bem-vindo ao ORKESTRANDO!', message: 'Sua matrícula foi confirmada. Explore o sistema.',
        type: 'success' as NotificationType, channel: ['in_app'] as NotificationChannel[],
        isRead: true, readAt: '2025-01-20T11:00:00.000Z',
        createdAt: '2025-01-20T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.notif2, userId: ids.student1, organizationId: orgId,
        title: 'Novo material disponível', message: 'Apostila de Conversação - Unidade 1 foi adicionada na turma ING-201-A.',
        type: 'info' as NotificationType, channel: ['in_app', 'push'] as NotificationChannel[],
        isRead: false, actionUrl: '/materials/mat-apostila-1',
        createdAt: '2025-02-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: ids.notif3, userId: ids.teacher1, organizationId: orgId,
        title: 'Alerta de frequência baixa', message: '3 alunos da turma ING-201-A estão com frequência abaixo de 75%.',
        type: 'warning' as NotificationType, channel: ['in_app', 'email'] as NotificationChannel[],
        isRead: false,
        createdAt: '2025-03-20T08:00:00.000Z', updatedAt: now(),
      },
    ],

    auditLogs: [
      {
        id: uuidv4(), organizationId: orgId, userId: ids.teacher1,
        action: 'login' as AuditAction, entity: 'user', entityId: ids.user1,
        ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/121',
        createdAt: '2025-03-20T07:30:00.000Z', updatedAt: now(),
      },
      {
        id: uuidv4(), organizationId: orgId, userId: ids.teacher1,
        action: 'upload' as AuditAction, entity: 'material', entityId: ids.material1,
        metadata: { fileName: 'apostila-conversacao-u1.pdf', fileSize: 2500000 },
        ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/121',
        createdAt: '2025-02-10T10:00:00.000Z', updatedAt: now(),
      },
      {
        id: uuidv4(), organizationId: orgId, userId: ids.teacher1,
        action: 'attendance' as AuditAction, entity: 'class_session', entityId: ids.session1,
        metadata: { presentCount: 7, absentCount: 1 },
        createdAt: '2025-02-03T10:05:00.000Z', updatedAt: now(),
      },
    ],
  }
}

function generateSessionsForClass(
  classId: string, teacherId: string, roomId: string,
  dayOfWeek: number, startTime: string, endTime: string,
  startDate: string, endDate: string,
  skipDates: string[], count: number
): ClassSession[] {
  const sessions: ClassSession[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  let num = 1

  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== dayOfWeek) continue
    if (sessions.length >= count) break

    const dateStr = d.toISOString().split('T')[0]
    if (skipDates.includes(dateStr)) continue

    sessions.push({
      id: uuidv4(),
      classId, teacherId, roomId,
      date: dateStr, startTime, endTime,
      status: sessions.length < count - 1 ? 'scheduled' as SessionStatus : 'completed' as SessionStatus,
      topic: `Aula ${num}`,
      attendanceRecorded: sessions.length < count - 1 ? false : true,
      createdAt: dateStr + 'T00:00:00.000Z',
      updatedAt: now(),
    })
    num++
  }

  return sessions
}

// =============================================================================
// CRUD Helpers - Mimic Supabase operations
// =============================================================================

export function seedIfEmpty(): DataStore {
  if (!store) {
    seedStore()
  }
  return store
}

/** Paginate and filter any array */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20,
): { data: T[]; pagination: { page: number; pageSize: number; totalItems: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } } {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * pageSize
  const data = items.slice(start, start + pageSize)

  return {
    data,
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  }
}

/** Search in arrays of objects by string fields */
export function searchItems<T>(items: T[], searchTerm: string, fields: (keyof T)[]): T[] {
  if (!searchTerm) return items
  const lower = searchTerm.toLowerCase()
  return items.filter((item) =>
    fields.some((field) => {
      const val = item[field]
      if (typeof val === 'string') return val.toLowerCase().includes(lower)
      return false
    })
  )
}

/** Generic insert into store array */
export function insertItem<T extends { id: string }>(arr: T[], item: T): StoreResult<T> {
  arr.push(item)
  return { data: item, error: null }
}

/** Generic find by id */
export function findById<T extends { id: string }>(arr: T[], id: string): StoreResult<T> {
  const item = arr.find((i) => i.id === id) || null
  return { data: item, error: item ? null : { message: 'Registro não encontrado', code: 'NOT_FOUND' } }
}

/** Generic update by id */
export function updateById<T extends { id: string; updatedAt: string }>(arr: T[], id: string, updates: Partial<T>): StoreResult<T> {
  const idx = arr.findIndex((i) => i.id === id)
  if (idx === -1) return { data: null, error: { message: 'Registro não encontrado', code: 'NOT_FOUND' } }
  arr[idx] = { ...arr[idx], ...updates, updatedAt: now() }
  return { data: arr[idx], error: null }
}

/** Generic delete by id */
export function deleteById<T extends { id: string }>(arr: T[], id: string): StoreResult<T> {
  const idx = arr.findIndex((i) => i.id === id)
  if (idx === -1) return { data: null, error: { message: 'Registro não encontrado', code: 'NOT_FOUND' } }
  const [removed] = arr.splice(idx, 1)
  return { data: removed, error: null }
}

/** Get profile name for any user ID */
export function getProfile(id: string) {
  return getProfileName(id)
}

/** Helper to build class response with teacher/room/course/subject names */
export function enrichClass(cls: Class, s: DataStore) {
  const teacher = s.teachers.find((t) => t.id === cls.teacherId)
  const room = s.rooms.find((r) => r.id === cls.roomId)
  const course = s.courses.find((c) => c.id === cls.courseId)
  const subject = s.subjects.find((sub) => sub.id === cls.subjectId)
  const teacherProfile = teacher ? getProfileName(teacher.profileId) : null
  const enrollCount = s.enrollments.filter((e) => e.classId === cls.id && e.status === 'active').length

  return {
    ...cls,
    teacherName: teacherProfile?.fullName || 'Professor não atribuído',
    teacherFirstName: teacherProfile?.firstName || '',
    roomName: room?.name || 'Sem sala',
    roomCode: room?.code || '',
    courseName: course?.name || '',
    courseCode: course?.code || '',
    subjectName: subject?.name || '',
    subjectCode: subject?.code || '',
    enrollmentCount: enrollCount,
  }
}
