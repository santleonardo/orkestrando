// =============================================================================
// ORKESTRANDO - System Constants
// =============================================================================

export const ROLES = {
  ADMIN: 'admin' as const,
  COORDINATOR: 'coordinator' as const,
  TEACHER: 'teacher' as const,
  STUDENT: 'student' as const,
} as const

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordenador',
  teacher: 'Professor',
  student: 'Aluno',
}

export const PERMISSIONS: Record<string, string[]> = {
  admin: [
    // Users
    'users.create', 'users.read', 'users.update', 'users.delete',
    // Organizations
    'organizations.create', 'organizations.read', 'organizations.update', 'organizations.delete',
    // Teachers
    'teachers.create', 'teachers.read', 'teachers.update', 'teachers.delete',
    // Students
    'students.create', 'students.read', 'students.update', 'students.delete',
    // Coordinators
    'coordinators.create', 'coordinators.read', 'coordinators.update', 'coordinators.delete',
    // Courses
    'courses.create', 'courses.read', 'courses.update', 'courses.delete',
    // Subjects
    'subjects.create', 'subjects.read', 'subjects.update', 'subjects.delete',
    // Rooms
    'rooms.create', 'rooms.read', 'rooms.update', 'rooms.delete',
    // Classes (Turmas)
    'classes.create', 'classes.read', 'classes.update', 'classes.delete',
    // Scheduling
    'schedule.create', 'schedule.read', 'schedule.update', 'schedule.delete',
    // Availability
    'availability.create', 'availability.read', 'availability.update', 'availability.delete', 'availability.approve', 'availability.reject',
    // Attendance
    'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
    // Materials
    'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
    // Assignments
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
    // Messages
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    // Reports
    'reports.create', 'reports.read', 'reports.export',
    // Audit
    'audit.read',
    // Notifications
    'notifications.manage',
    // Semesters
    'semesters.create', 'semesters.read', 'semesters.update', 'semesters.delete',
    // Holidays
    'holidays.create', 'holidays.read', 'holidays.update', 'holidays.delete',
    // AI
    'ai.use', 'ai.admin',
    // Enrollments
    'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete',
  ],
  coordinator: [
    // Users
    'users.create', 'users.read', 'users.update',
    // Teachers
    'teachers.create', 'teachers.read', 'teachers.update',
    // Students
    'students.create', 'students.read', 'students.update',
    // Courses
    'courses.create', 'courses.read', 'courses.update',
    // Subjects
    'subjects.create', 'subjects.read', 'subjects.update',
    // Rooms
    'rooms.create', 'rooms.read', 'rooms.update',
    // Classes
    'classes.create', 'classes.read', 'classes.update', 'classes.delete',
    // Scheduling
    'schedule.create', 'schedule.read', 'schedule.update', 'schedule.delete',
    // Availability
    'availability.create', 'availability.read', 'availability.update', 'availability.approve', 'availability.reject',
    // Attendance
    'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
    // Materials
    'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
    // Assignments
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
    // Messages
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    // Reports
    'reports.create', 'reports.read', 'reports.export',
    // Semesters
    'semesters.create', 'semesters.read', 'semesters.update',
    // Holidays
    'holidays.create', 'holidays.read', 'holidays.update',
    // AI
    'ai.use',
    // Enrollments
    'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete',
  ],
  teacher: [
    // Users (own profile only)
    'users.read',
    // Students (own classes only)
    'students.read',
    // Courses
    'courses.read',
    // Subjects
    'subjects.read',
    // Rooms
    'rooms.read',
    // Classes
    'classes.read',
    // Availability (own only)
    'availability.create', 'availability.read', 'availability.update',
    // Attendance (own classes)
    'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
    // Materials (own classes)
    'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
    // Assignments (own classes)
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
    // Messages
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    // Reports (limited)
    'reports.read', 'reports.export',
    // AI
    'ai.use',
    // Enrollments (read only for own classes)
    'enrollments.read',
  ],
  student: [
    // Users (own profile only)
    'users.read',
    // Courses
    'courses.read',
    // Subjects
    'subjects.read',
    // Classes (own enrollments only)
    'classes.read',
    // Attendance (own only)
    'attendance.read',
    // Materials (own classes)
    'materials.read',
    // Assignments (own only)
    'assignments.read',
    // Messages
    'messages.create', 'messages.read',
    // Enrollments (own only)
    'enrollments.read',
    // Reports (own data)
    'reports.read',
  ],
} as const

