// =============================================================================
// ORKESTRANDO - Academic Management System
// Zod Validation Schemas
// =============================================================================

import { z } from 'zod';

// -----------------------------------------------------------------------------
// Shared / Reusable Schemas
// -----------------------------------------------------------------------------

export const uuidSchema = z.string().uuid();

export const positiveIntSchema = z.number().int().positive();
export const nonNegativeIntSchema = z.number().int().nonnegative();

export const emailSchema = z.string().email('E-mail inválido').toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .max(128, 'A senha deve ter no máximo 128 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um caractere especial');

export const simplePasswordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .max(128, 'A senha deve ter no máximo 128 caracteres');

export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter no mínimo 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .trim();

export const phoneSchema = z
  .string()
  .regex(
    /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
    'Número de telefone inválido'
  )
  .optional()
  .or(z.literal(''));

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido. Use apenas letras minúsculas, números e hífens.')
  .min(2)
  .max(100);

export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora inválido. Use HH:MM (ex: 08:30, 14:00)');

export const dateStringSchema = z.string().datetime({ offset: true }).or(z.string().date());

export const urlSchema = z.string().url('URL inválida').optional().or(z.literal(''));

export const baseEntitySchema = z.object({
  id: uuidSchema,
  orgId: uuidSchema,
});

// -----------------------------------------------------------------------------
// Organization Schemas
// -----------------------------------------------------------------------------

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200, 'Nome muito longo').trim(),
  slug: slugSchema.optional(),
  logo: z.string().url().optional().or(z.literal('')),
  domain: z.string().optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  phone: phoneSchema,
  email: emailSchema,
  website: urlSchema,
  maxStudents: positiveIntSchema.optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  locale: z.string().default('pt-BR'),
});

export const updateOrganizationSchema = createOrganizationSchema.partial().omit({});

// -----------------------------------------------------------------------------
// Profile Schemas
// -----------------------------------------------------------------------------

