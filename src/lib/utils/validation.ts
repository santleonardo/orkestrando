// =============================================================================
// ORKESTRANDO - Zod Validation Schemas
// =============================================================================

import { z } from 'zod/v4'

// ---- Common Schemas ----

const uuidSchema = z.uuid()
const emailSchema = z.email('E-mail inválido')
const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(128, 'Senha muito longa')
const phoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, 'Telefone inválido (apenas números, 10-11 dígitos)')
const cpfSchema = z
  .string()
  .regex(/^\d{11}$/, 'CPF inválido (apenas números, 11 dígitos)')
const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Horário inválido (formato HH:mm)')

// ---- Organization ----

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200),
  slug: z
    .string()
    .min(2, 'Slug deve ter no mínimo 2 caracteres')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  logoUrl: z.url('URL inválida').optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(10).optional(),
  country: z.string().min(2).max(100).default('Brasil'),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: z.url('URL inválida').optional(),
  maxTeachers: z.number().int().min(1).optional(),
  maxStudents: z.number().int().min(1).optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// ---- Teacher ----

export const createTeacherSchema = z.object({
  profileId: uuidSchema,
  userId: uuidSchema,
  organizationId: uuidSchema,
  hireDate: z.string().datetime('Data inválida').optional(),
  contractType: z.enum(['full_time', 'part_time', 'freelancer']).default('part_time'),
  subjects: z.array(uuidSchema).min(1, 'Pelo menos uma matéria é obrigatória'),
  maxWeeklyHours: z.number().int().min(1).max(80).default(40),
  specialties: z.array(z.string()).optional(),
  qualifications: z.string().max(500).optional(),
  salary: z.number().min(0).optional(),
})

export const updateTeacherSchema = createTeacherSchema.partial()

// ---- Student ----

export const createStudentSchema = z.object({
  profileId: uuidSchema,
  userId: uuidSchema,
  organizationId: uuidSchema,
  enrollmentNumber: z
    .string()
    .min(1, 'Matrícula é obrigatória')
    .max(50, 'Matrícula muito longa'),
  enrollmentDate: z.string().datetime('Data inválida'),
  courseLevel: z.string().max(100).optional(),
  semester: z.number().int().min(1).max(20).default(1),
  guardianName: z.string().max(200).optional(),
  guardianPhone: phoneSchema.optional(),
  guardianEmail: emailSchema.optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

// ---- Course ----

export const createCourseSchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200),
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens'),
  description: z.string().max(2000).optional(),
  durationHours: z.number().int().min(1, 'Duração mínima de 1 hora').max(9999),
  totalCredits: z.number().int().min(1).max(999),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).default('mixed'),
  modality: z.enum(['in_person', 'online', 'hybrid']).default('in_person'),
  tuitionFee: z.number().min(0).optional(),
  maxCapacity: z.number().int().min(1).max(9999).default(30),
  requirements: z.string().max(1000).optional(),
  objectives: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  imageUrl: z.url('URL inválida').optional(),
})

export const createSubjectSchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200),
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens'),
  description: z.string().max(2000).optional(),
  courseIds: z.array(uuidSchema).optional(),
  workloadHours: z.number().int().min(1).max(9999),
  prerequisites: z.array(uuidSchema).optional(),
})

// ---- Room ----

export const createRoomSchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  code: z.string().min(1, 'Código é obrigatório').max(20),
  capacity: z.number().int().min(1, 'Capacidade mínima de 1').max(9999),
  roomType: z.enum(['classroom', 'lab', 'auditorium', 'gym', 'library', 'other']).default('classroom'),
  building: z.string().max(100).optional(),
  floor: z.number().int().min(0).max(100).optional(),
  hasProjector: z.boolean().default(false),
  hasWhiteboard: z.boolean().default(true),
  hasAudioSystem: z.boolean().default(false),
  hasComputers: z.boolean().default(false),
  wifiAvailable: z.boolean().default(true),
  airConditioned: z.boolean().default(false),
  accessibilityFeatures: z.array(z.string()).optional(),
})

// ---- Class (Turma) ----

export const createClassSchema = z.object({
  organizationId: uuidSchema,
  courseId: uuidSchema,
  subjectId: uuidSchema,
  teacherId: uuidSchema,
  semesterId: uuidSchema,
  roomId: uuidSchema.optional(),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  code: z.string().min(1, 'Código é obrigatório').max(30),
  maxCapacity: z.number().int().min(1).max(9999).default(30),
  startDate: z.string().datetime('Data inválida'),
  endDate: z.string().datetime('Data inválida'),
  startTime: timeSchema,
  endTime: timeSchema,
  dayOfWeek: z.number().int().min(0).max(6),
  description: z.string().max(2000).optional(),
  syllabus: z.string().max(10000).optional(),
  gradingCriteria: z.object({
    attendanceWeight: z.number().min(0).max(1).default(0.2),
    participationWeight: z.number().min(0).max(1).default(0.1),
    assignmentWeight: z.number().min(0).max(1).default(0.3),
    examWeight: z.number().min(0).max(1).default(0.4),
    passingGrade: z.number().min(0).max(10).default(7.0),
    maxAbsences: z.number().int().min(0).max(999).default(5),
  }).optional(),
})