export const ATTENDANCE_STATUS = {
  PRESENT: 'present' as const,
  ABSENT: 'absent' as const,
  LATE: 'late' as const,
  JUSTIFIED: 'justified' as const,
} as const

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: 'Presente',
  absent: 'Ausente',
  late: 'Atrasado',
  justified: 'Justificado',
}

export const CLASS_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
} as const

export const CLASS_STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

export const ENROLLMENT_STATUS = {
  ACTIVE: 'active' as const,
  DROPPED: 'dropped' as const,
  COMPLETED: 'completed' as const,
  SUSPENDED: 'suspended' as const,
} as const

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  dropped: 'Trancada',
  completed: 'Concluída',
  suspended: 'Suspensa',
}

export const MESSAGE_STATUS = {
  SENT: 'sent' as const,
  READ: 'read' as const,
  DELETED: 'deleted' as const,
} as const

export const AVAILABILITY_STATUS = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
} as const

export const AVAILABILITY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
}

export const MATERIAL_TYPES = {
  PDF: 'pdf' as const,
  DOCX: 'docx' as const,
  XLSX: 'xlsx' as const,
  PPTX: 'pptx' as const,
  MP3: 'mp3' as const,
  MP4: 'mp4' as const,
  IMAGE: 'image' as const,
  ZIP: 'zip' as const,
  OTHER: 'other' as const,
} as const

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  docx: 'Documento Word',
  xlsx: 'Planilha Excel',
  pptx: 'Apresentação PowerPoint',
  mp3: 'Áudio',
  mp4: 'Vídeo',
  image: 'Imagem',
  zip: 'Arquivo Compactado',
  other: 'Outro',
}

export const WEEKDAYS = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
} as const

export const WEEKDAYS_SHORT = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
} as const

export const MONTHS = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
} as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
  '.zip', '.rar', '.7z',
  '.txt', '.csv', '.json',
] as const

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export const DEFAULT_GRADING_CRITERIA = {
  attendanceWeight: 0.2,
  participationWeight: 0.1,
  assignmentWeight: 0.3,
  examWeight: 0.4,
  passingGrade: 7.0,
  maxAbsences: 5,
}

export const CLASS_TIME_SLOTS = [
  { start: '07:00', end: '07:50', label: '1º Horário' },
  { start: '07:50', end: '08:40', label: '2º Horário' },
  { start: '08:50', end: '09:40', label: '3º Horário' },
  { start: '09:40', end: '10:30', label: '4º Horário' },
  { start: '10:40', end: '11:30', label: '5º Horário' },
  { start: '11:30', end: '12:20', label: '6º Horário' },
  { start: '13:00', end: '13:50', label: '7º Horário' },
  { start: '13:50', end: '14:40', label: '8º Horário' },
  { start: '14:50', end: '15:40', label: '9º Horário' },
  { start: '15:40', end: '16:30', label: '10º Horário' },
  { start: '16:40', end: '17:30', label: '11º Horário' },
  { start: '17:30', end: '18:20', label: '12º Horário' },
  { start: '19:00', end: '19:50', label: '13º Horário' },
  { start: '19:50', end: '20:40', label: '14º Horário' },
  { start: '20:50', end: '21:40', label: '15º Horário' },
  { start: '21:40', end: '22:30', label: '16º Horário' },
] as const

export const NOTIFICATION_TYPES = {
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
} as const

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app' as const,
  EMAIL: 'email' as const,
  PUSH: 'push' as const,
} as const

export const SESSION_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  rescheduled: 'Remarcada',
}