export const createProfileSchema = z.object({
  orgId: uuidSchema,
  userId: uuidSchema,
  role: z.enum([
    'SUPER_ADMIN',
    'COORDINATOR',
    'PROFESSOR',
    'STUDENT',
    'ASSISTANT',
  ]),
  firstName: nameSchema,
  lastName: nameSchema,
  displayName: z.string().min(2).max(150).trim(),
  email: emailSchema,
  phone: phoneSchema,
  avatar: z.string().url().optional().or(z.literal('')),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(['M', 'F', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(50).optional().or(z.literal('')),
  zipCode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).default('Brasil'),
});

export const updateProfileSchema = createProfileSchema.partial().omit({
  orgId: true,
  userId: true,
  role: true,
});

// -----------------------------------------------------------------------------
// Teacher Schemas
// -----------------------------------------------------------------------------

export const createTeacherSchema = z.object({
  profileId: uuidSchema,
  orgId: uuidSchema,
  employeeId: z.string().max(50).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  specialization: z.string().max(200).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  hireDate: z.string().date().optional(),
  maxHoursPerWeek: z.number().min(1).max(60).optional(),
  maxConcurrentClasses: z.number().min(1).max(20).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial().omit({
  profileId: true,
  orgId: true,
});

// -----------------------------------------------------------------------------
// Student Schemas
// -----------------------------------------------------------------------------

export const createStudentSchema = z.object({
  profileId: uuidSchema,
  orgId: uuidSchema,
  studentId: z.string().max(50).optional().or(z.literal('')),
  registrationNumber: z.string().max(50).optional().or(z.literal('')),
  course: z.string().max(100).optional().or(z.literal('')),
  semester: z.number().int().min(1).max(20).optional(),
  shift: z.enum(['MATUTINO', 'VESPERTINO', 'NOTURNO', 'INTEGRAL']).optional(),
  enrollmentDate: z.string().date().optional(),
  expectedGraduation: z.string().date().optional(),
  guardianName: z.string().max(150).optional().or(z.literal('')),
  guardianPhone: phoneSchema,
});

export const updateStudentSchema = createStudentSchema.partial().omit({
  profileId: true,
  orgId: true,
});

// -----------------------------------------------------------------------------
// Course Schemas
// -----------------------------------------------------------------------------

export const createCourseSchema = z.object({
  orgId: uuidSchema,
  name: z.string().min(2, 'Nome do curso deve ter no mínimo 2 caracteres').max(200).trim(),
  code: z
    .string()
    .min(2, 'Código deve ter no mínimo 2 caracteres')
    .max(30)
    .regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras maiúsculas e números')
    .toUpperCase()
    .trim(),
  description: z.string().max(2000).optional().or(z.literal('')),
  duration: z.number().int().min(1).max(20).optional(),
  totalHours: z.number().int().min(1).max(10000).optional(),
  modality: z.enum(['PRESENCIAL', 'HIBRIDO', 'EAD']).optional(),
});

export const updateCourseSchema = createCourseSchema.partial().omit({});

// -----------------------------------------------------------------------------
// Subject Schemas
// -----------------------------------------------------------------------------

export const createSubjectSchema = z.object({
  orgId: uuidSchema,
  courseId: uuidSchema,
  code: z
    .string()
    .min(2, 'Código deve ter no mínimo 2 caracteres')
    .max(30)
    .regex(/^[A-Z0-9-]+$/, 'Código inválido')
    .toUpperCase()
    .trim(),
  name: z.string().min(2, 'Nome da disciplina deve ter no mínimo 2 caracteres').max(200).trim(),
  description: z.string().max(2000).optional().or(z.literal('')),
  hoursPerWeek: z.number().min(1).max(40).optional(),
  totalHours: z.number().int().min(1).max(1000).optional(),
  credits: z.number().min(1).max(20).optional(),
  semester: z.number().int().min(1).max(20).optional(),
  prerequisites: z.string().max(500).optional().or(z.literal('')),
});

export const updateSubjectSchema = createSubjectSchema.partial().omit({
  orgId: true,
  courseId: true,
});

// -----------------------------------------------------------------------------
// Room Schemas
// -----------------------------------------------------------------------------

export const createRoomSchema = z.object({
  orgId: uuidSchema,
  name: z.string().min(2, 'Nome da sala deve ter no mínimo 2 caracteres').max(100).trim(),
  code: z.string().min(1, 'Código da sala é obrigatório').max(30).trim(),
  type: z.enum(['LAB', 'CLASSROOM', 'AUDITORIUM', 'STUDIO']),
  capacity: z.number().int().min(1).max(1000).optional(),
  building: z.string().max(100).optional().or(z.literal('')),
  floor: z.number().int().min(0).max(50).optional(),
  hasProjector: z.boolean().default(false),
  hasWhiteboard: z.boolean().default(true),
  hasComputers: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),
  hasAudioSystem: z.boolean().default(false),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const updateRoomSchema = createRoomSchema.partial().omit({});

// -----------------------------------------------------------------------------
// Semester Schemas
// -----------------------------------------------------------------------------

export const createSemesterSchema = z.object({
  orgId: uuidSchema,
  name: z.string().min(2, 'Nome do semestre deve ter no mínimo 2 caracteres').max(100).trim(),
  code: z.string().min(2, 'Código é obrigatório').max(30).trim(),
  startDate: z.string().date('Data de início inválida'),
  endDate: z.string().date('Data de término inválida'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UPCOMING']).default('UPCOMING'),
  academicYear: z.number().int().min(2000).max(2100),
  isCurrent: z.boolean().default(false),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'A data de início deve ser anterior à data de término', path: ['endDate'] }
);

export const updateSemesterSchema = createSemesterSchema.partial().omit({});

// -----------------------------------------------------------------------------
// Teacher Availability Schemas
// -----------------------------------------------------------------------------

export const createTeacherAvailabilitySchema = z.object({
  teacherId: uuidSchema,
  orgId: uuidSchema,
  weekday: z.enum([
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
  ]),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  isAvailable: z.boolean().default(true),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'Horário de início deve ser anterior ao horário de término', path: ['endTime'] }
);

export const updateTeacherAvailabilitySchema = createTeacherAvailabilitySchema.partial().omit({
  teacherId: true,
  orgId: true,
});

// -----------------------------------------------------------------------------
// Teacher Block Schemas
// -----------------------------------------------------------------------------

export const createTeacherBlockSchema = z.object({
  teacherId: uuidSchema,
  orgId: uuidSchema,
  startDate: z.string().date('Data de início inválida'),
  endDate: z.string().date('Data de término inválida'),
  reason: z.enum(['VACATION', 'MEETING', 'PERSONAL', 'MEDICAL', 'OTHER']),
  description: z.string().max(500).optional().or(z.literal('')),
  isApproved: z.boolean().default(false),
  approvedBy: uuidSchema.optional(),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'A data de início deve ser anterior ou igual à data de término', path: ['endDate'] }
);

// -----------------------------------------------------------------------------
// Holiday Schemas
// -----------------------------------------------------------------------------

export const createHolidaySchema = z.object({
  orgId: uuidSchema,
  name: z.string().min(2, 'Nome do feriado é obrigatório').max(200).trim(),
  date: z.string().date('Data inválida'),
  type: z.enum(['NATIONAL', 'LOCAL', 'INSTITUTIONAL']),
  isRecurring: z.boolean().default(false),
  description: z.string().max(500).optional().or(z.literal('')),
});

// -----------------------------------------------------------------------------
// Class Schemas
// -----------------------------------------------------------------------------

export const createClassSchema = z.object({
  orgId: uuidSchema,
  semesterId: uuidSchema,
  subjectId: uuidSchema,
  teacherId: uuidSchema,
  roomId: uuidSchema,
  code: z.string().min(1, 'Código da turma é obrigatório').max(30).trim(),
  name: z.string().max(200).optional().or(z.literal('')),
  weekday: z.enum([
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
  ]),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  vacancies: z.number().int().min(1).max(500).optional(),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'Horário de início deve ser anterior ao horário de término', path: ['endTime'] }
);

export const updateClassSchema = createClassSchema.partial().omit({});

// -----------------------------------------------------------------------------
// Class Session Schemas
// -----------------------------------------------------------------------------

export const createClassSessionSchema = z.object({
  classId: uuidSchema,
  orgId: uuidSchema,
  date: z.string().date('Data inválida'),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  topic: z.string().max(300).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  substituteTeacherId: uuidSchema.optional(),
  attendanceCompleted: z.boolean().default(false),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'Horário de início deve ser anterior ao horário de término', path: ['endTime'] }
);

export const updateClassSessionSchema = createClassSessionSchema.partial().omit({});

// -----------------------------------------------------------------------------
// Enrollment Schemas
// -----------------------------------------------------------------------------

export const createEnrollmentSchema = z.object({
  orgId: uuidSchema,
  classId: uuidSchema,
  studentId: uuidSchema,
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED', 'FAILED']).default('ACTIVE'),
});

export const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED', 'FAILED']),
  droppedAt: z.string().date().optional(),
  droppedReason: z.string().max(500).optional().or(z.literal('')),
  finalGrade: z.number().min(0).max(10).optional(),
  attendancePercentage: z.number().min(0).max(100).optional(),
});

// -----------------------------------------------------------------------------
// Attendance Schemas
// -----------------------------------------------------------------------------

export const createAttendanceSchema = z.object({
  sessionId: uuidSchema,
  orgId: uuidSchema,
  enrollmentId: uuidSchema,
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  notes: z.string().max(500).optional().or(z.literal('')),
  recordedBy: uuidSchema.optional(),
});

export const bulkAttendanceSchema = z.object({
  sessionId: uuidSchema,
  records: z.array(
    z.object({
      enrollmentId: uuidSchema,
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      notes: z.string().max(500).optional().or(z.literal('')),
    })
  ).min(1, 'Deve haver ao menos um registro de frequência'),
});

// -----------------------------------------------------------------------------
// Material Schemas
// -----------------------------------------------------------------------------

export const createMaterialSchema = z.object({
  orgId: uuidSchema,
  sessionId: uuidSchema.optional(),
  classId: uuidSchema,
  title: z.string().min(2, 'Título é obrigatório').max(255).trim(),
  description: z.string().max(2000).optional().or(z.literal('')),
  type: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX', 'MP3', 'MP4', 'IMAGE', 'ZIP', 'OTHER']),
  fileSize: z.number().int().positive().max(500 * 1024 * 1024, 'Arquivo excede 500 MB'),
  fileUrl: z.string().url('URL do arquivo inválida'),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  isPublished: z.boolean().default(false),
});

export const updateMaterialSchema = z.object({
  title: z.string().min(2).max(255).trim().optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  type: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX', 'MP3', 'MP4', 'IMAGE', 'ZIP', 'OTHER']).optional(),
  isPublished: z.boolean().optional(),
});

// -----------------------------------------------------------------------------
// Assignment Schemas
// -----------------------------------------------------------------------------

export const createAssignmentSchema = z.object({
  orgId: uuidSchema,
  classId: uuidSchema,
  createdBy: uuidSchema,
  title: z.string().min(2, 'Título é obrigatório').max(255).trim(),
  description: z.string().max(5000).optional().or(z.literal('')),
  instructions: z.string().max(5000).optional().or(z.literal('')),
  dueDate: z.string().datetime({ offset: true, message: 'Data de entrega inválida' }).or(z.string().date('Data de entrega inválida')),
  maxGrade: z.number().min(0).max(100).default(10),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z.number().min(0).max(100).optional(),
  isPublished: z.boolean().default(false),
});

// -----------------------------------------------------------------------------
// Assignment Submission Schemas
// -----------------------------------------------------------------------------

export const createAssignmentSubmissionSchema = z.object({
  orgId: uuidSchema,
  assignmentId: uuidSchema,
  enrollmentId: uuidSchema,
  status: z.enum(['PENDING', 'SUBMITTED', 'GRADED', 'RETURNED']).default('SUBMITTED'),
  content: z.string().max(10000).optional().or(z.literal('')),
  fileUrl: z.string().url().optional().or(z.literal('')),
  fileName: z.string().max(255).optional().or(z.literal('')),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024).optional(),
});

// -----------------------------------------------------------------------------
// Conversation Schemas
// -----------------------------------------------------------------------------

export const createConversationSchema = z.object({
  orgId: uuidSchema,
  type: z.enum(['DIRECT', 'GROUP', 'ANNOUNCEMENT']),
  title: z.string().max(200).optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  participantIds: z.array(uuidSchema).min(1, 'Deve haver ao menos um participante'),
});

// -----------------------------------------------------------------------------
// Message Schemas
// -----------------------------------------------------------------------------

export const createMessageSchema = z.object({
  conversationId: uuidSchema,
  senderId: uuidSchema,
  orgId: uuidSchema,
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(10000),
  replyToId: uuidSchema.optional(),
});

// -----------------------------------------------------------------------------
// Notification Schemas
// -----------------------------------------------------------------------------

export const createNotificationSchema = z.object({
  orgId: uuidSchema,
  profileId: uuidSchema,
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  title: z.string().min(1, 'Título é obrigatório').max(255),
  message: z.string().min(1, 'Mensagem é obrigatória').max(1000),
  data: z.string().max(5000).optional().or(z.literal('')),
  actionUrl: z.string().url().optional().or(z.literal('')),
});

// -----------------------------------------------------------------------------
// Auth Schemas
// -----------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z.object({
  orgId: uuidSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  role: z.enum(['PROFESSOR', 'STUDENT', 'ASSISTANT']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'A nova senha deve ser diferente da senha atual',
  path: ['newPassword'],
});

// -----------------------------------------------------------------------------
// Pagination Schema
// -----------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// -----------------------------------------------------------------------------
// Filter Schemas
// -----------------------------------------------------------------------------

export const dateRangeFilterSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'Data de início deve ser anterior à data de término', path: ['endDate'] }
);