export const updateClassSchema = createClassSchema.partial()

// ---- Enrollment ----

export const createEnrollmentSchema = z.object({
  studentId: uuidSchema,
  classId: uuidSchema,
  semesterId: uuidSchema,
  organizationId: uuidSchema,
  enrollmentDate: z.string().datetime('Data inválida'),
})

// ---- Semester ----

export const createSemesterSchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  year: z.number().int().min(2020).max(2100),
  term: z.number().int().min(1).max(2),
  startDate: z.string().datetime('Data inválida'),
  endDate: z.string().datetime('Data inválida'),
  totalWeeks: z.number().int().min(1).max(52).default(20),
})

// ---- Teacher Availability ----

export const createTeacherAvailabilitySchema = z.object({
  teacherId: uuidSchema,
  organizationId: uuidSchema,
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
  recurringPattern: z.enum(['weekly', 'biweekly', 'monthly']).default('weekly'),
  validFrom: z.string().datetime('Data inválida').optional(),
  validUntil: z.string().datetime('Data inválida').optional(),
  notes: z.string().max(500).optional(),
})

// ---- Teacher Block ----

export const createTeacherBlockSchema = z.object({
  teacherId: uuidSchema,
  organizationId: uuidSchema,
  blockType: z.enum(['vacation', 'sick_leave', 'personal', 'conference', 'other']),
  startDate: z.string().datetime('Data inválida'),
  endDate: z.string().datetime('Data inválida'),
  reason: z.string().max(500).optional(),
})

// ---- Holiday ----

export const createHolidaySchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  date: z.string().datetime('Data inválida'),
  type: z.enum(['national', 'state', 'municipal', 'institutional']),
  isRecurring: z.boolean().default(false),
  affectsClasses: z.boolean().default(true),
})

// ---- Attendance ----

export const createAttendanceSchema = z.object({
  sessionId: uuidSchema,
  studentId: uuidSchema,
  classId: uuidSchema,
  status: z.enum(['present', 'absent', 'late', 'justified']),
  checkInTime: z.string().datetime('Data inválida').optional(),
  checkOutTime: z.string().datetime('Data inválida').optional(),
  notes: z.string().max(500).optional(),
  recordedBy: uuidSchema,
})

// ---- Material ----

export const createMaterialSchema = z.object({
  organizationId: uuidSchema,
  classId: uuidSchema,
  uploadedById: uuidSchema,
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(2000).optional(),
  materialType: z.enum(['pdf', 'docx', 'xlsx', 'pptx', 'mp3', 'mp4', 'image', 'zip', 'other']),
  fileUrl: z.url('URL inválida'),
  fileSize: z.number().int().min(0),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório').max(500),
  mimeType: z.string().min(1).max(200),
  tags: z.array(z.string()).optional(),
})

// ---- Assignment ----

export const createAssignmentSchema = z.object({
  organizationId: uuidSchema,
  classId: uuidSchema,
  createdById: uuidSchema,
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().min(1, 'Descrição é obrigatória').max(10000),
  instructions: z.string().max(10000).optional(),
  dueDate: z.string().datetime('Data inválida'),
  maxGrade: z.number().min(0).max(10).default(10),
  weight: z.number().min(0).max(1).default(1),
  materialType: z.enum(['text', 'file', 'link', 'mixed']).default('text'),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z.number().min(0).max(100).optional(),
  maxFileSize: z.number().int().min(0).optional(),
  allowedExtensions: z.array(z.string()).optional(),
})

// ---- Message ----

export const createMessageSchema = z.object({
  conversationId: uuidSchema,
  senderId: uuidSchema,
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(10000),
  messageType: z.enum(['text', 'image', 'file', 'system', 'audio']).default('text'),
  replyToId: uuidSchema.optional(),
})

// ---- Conversation ----

export const createConversationSchema = z.object({
  organizationId: uuidSchema,
  type: z.enum(['direct', 'group', 'class', 'announcement']).default('direct'),
  title: z.string().max(200).optional(),
  participantIds: z.array(uuidSchema).min(2, 'Mínimo de 2 participantes'),
})

// ---- Notification ----

export const createNotificationSchema = z.object({
  userId: uuidSchema,
  organizationId: uuidSchema,
  title: z.string().min(1, 'Título é obrigatório').max(200),
  message: z.string().min(1, 'Mensagem é obrigatória').max(1000),
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  channel: z.array(z.enum(['in_app', 'email', 'push'])).default(['in_app']),
  actionUrl: z.url('URL inválida').optional(),
})

// ---- Auth ----

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  lastName: z.string().min(2, 'Sobrenome deve ter no mínimo 2 caracteres').max(100),
  role: z.enum(['coordinator', 'teacher', 'student']),
  organizationId: uuidSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})