export const classFilterSchema = paginationSchema.extend({
  semesterId: uuidSchema.optional(),
  teacherId: uuidSchema.optional(),
  subjectId: uuidSchema.optional(),
  roomId: uuidSchema.optional(),
  weekday: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
  shift: z.enum(['MATUTINO', 'VESPERTINO', 'NOTURNO']).optional(),
});

export const studentFilterSchema = paginationSchema.extend({
  courseId: uuidSchema.optional(),
  semester: z.coerce.number().int().min(1).optional(),
  classId: uuidSchema.optional(),
  enrollmentStatus: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED', 'FAILED']).optional(),
});

export const attendanceFilterSchema = dateRangeFilterSchema.extend({
  sessionId: uuidSchema.optional(),
  classId: uuidSchema.optional(),
  studentId: uuidSchema.optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
});

// -----------------------------------------------------------------------------
// Report Generation Schema
// -----------------------------------------------------------------------------

export const createReportSchema = z.object({
  orgId: uuidSchema,
  type: z.enum([
    'FREQUENCY', 'HOURS', 'EVASION', 'ROOMS', 'TEACHERS',
    'MONTHLY', 'SEMESTRAL', 'CUSTOM',
  ]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  classIds: z.array(uuidSchema).optional(),
  teacherIds: z.array(uuidSchema).optional(),
  studentIds: z.array(uuidSchema).optional(),
  roomIds: z.array(uuidSchema).optional(),
  courseId: uuidSchema.optional(),
  semesterId: uuidSchema.optional(),
  includeCharts: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  format: z.enum(['pdf', 'xlsx', 'csv']).default('pdf'),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Data de início deve ser anterior à data de término', path: ['endDate'] }
);

// -----------------------------------------------------------------------------
// Session Settings Schema
// -----------------------------------------------------------------------------

export const createSessionSettingsSchema = z.object({
  sessionId: uuidSchema,
  orgId: uuidSchema,
  requiresSignature: z.boolean().default(true),
  autoCloseMinutes: z.number().int().min(0).max(480).optional(),
  gpsVerification: z.boolean().default(false),
  gpsRadius: z.number().int().min(10).max(1000).optional(),
});

// -----------------------------------------------------------------------------
// Signature Schema
// -----------------------------------------------------------------------------

export const createAttendanceSignatureSchema = z.object({
  sessionId: uuidSchema,
  orgId: uuidSchema,
  profileId: uuidSchema,
  type: z.enum(['OPEN_CLASS', 'CLOSE_CLASS', 'ATTENDANCE']),
  signatureData: z.string().min(1, 'Dados da assinatura são obrigatórios'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  geolocation: z.string().optional(),
});

// -----------------------------------------------------------------------------
// File Upload Schema
// -----------------------------------------------------------------------------

export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1).max(100),
  category: z.enum(['avatar', 'material', 'assignment', 'message_attachment', 'report', 'general']),
});

// -----------------------------------------------------------------------------
// AI Schemas
// -----------------------------------------------------------------------------

export const aiScheduleSuggestionSchema = z.object({
  orgId: uuidSchema,
  subjectId: uuidSchema,
  teacherId: uuidSchema,
  semesterId: uuidSchema,
  hoursPerWeek: z.number().int().min(1).max(40),
  preferredDays: z.array(
    z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
  ).optional(),
  preferredTimeRange: z.object({
    start: timeStringSchema,
    end: timeStringSchema,
  }).optional(),
  roomId: uuidSchema.optional(),
});

export const aiConflictDetectionSchema = z.object({
  orgId: uuidSchema,
  semesterId: uuidSchema,
  classId: uuidSchema.optional(),
  teacherId: uuidSchema,
  weekday: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  roomId: uuidSchema.optional(),
});

export const aiEvasionPredictionSchema = z.object({
  orgId: uuidSchema,
  studentId: uuidSchema.optional(),
  classId: uuidSchema.optional(),
  semesterId: uuidSchema,
  include: z.array(z.enum(['factors', 'suggestions', 'history'])).default(['factors', 'suggestions']),
});

export const aiReportGenerationSchema = z.object({
  orgId: uuidSchema,
  type: z.enum([
    'FREQUENCY', 'HOURS', 'EVASION', 'ROOMS', 'TEACHERS',
    'MONTHLY', 'SEMESTRAL', 'CUSTOM',
  ]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  classIds: z.array(uuidSchema).optional(),
  teacherIds: z.array(uuidSchema).optional(),
  focus: z.string().optional(),
  language: z.string().default('pt-BR'),
});

// -----------------------------------------------------------------------------
// Type Inference Helpers
// -----------------------------------------------------------------------------

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
export type CreateTeacherAvailabilityInput = z.infer<typeof createTeacherAvailabilitySchema>;
export type UpdateTeacherAvailabilityInput = z.infer<typeof updateTeacherAvailabilitySchema>;
export type CreateTeacherBlockInput = z.infer<typeof createTeacherBlockSchema>;
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateClassSessionInput = z.infer<typeof createClassSessionSchema>;
export type UpdateClassSessionInput = z.infer<typeof updateClassSessionSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateAssignmentSubmissionInput = z.infer<typeof createAssignmentSubmissionSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type AIScheduleSuggestionInput = z.infer<typeof aiScheduleSuggestionSchema>;
export type AIConflictDetectionInput = z.infer<typeof aiConflictDetectionSchema>;
export type AIEvasionPredictionInput = z.infer<typeof aiEvasionPredictionSchema>;
export type AIReportGenerationInput = z.infer<typeof aiReportGenerationSchema>;
