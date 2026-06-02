// =============================================================================
// ORKESTRANDO - Academic Management System
// Constants, Permissions, and Configuration
// =============================================================================

import { Role, Weekday, AttendanceStatus, ClassSessionStatus, MaterialType } from '@/types';

// -----------------------------------------------------------------------------
// Permissions
// -----------------------------------------------------------------------------

export const PERMISSIONS = [
  // Organization
  { name: 'org:view', module: 'organization', action: 'view', description: 'Visualizar dados da organização' },
  { name: 'org:update', module: 'organization', action: 'update', description: 'Editar dados da organização' },
  { name: 'org:delete', module: 'organization', action: 'delete', description: 'Excluir organização' },
  { name: 'org:manage_settings', module: 'organization', action: 'manage_settings', description: 'Gerenciar configurações da organização' },

  // Users & Profiles
  { name: 'users:view', module: 'users', action: 'view', description: 'Visualizar usuários' },
  { name: 'users:create', module: 'users', action: 'create', description: 'Criar usuários' },
  { name: 'users:update', module: 'users', action: 'update', description: 'Editar usuários' },
  { name: 'users:delete', module: 'users', action: 'delete', description: 'Excluir usuários' },
  { name: 'users:manage_roles', module: 'users', action: 'manage_roles', description: 'Gerenciar papéis de usuários' },
  { name: 'users:import', module: 'users', action: 'import', description: 'Importar usuários em massa' },
  { name: 'users:export', module: 'users', action: 'export', description: 'Exportar dados de usuários' },

  // Teachers
  { name: 'teachers:view', module: 'teachers', action: 'view', description: 'Visualizar professores' },
  { name: 'teachers:create', module: 'teachers', action: 'create', description: 'Criar professores' },
  { name: 'teachers:update', module: 'teachers', action: 'update', description: 'Editar professores' },
  { name: 'teachers:delete', module: 'teachers', action: 'delete', description: 'Excluir professores' },
  { name: 'teachers:manage_availability', module: 'teachers', action: 'manage_availability', description: 'Gerenciar disponibilidade de professores' },
  { name: 'teachers:manage_schedule', module: 'teachers', action: 'manage_schedule', description: 'Gerenciar horários de professores' },

  // Students
  { name: 'students:view', module: 'students', action: 'view', description: 'Visualizar alunos' },
  { name: 'students:create', module: 'students', action: 'create', description: 'Criar alunos' },
  { name: 'students:update', module: 'students', action: 'update', description: 'Editar alunos' },
  { name: 'students:delete', module: 'students', action: 'delete', description: 'Excluir alunos' },
  { name: 'students:import', module: 'students', action: 'import', description: 'Importar alunos em massa' },
  { name: 'students:export', module: 'students', action: 'export', description: 'Exportar dados de alunos' },
  { name: 'students:manage_enrollment', module: 'students', action: 'manage_enrollment', description: 'Gerenciar matrículas de alunos' },

  // Courses & Subjects
  { name: 'courses:view', module: 'courses', action: 'view', description: 'Visualizar cursos' },
  { name: 'courses:create', module: 'courses', action: 'create', description: 'Criar cursos' },
  { name: 'courses:update', module: 'courses', action: 'update', description: 'Editar cursos' },
  { name: 'courses:delete', module: 'courses', action: 'delete', description: 'Excluir cursos' },
  { name: 'subjects:view', module: 'subjects', action: 'view', description: 'Visualizar disciplinas' },
  { name: 'subjects:create', module: 'subjects', action: 'create', description: 'Criar disciplinas' },
  { name: 'subjects:update', module: 'subjects', action: 'update', description: 'Editar disciplinas' },
  { name: 'subjects:delete', module: 'subjects', action: 'delete', description: 'Excluir disciplinas' },

  // Rooms
  { name: 'rooms:view', module: 'rooms', action: 'view', description: 'Visualizar salas' },
  { name: 'rooms:create', module: 'rooms', action: 'create', description: 'Criar salas' },
  { name: 'rooms:update', module: 'rooms', action: 'update', description: 'Editar salas' },
  { name: 'rooms:delete', module: 'rooms', action: 'delete', description: 'Excluir salas' },
  { name: 'rooms:manage_schedule', module: 'rooms', action: 'manage_schedule', description: 'Gerenciar agenda de salas' },

  // Classes & Schedule
  { name: 'classes:view', module: 'classes', action: 'view', description: 'Visualizar turmas' },
  { name: 'classes:create', module: 'classes', action: 'create', description: 'Criar turmas' },
  { name: 'classes:update', module: 'classes', action: 'update', description: 'Editar turmas' },
  { name: 'classes:delete', module: 'classes', action: 'delete', description: 'Excluir turmas' },
  { name: 'classes:manage_enrollment', module: 'classes', action: 'manage_enrollment', description: 'Gerenciar matrículas em turmas' },
  { name: 'schedule:view', module: 'schedule', action: 'view', description: 'Visualizar grade horária' },
  { name: 'schedule:create', module: 'schedule', action: 'create', description: 'Criar grade horária' },
  { name: 'schedule:update', module: 'schedule', action: 'update', description: 'Editar grade horária' },
  { name: 'schedule:manage_conflicts', module: 'schedule', action: 'manage_conflicts', description: 'Gerenciar conflitos de horário' },

  // Attendance
  { name: 'attendance:view', module: 'attendance', action: 'view', description: 'Visualizar frequência' },
  { name: 'attendance:record', module: 'attendance', action: 'record', description: 'Registrar frequência' },
  { name: 'attendance:edit', module: 'attendance', action: 'edit', description: 'Editar frequência' },
  { name: 'attendance:export', module: 'attendance', action: 'export', description: 'Exportar dados de frequência' },
  { name: 'attendance:manage_signatures', module: 'attendance', action: 'manage_signatures', description: 'Gerenciar assinaturas digitais' },

  // Materials
  { name: 'materials:view', module: 'materials', action: 'view', description: 'Visualizar materiais' },
  { name: 'materials:create', module: 'materials', action: 'create', description: 'Criar materiais' },
  { name: 'materials:update', module: 'materials', action: 'update', description: 'Editar materiais' },
  { name: 'materials:delete', module: 'materials', action: 'delete', description: 'Excluir materiais' },
  { name: 'materials:download', module: 'materials', action: 'download', description: 'Baixar materiais' },

  // Assignments
  { name: 'assignments:view', module: 'assignments', action: 'view', description: 'Visualizar atividades' },
  { name: 'assignments:create', module: 'assignments', action: 'create', description: 'Criar atividades' },
  { name: 'assignments:update', module: 'assignments', action: 'update', description: 'Editar atividades' },
  { name: 'assignments:delete', module: 'assignments', action: 'delete', description: 'Excluir atividades' },
  { name: 'assignments:submit', module: 'assignments', action: 'submit', description: 'Entregar atividades' },
  { name: 'assignments:grade', module: 'assignments', action: 'grade', description: 'Avaliar atividades' },

  // Messages
  { name: 'messages:view', module: 'messages', action: 'view', description: 'Visualizar mensagens' },
  { name: 'messages:create', module: 'messages', action: 'create', description: 'Enviar mensagens' },
  { name: 'messages:delete', module: 'messages', action: 'delete', description: 'Excluir mensagens' },
  { name: 'messages:manage_announcements', module: 'messages', action: 'manage_announcements', description: 'Gerenciar comunicados' },

  // Notifications
  { name: 'notifications:view', module: 'notifications', action: 'view', description: 'Visualizar notificações' },
  { name: 'notifications:manage', module: 'notifications', action: 'manage', description: 'Gerenciar notificações' },
  { name: 'notifications:send', module: 'notifications', action: 'send', description: 'Enviar notificações' },

  // Semesters
  { name: 'semesters:view', module: 'semesters', action: 'view', description: 'Visualizar semestres' },
  { name: 'semesters:create', module: 'semesters', action: 'create', description: 'Criar semestres' },
  { name: 'semesters:update', module: 'semesters', action: 'update', description: 'Editar semestres' },
  { name: 'semesters:delete', module: 'semesters', action: 'delete', description: 'Excluir semestres' },

  // Holidays
  { name: 'holidays:view', module: 'holidays', action: 'view', description: 'Visualizar feriados' },
  { name: 'holidays:create', module: 'holidays', action: 'create', description: 'Criar feriados' },
  { name: 'holidays:update', module: 'holidays', action: 'update', description: 'Editar feriados' },
  { name: 'holidays:delete', module: 'holidays', action: 'delete', description: 'Excluir feriados' },

  // Reports
  { name: 'reports:view', module: 'reports', action: 'view', description: 'Visualizar relatórios' },
  { name: 'reports:create', module: 'reports', action: 'create', description: 'Gerar relatórios' },
  { name: 'reports:export', module: 'reports', action: 'export', description: 'Exportar relatórios' },
  { name: 'reports:ai_generate', module: 'reports', action: 'ai_generate', description: 'Gerar relatórios com IA' },

  // Audit
  { name: 'audit:view', module: 'audit', action: 'view', description: 'Visualizar logs de auditoria' },
  { name: 'audit:export', module: 'audit', action: 'export', description: 'Exportar logs de auditoria' },

  // AI Features
  { name: 'ai:suggest_schedule', module: 'ai', action: 'suggest_schedule', description: 'Sugerir horários com IA' },
  { name: 'ai:detect_conflicts', module: 'ai', action: 'detect_conflicts', description: 'Detectar conflitos com IA' },
  { name: 'ai:predict_evasion', module: 'ai', action: 'predict_evasion', description: 'Prever evasão com IA' },
  { name: 'ai:generate_report', module: 'ai', action: 'generate_report', description: 'Gerar relatórios com IA' },
] as const;

// -----------------------------------------------------------------------------
// Role-Permission Mapping
// -----------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: [
    // Super Admin has ALL permissions
    ...PERMISSIONS.map((p) => p.name),
  ],

  [Role.COORDINATOR]: [
    'org:view',
    'org:update',
    'org:manage_settings',
    'users:view',
    'users:create',
    'users:update',
    'users:import',
    'users:export',
    'teachers:view',
    'teachers:create',
    'teachers:update',
    'teachers:manage_availability',
    'teachers:manage_schedule',
    'students:view',
    'students:create',
    'students:update',
    'students:import',
    'students:export',
    'students:manage_enrollment',
    'courses:view',
    'courses:create',
    'courses:update',
    'courses:delete',
    'subjects:view',
    'subjects:create',
    'subjects:update',
    'subjects:delete',
    'rooms:view',
    'rooms:create',
    'rooms:update',
    'rooms:delete',
    'rooms:manage_schedule',
    'classes:view',
    'classes:create',
    'classes:update',
    'classes:delete',
    'classes:manage_enrollment',
    'schedule:view',
    'schedule:create',
    'schedule:update',
    'schedule:manage_conflicts',
    'attendance:view',
    'attendance:record',
    'attendance:edit',
    'attendance:export',
    'attendance:manage_signatures',
    'materials:view',
    'materials:create',
    'materials:update',
    'materials:delete',
    'assignments:view',
    'assignments:create',
    'assignments:update',
    'assignments:delete',
    'assignments:grade',
    'messages:view',
    'messages:create',
    'messages:delete',
    'messages:manage_announcements',
    'notifications:view',
    'notifications:manage',
    'notifications:send',
    'semesters:view',
    'semesters:create',
    'semesters:update',
    'semesters:delete',
    'holidays:view',
    'holidays:create',
    'holidays:update',
    'holidays:delete',
    'reports:view',
    'reports:create',
    'reports:export',
    'reports:ai_generate',
    'audit:view',
    'audit:export',
    'ai:suggest_schedule',
    'ai:detect_conflicts',
    'ai:predict_evasion',
    'ai:generate_report',
  ],

  [Role.PROFESSOR]: [
    'org:view',
    'users:view',
    'teachers:view',
    'teachers:update',
    'students:view',
    'courses:view',
    'subjects:view',
    'rooms:view',
    'classes:view',
    'classes:update',
    'schedule:view',
    'attendance:view',
    'attendance:record',
    'attendance:edit',
    'materials:view',
    'materials:create',
    'materials:update',
    'materials:delete',
    'materials:download',
    'assignments:view',
    'assignments:create',
    'assignments:update',
    'assignments:grade',
    'messages:view',
    'messages:create',
    'notifications:view',
    'semesters:view',
    'holidays:view',
    'reports:view',
    'reports:create',
    'reports:export',
  ],

  [Role.STUDENT]: [
    'org:view',
    'users:view',
    'courses:view',
    'subjects:view',
    'classes:view',
    'schedule:view',
    'attendance:view',
    'materials:view',
    'materials:download',
    'assignments:view',
    'assignments:submit',
    'messages:view',
    'messages:create',
    'notifications:view',
    'semesters:view',
    'holidays:view',
    'reports:view',
  ],

  [Role.ASSISTANT]: [
    'org:view',
    'users:view',
    'teachers:view',
    'students:view',
    'students:import',
    'students:export',
    'courses:view',
    'subjects:view',
    'rooms:view',
    'classes:view',
    'schedule:view',
    'attendance:view',
    'attendance:record',
    'materials:view',
    'materials:create',
    'materials:update',
    'materials:download',
    'assignments:view',
    'messages:view',
    'messages:create',
    'notifications:view',
    'notifications:send',
    'semesters:view',
    'holidays:view',
    'reports:view',
    'reports:create',
    'reports:export',
  ],
};

// -----------------------------------------------------------------------------
// Weekday Labels (Portuguese)
// -----------------------------------------------------------------------------

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  [Weekday.MONDAY]: 'Segunda-feira',
  [Weekday.TUESDAY]: 'Terça-feira',
  [Weekday.WEDNESDAY]: 'Quarta-feira',
  [Weekday.THURSDAY]: 'Quinta-feira',
  [Weekday.FRIDAY]: 'Sexta-feira',
  [Weekday.SATURDAY]: 'Sábado',
  [Weekday.SUNDAY]: 'Domingo',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  [Weekday.MONDAY]: 'Seg',
  [Weekday.TUESDAY]: 'Ter',
  [Weekday.WEDNESDAY]: 'Qua',
  [Weekday.THURSDAY]: 'Qui',
  [Weekday.FRIDAY]: 'Sex',
  [Weekday.SATURDAY]: 'Sáb',
  [Weekday.SUNDAY]: 'Dom',
};

export const WEEKDAY_MINIMAL: Record<Weekday, string> = {
  [Weekday.MONDAY]: 'S',
  [Weekday.TUESDAY]: 'T',
  [Weekday.WEDNESDAY]: 'Q',
  [Weekday.THURSDAY]: 'Q',
  [Weekday.FRIDAY]: 'S',
  [Weekday.SATURDAY]: 'S',
  [Weekday.SUNDAY]: 'D',
};

// -----------------------------------------------------------------------------
// Time Slots (06:00 - 23:00 in 30-minute intervals)
// -----------------------------------------------------------------------------

export const TIME_SLOTS: Array<{ value: string; label: string }> = (() => {
  const slots: Array<{ value: string; label: string }> = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push({
      value: `${String(hour).padStart(2, '0')}:00`,
      label: `${String(hour).padStart(2, '0')}:00`,
    });
    slots.push({
      value: `${String(hour).padStart(2, '0')}:30`,
      label: `${String(hour).padStart(2, '0')}:30`,
    });
  }
  slots.push({
    value: '23:00',
    label: '23:00',
  });
  return slots;
})();

export const CLASS_SHIFT_RANGES = {
  morning: { start: '06:00', end: '12:00', label: 'Matutino' },
  afternoon: { start: '12:00', end: '18:00', label: 'Vespertino' },
  night: { start: '18:00', end: '23:00', label: 'Noturno' },
} as const;

// -----------------------------------------------------------------------------
// Status Labels
// -----------------------------------------------------------------------------

export const CLASS_STATUS_LABELS: Record<ClassSessionStatus, string> = {
  [ClassSessionStatus.SCHEDULED]: 'Agendada',
  [ClassSessionStatus.IN_PROGRESS]: 'Em Andamento',
  [ClassSessionStatus.COMPLETED]: 'Concluída',
  [ClassSessionStatus.CANCELLED]: 'Cancelada',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Presente',
  [AttendanceStatus.ABSENT]: 'Ausente',
  [AttendanceStatus.LATE]: 'Atrasado',
  [AttendanceStatus.EXCUSED]: 'Justificado',
};

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-green-500',
  [AttendanceStatus.ABSENT]: 'bg-red-500',
  [AttendanceStatus.LATE]: 'bg-yellow-500',
  [AttendanceStatus.EXCUSED]: 'bg-blue-500',
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Administrador',
  [Role.COORDINATOR]: 'Coordenador',
  [Role.PROFESSOR]: 'Professor',
  [Role.STUDENT]: 'Aluno',
  [Role.ASSISTANT]: 'Assistente',
};

export const SEMESTER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  UPCOMING: 'Próximo',
};

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  DROPPED: 'Trancado',
  COMPLETED: 'Concluído',
  FAILED: 'Reprovado',
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  SUBMITTED: 'Entregue',
  GRADED: 'Avaliado',
  RETURNED: 'Devolvido',
};

// -----------------------------------------------------------------------------
// File Upload Limits & Allowed Types
// -----------------------------------------------------------------------------

export const FILE_SIZE_LIMITS = {
  avatar: 2 * 1024 * 1024, // 2MB
  material: 50 * 1024 * 1024, // 50MB
  assignment: 25 * 1024 * 1024, // 25MB
  message_attachment: 10 * 1024 * 1024, // 10MB
  report: 100 * 1024 * 1024, // 100MB
  general: 10 * 1024 * 1024, // 10MB
  max: 500 * 1024 * 1024, // 500MB (absolute max)
} as const;

export const FILE_SIZE_LABELS: Record<keyof typeof FILE_SIZE_LIMITS, string> = {
  avatar: '2 MB',
  material: '50 MB',
  assignment: '25 MB',
  message_attachment: '10 MB',
  report: '100 MB',
  general: '10 MB',
  max: '500 MB',
};

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.odt'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
  audio: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.wma'],
  video: ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'],
  archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  all: [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.odt',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.mp3', '.wav', '.ogg', '.mp4', '.avi', '.mov', '.webm',
    '.zip', '.rar', '.7z',
  ],
};

export const MATERIAL_TYPE_EXTENSIONS: Record<MaterialType, string[]> = {
  [MaterialType.PDF]: ['.pdf'],
  [MaterialType.DOCX]: ['.doc', '.docx', '.odt', '.txt'],
  [MaterialType.XLSX]: ['.xls', '.xlsx', '.csv'],
  [MaterialType.PPTX]: ['.ppt', '.pptx'],
  [MaterialType.MP3]: ['.mp3', '.wav', '.ogg', '.aac', '.flac'],
  [MaterialType.MP4]: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  [MaterialType.IMAGE]: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  [MaterialType.ZIP]: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  [MaterialType.OTHER]: [],
};

// -----------------------------------------------------------------------------
// Notification Preferences
// -----------------------------------------------------------------------------

export const NOTIFICATION_PREFERENCES = [
  { type: 'INFO', channel: 'in_app', enabled: true, label: 'Notificações informativas no app' },
  { type: 'INFO', channel: 'email', enabled: false, label: 'Notificações informativas por e-mail' },
  { type: 'WARNING', channel: 'in_app', enabled: true, label: 'Alertas de aviso no app' },
  { type: 'WARNING', channel: 'email', enabled: true, label: 'Alertas de aviso por e-mail' },
  { type: 'WARNING', channel: 'push', enabled: true, label: 'Alertas de aviso por push' },
  { type: 'ERROR', channel: 'in_app', enabled: true, label: 'Erros no app' },
  { type: 'ERROR', channel: 'email', enabled: true, label: 'Erros por e-mail' },
  { type: 'ERROR', channel: 'push', enabled: true, label: 'Erros por push' },
  { type: 'SUCCESS', channel: 'in_app', enabled: true, label: 'Confirmações no app' },
  { type: 'SUCCESS', channel: 'email', enabled: false, label: 'Confirmações por e-mail' },
  { type: 'MESSAGE_NEW', channel: 'in_app', enabled: true, label: 'Novas mensagens no app' },
  { type: 'MESSAGE_NEW', channel: 'push', enabled: true, label: 'Novas mensagens por push' },
  { type: 'ASSIGNMENT_DUE', channel: 'in_app', enabled: true, label: 'Prazo de atividades no app' },
  { type: 'ASSIGNMENT_DUE', channel: 'email', enabled: true, label: 'Prazo de atividades por e-mail' },
  { type: 'GRADE_PUBLISHED', channel: 'in_app', enabled: true, label: 'Notas publicadas no app' },
  { type: 'GRADE_PUBLISHED', channel: 'email', enabled: true, label: 'Notas publicadas por e-mail' },
  { type: 'ATTENDANCE_ALERT', channel: 'in_app', enabled: true, label: 'Alertas de frequência no app' },
  { type: 'ATTENDANCE_ALERT', channel: 'email', enabled: true, label: 'Alertas de frequência por e-mail' },
] as const;

// -----------------------------------------------------------------------------
// Dashboard KPI Configuration per Role
// -----------------------------------------------------------------------------

export const DASHBOARD_KPI_CONFIG = {
  [Role.SUPER_ADMIN]: [
    { id: 'total_orgs', label: 'Organizações', icon: 'Building2', color: 'blue', module: 'organizations' },
    { id: 'total_users', label: 'Usuários Totais', icon: 'Users', color: 'purple', module: 'users' },
    { id: 'total_teachers', label: 'Professores', icon: 'GraduationCap', color: 'green', module: 'teachers' },
    { id: 'total_students', label: 'Alunos', icon: 'BookOpen', color: 'orange', module: 'students' },
    { id: 'active_classes', label: 'Turmas Ativas', icon: 'Calendar', color: 'indigo', module: 'classes' },
    { id: 'system_health', label: 'Saúde do Sistema', icon: 'Activity', color: 'emerald', module: 'system' },
  ],

  [Role.COORDINATOR]: [
    { id: 'total_teachers', label: 'Professores', icon: 'GraduationCap', color: 'blue', module: 'teachers' },
    { id: 'total_students', label: 'Alunos', icon: 'BookOpen', color: 'green', module: 'students' },
    { id: 'total_classes', label: 'Turmas', icon: 'Calendar', color: 'purple', module: 'classes' },
    { id: 'avg_attendance', label: 'Frequência Média', icon: 'CheckCircle', color: 'emerald', module: 'attendance' },
    { id: 'pending_assignments', label: 'Atividades Pendentes', icon: 'FileText', color: 'orange', module: 'assignments' },
    { id: 'evasion_risk', label: 'Risco de Evasão', icon: 'AlertTriangle', color: 'red', module: 'analytics' },
    { id: 'room_utilization', label: 'Utilização de Salas', icon: 'DoorOpen', color: 'indigo', module: 'rooms' },
    { id: 'total_rooms', label: 'Salas', icon: 'Building', color: 'teal', module: 'rooms' },
  ],

  [Role.PROFESSOR]: [
    { id: 'total_classes', label: 'Minhas Turmas', icon: 'Calendar', color: 'blue', module: 'classes' },
    { id: 'total_students', label: 'Alunos', icon: 'BookOpen', color: 'green', module: 'students' },
    { id: 'today_sessions', label: 'Aulas Hoje', icon: 'Clock', color: 'purple', module: 'sessions' },
    { id: 'pending_grading', label: 'Avaliações Pendentes', icon: 'PenTool', color: 'orange', module: 'assignments' },
    { id: 'avg_attendance', label: 'Frequência Média', icon: 'CheckCircle', color: 'emerald', module: 'attendance' },
    { id: 'upcoming_assignments', label: 'Atividades a Entregar', icon: 'FileText', color: 'indigo', module: 'assignments' },
  ],

  [Role.STUDENT]: [
    { id: 'total_classes', label: 'Minhas Disciplinas', icon: 'Calendar', color: 'blue', module: 'classes' },
    { id: 'today_sessions', label: 'Aulas Hoje', icon: 'Clock', color: 'purple', module: 'sessions' },
    { id: 'pending_assignments', label: 'Atividades Pendentes', icon: 'FileText', color: 'orange', module: 'assignments' },
    { id: 'attendance_pct', label: 'Frequência', icon: 'CheckCircle', color: 'emerald', module: 'attendance' },
    { id: 'overall_gpa', label: 'CR Geral', icon: 'Award', color: 'yellow', module: 'grades' },
    { id: 'unread_messages', label: 'Mensagens', icon: 'MessageCircle', color: 'indigo', module: 'messages' },
  ],

  [Role.ASSISTANT]: [
    { id: 'total_classes', label: 'Turmas', icon: 'Calendar', color: 'blue', module: 'classes' },
    { id: 'today_sessions', label: 'Aulas Hoje', icon: 'Clock', color: 'purple', module: 'sessions' },
    { id: 'pending_tasks', label: 'Tarefas Pendentes', icon: 'ListTodo', color: 'orange', module: 'tasks' },
    { id: 'attendance_pending', label: 'Frequências Pendentes', icon: 'Clipboard', color: 'red', module: 'attendance' },
  ],
} as const;

// -----------------------------------------------------------------------------
// Sidebar Menu Items per Role
// -----------------------------------------------------------------------------

export const SIDEBAR_MENU_ITEMS = {
  common: [
    { id: 'dashboard', label: 'Painel', icon: 'LayoutDashboard', href: '/' },
    { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', href: '/messages', badge: 'unread' },
    { id: 'notifications', label: 'Notificações', icon: 'Bell', href: '/notifications', badge: 'unread' },
  ],

  [Role.SUPER_ADMIN]: [
    { id: 'dashboard', label: 'Painel', icon: 'LayoutDashboard', href: '/' },
    { id: 'organizations', label: 'Organizações', icon: 'Building2', href: '/organizations' },
    { id: 'users', label: 'Usuários', icon: 'Users', href: '/users' },
    { id: 'divider_system', label: 'Sistema', isDivider: true },
    { id: 'system_settings', label: 'Configurações', icon: 'Settings', href: '/settings' },
    { id: 'audit_logs', label: 'Logs de Auditoria', icon: 'FileSearch', href: '/audit' },
    { id: 'system_health', label: 'Saúde do Sistema', icon: 'Activity', href: '/system/health' },
    { id: 'divider_support', label: 'Suporte', isDivider: true },
    { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', href: '/messages', badge: 'unread' },
    { id: 'notifications', label: 'Notificações', icon: 'Bell', href: '/notifications', badge: 'unread' },
  ],

  [Role.COORDINATOR]: [
    { id: 'dashboard', label: 'Painel', icon: 'LayoutDashboard', href: '/' },
    { id: 'divider_academic', label: 'Acadêmico', isDivider: true },
    { id: 'teachers', label: 'Professores', icon: 'GraduationCap', href: '/teachers' },
    { id: 'students', label: 'Alunos', icon: 'BookOpen', href: '/students' },
    { id: 'courses', label: 'Cursos', icon: 'Library', href: '/courses' },
    { id: 'subjects', label: 'Disciplinas', icon: 'BookMarked', href: '/subjects' },
    { id: 'divider_schedule', label: 'Agenda', isDivider: true },
    { id: 'schedule', label: 'Grade Horária', icon: 'CalendarDays', href: '/schedule' },
    { id: 'classes', label: 'Turmas', icon: 'UsersRound', href: '/classes' },
    { id: 'rooms', label: 'Salas', icon: 'DoorOpen', href: '/rooms' },
    { id: 'semesters', label: 'Semestres', icon: 'CalendarRange', href: '/semesters' },
    { id: 'holidays', label: 'Feriados', icon: 'PartyPopper', href: '/holidays' },
    { id: 'divider_tracking', label: 'Acompanhamento', isDivider: true },
    { id: 'attendance', label: 'Frequência', icon: 'ClipboardCheck', href: '/attendance' },
    { id: 'assignments', label: 'Atividades', icon: 'FileText', href: '/assignments' },
    { id: 'materials', label: 'Materiais', icon: 'FolderOpen', href: '/materials' },
    { id: 'divider_analytics', label: 'Análise', isDivider: true },
    { id: 'reports', label: 'Relatórios', icon: 'BarChart3', href: '/reports' },
    { id: 'evasion', label: 'Evasão', icon: 'AlertTriangle', href: '/evasion' },
    { id: 'audit', label: 'Auditoria', icon: 'FileSearch', href: '/audit' },
    { id: 'divider_communication', label: 'Comunicação', isDivider: true },
    { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', href: '/messages', badge: 'unread' },
    { id: 'notifications', label: 'Notificações', icon: 'Bell', href: '/notifications', badge: 'unread' },
    { id: 'announcements', label: 'Comunicados', icon: 'Megaphone', href: '/announcements' },
    { id: 'divider_settings', label: 'Configurações', isDivider: true },
    { id: 'settings', label: 'Configurações', icon: 'Settings', href: '/settings' },
  ],

  [Role.PROFESSOR]: [
    { id: 'dashboard', label: 'Painel', icon: 'LayoutDashboard', href: '/' },
    { id: 'divider_classes', label: 'Minhas Turmas', isDivider: true },
    { id: 'my_classes', label: 'Turmas', icon: 'UsersRound', href: '/professor/classes' },
    { id: 'schedule', label: 'Grade Horária', icon: 'CalendarDays', href: '/professor/schedule' },
    { id: 'divider_teaching', label: 'Ensino', isDivider: true },
    { id: 'attendance', label: 'Frequência', icon: 'ClipboardCheck', href: '/professor/attendance' },
    { id: 'materials', label: 'Materiais', icon: 'FolderOpen', href: '/professor/materials' },
    { id: 'assignments', label: 'Atividades', icon: 'FileText', href: '/professor/assignments' },
    { id: 'grading', label: 'Avaliações', icon: 'PenTool', href: '/professor/grading' },
    { id: 'divider_communication', label: 'Comunicação', isDivider: true },
    { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', href: '/messages', badge: 'unread' },
    { id: 'notifications', label: 'Notificações', icon: 'Bell', href: '/notifications', badge: 'unread' },
    { id: 'divider_info', label: 'Informações', isDivider: true },
    { id: 'students', label: 'Alunos', icon: 'BookOpen', href: '/professor/students' },
    { id: 'reports', label: 'Relatórios', icon: 'BarChart3', href: '/professor/reports' },
  ],

  [Role.STUDENT]: [
    { id: 'dashboard', label: 'Painel', icon: 'LayoutDashboard', href: '/' },
    { id: 'divider_academic', label: 'Acadêmico', isDivider: true },
    { id: 'my_classes', label: 'Minhas Disciplinas', icon: 'BookOpen', href: '/student/classes' },
    { id: 'schedule', label: 'Grade Horária', icon: 'CalendarDays', href: '/student/schedule' },
    { id: 'attendance', label: 'Frequência', icon: 'ClipboardCheck', href: '/student/attendance' },
    { id: 'grades', label: 'Notas', icon: 'Award', href: '/student/grades' },
    { id: 'divider_learning', label: 'Aprendizado', isDivider: true },
    { id: 'materials', label: 'Materiais', icon: 'FolderOpen', href: '/student/materials' },
    { id: 'assignments', label: 'Atividades', icon: 'FileText', href: '/student/assignments' },
    { id: 'divider_communication', label: 'Comunicação', isDivider: true },
    { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', href: '/messages', badge: 'unread' },
    { id: 'notifications', label: 'Notificações', icon: 'Bell', href: '/notifications', badge: 'unread' },
  ],

  [Role.ASSISTANT]: [
    { id: 'dashboard', label: 'Painel', icon: 'LayoutDashboard', href: '/' },
    { id: 'divider_academic', label: 'Acadêmico', isDivider: true },
    { id: 'students', label: 'Alunos', icon: 'BookOpen', href: '/assistant/students' },
    { id: 'teachers', label: 'Professores', icon: 'GraduationCap', href: '/assistant/teachers' },
    { id: 'classes', label: 'Turmas', icon: 'UsersRound', href: '/assistant/classes' },
    { id: 'schedule', label: 'Grade Horária', icon: 'CalendarDays', href: '/assistant/schedule' },
    { id: 'divider_tasks', label: 'Tarefas', isDivider: true },
    { id: 'attendance', label: 'Frequência', icon: 'ClipboardCheck', href: '/assistant/attendance' },
    { id: 'materials', label: 'Materiais', icon: 'FolderOpen', href: '/assistant/materials' },
    { id: 'reports', label: 'Relatórios', icon: 'BarChart3', href: '/assistant/reports' },
    { id: 'divider_communication', label: 'Comunicação', isDivider: true },
    { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', href: '/messages', badge: 'unread' },
    { id: 'notifications', label: 'Notificações', icon: 'Bell', href: '/notifications', badge: 'unread' },
  ],
} as const;

// -----------------------------------------------------------------------------
// Navigation Routes
// -----------------------------------------------------------------------------

export const NAVIGATION_ROUTES = {
  // Public
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  register: '/register',

  // Dashboard
  dashboard: '/',

  // Organization
  organizations: '/organizations',
  organizationDetail: (id: string) => `/organizations/${id}`,
  organizationEdit: (id: string) => `/organizations/${id}/edit`,

  // Users & Profiles
  users: '/users',
  userDetail: (id: string) => `/users/${id}`,
  userCreate: '/users/create',
  userEdit: (id: string) => `/users/${id}/edit`,
  profile: '/profile',
  profileEdit: '/profile/edit',

  // Teachers
  teachers: '/teachers',
  teacherDetail: (id: string) => `/teachers/${id}`,
  teacherCreate: '/teachers/create',
  teacherEdit: (id: string) => `/teachers/${id}/edit`,
  teacherAvailability: (id: string) => `/teachers/${id}/availability`,
  teacherSchedule: (id: string) => `/teachers/${id}/schedule`,

  // Students
  students: '/students',
  studentDetail: (id: string) => `/students/${id}`,
  studentCreate: '/students/create',
  studentEdit: (id: string) => `/students/${id}/edit`,

  // Courses & Subjects
  courses: '/courses',
  courseDetail: (id: string) => `/courses/${id}`,
  courseCreate: '/courses/create',
  courseEdit: (id: string) => `/courses/${id}/edit`,
  subjects: '/subjects',
  subjectDetail: (id: string) => `/subjects/${id}`,
  subjectCreate: '/subjects/create',
  subjectEdit: (id: string) => `/subjects/${id}/edit`,

  // Rooms
  rooms: '/rooms',
  roomDetail: (id: string) => `/rooms/${id}`,
  roomCreate: '/rooms/create',
  roomEdit: (id: string) => `/rooms/${id}/edit`,

  // Classes & Schedule
  classes: '/classes',
  classDetail: (id: string) => `/classes/${id}`,
  classCreate: '/classes/create',
  classEdit: (id: string) => `/classes/${id}/edit`,
  schedule: '/schedule',

  // Attendance
  attendance: '/attendance',
  attendanceSession: (sessionId: string) => `/attendance/${sessionId}`,

  // Materials
  materials: '/materials',
  materialDetail: (id: string) => `/materials/${id}`,
  materialUpload: '/materials/upload',

  // Assignments
  assignments: '/assignments',
  assignmentDetail: (id: string) => `/assignments/${id}`,
  assignmentCreate: '/assignments/create',
  assignmentEdit: (id: string) => `/assignments/${id}/edit`,

  // Messages
  messages: '/messages',
  conversation: (id: string) => `/messages/${id}`,

  // Notifications
  notifications: '/notifications',

  // Announcements
  announcements: '/announcements',
  announcementCreate: '/announcements/create',

  // Semesters
  semesters: '/semesters',
  semesterCreate: '/semesters/create',
  semesterEdit: (id: string) => `/semesters/${id}/edit`,

  // Holidays
  holidays: '/holidays',
  holidayCreate: '/holidays/create',

  // Reports
  reports: '/reports',
  reportDetail: (id: string) => `/reports/${id}`,
  reportGenerate: '/reports/generate',

  // Audit
  audit: '/audit',

  // Evasion
  evasion: '/evasion',

  // Settings
  settings: '/settings',
  settingsGeneral: '/settings/general',
  settingsNotifications: '/settings/notifications',
  settingsSecurity: '/settings/security',
  settingsAppearance: '/settings/appearance',

  // Professor specific
  professor: {
    classes: '/professor/classes',
    schedule: '/professor/schedule',
    attendance: '/professor/attendance',
    materials: '/professor/materials',
    assignments: '/professor/assignments',
    grading: '/professor/grading',
    students: '/professor/students',
    reports: '/professor/reports',
  },

  // Student specific
  student: {
    classes: '/student/classes',
    schedule: '/student/schedule',
    attendance: '/student/attendance',
    grades: '/student/grades',
    materials: '/student/materials',
    assignments: '/student/assignments',
  },

  // Assistant specific
  assistant: {
    students: '/assistant/students',
    teachers: '/assistant/teachers',
    classes: '/assistant/classes',
    schedule: '/assistant/schedule',
    attendance: '/assistant/attendance',
    materials: '/assistant/materials',
    reports: '/assistant/reports',
  },
} as const;

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

export const API_ROUTES = {
  // Auth
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    me: '/api/auth/me',
  },

  // Organizations
  organizations: {
    list: '/api/organizations',
    get: (id: string) => `/api/organizations/${id}`,
    create: '/api/organizations',
    update: (id: string) => `/api/organizations/${id}`,
    delete: (id: string) => `/api/organizations/${id}`,
  },

  // Users & Profiles
  users: {
    list: '/api/users',
    get: (id: string) => `/api/users/${id}`,
    create: '/api/users',
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
    import: '/api/users/import',
    export: '/api/users/export',
    profile: '/api/profile',
    updateProfile: '/api/profile',
  },

  // Teachers
  teachers: {
    list: '/api/teachers',
    get: (id: string) => `/api/teachers/${id}`,
    create: '/api/teachers',
    update: (id: string) => `/api/teachers/${id}`,
    delete: (id: string) => `/api/teachers/${id}`,
    availability: {
      list: (teacherId: string) => `/api/teachers/${teacherId}/availability`,
      create: (teacherId: string) => `/api/teachers/${teacherId}/availability`,
      update: (teacherId: string) => `/api/teachers/${teacherId}/availability/:id`,
      delete: (teacherId: string) => `/api/teachers/${teacherId}/availability/:id`,
    },
    blocks: {
      list: (teacherId: string) => `/api/teachers/${teacherId}/blocks`,
      create: (teacherId: string) => `/api/teachers/${teacherId}/blocks`,
      update: (teacherId: string) => `/api/teachers/${teacherId}/blocks/:id`,
      delete: (teacherId: string) => `/api/teachers/${teacherId}/blocks/:id`,
    },
    schedule: (teacherId: string) => `/api/teachers/${teacherId}/schedule`,
  },

  // Students
  students: {
    list: '/api/students',
    get: (id: string) => `/api/students/${id}`,
    create: '/api/students',
    update: (id: string) => `/api/students/${id}`,
    delete: (id: string) => `/api/students/${id}`,
    import: '/api/students/import',
    export: '/api/students/export',
  },

  // Courses
  courses: {
    list: '/api/courses',
    get: (id: string) => `/api/courses/${id}`,
    create: '/api/courses',
    update: (id: string) => `/api/courses/${id}`,
    delete: (id: string) => `/api/courses/${id}`,
  },

  // Subjects
  subjects: {
    list: '/api/subjects',
    get: (id: string) => `/api/subjects/${id}`,
    create: '/api/subjects',
    update: (id: string) => `/api/subjects/${id}`,
    delete: (id: string) => `/api/subjects/${id}`,
  },

  // Rooms
  rooms: {
    list: '/api/rooms',
    get: (id: string) => `/api/rooms/${id}`,
    create: '/api/rooms',
    update: (id: string) => `/api/rooms/${id}`,
    delete: (id: string) => `/api/rooms/${id}`,
    schedule: (id: string) => `/api/rooms/${id}/schedule`,
  },

  // Semesters
  semesters: {
    list: '/api/semesters',
    get: (id: string) => `/api/semesters/${id}`,
    create: '/api/semesters',
    update: (id: string) => `/api/semesters/${id}`,
    delete: (id: string) => `/api/semesters/${id}`,
    setCurrent: (id: string) => `/api/semesters/${id}/set-current`,
  },

  // Holidays
  holidays: {
    list: '/api/holidays',
    get: (id: string) => `/api/holidays/${id}`,
    create: '/api/holidays',
    update: (id: string) => `/api/holidays/${id}`,
    delete: (id: string) => `/api/holidays/${id}`,
  },

  // Classes
  classes: {
    list: '/api/classes',
    get: (id: string) => `/api/classes/${id}`,
    create: '/api/classes',
    update: (id: string) => `/api/classes/${id}`,
    delete: (id: string) => `/api/classes/${id}`,
    enrollments: (classId: string) => `/api/classes/${classId}/enrollments`,
    addEnrollment: (classId: string) => `/api/classes/${classId}/enrollments`,
    removeEnrollment: (classId: string, enrollmentId: string) =>
      `/api/classes/${classId}/enrollments/${enrollmentId}`,
  },

  // Class Sessions
  sessions: {
    list: (classId: string) => `/api/classes/${classId}/sessions`,
    get: (classId: string, sessionId: string) => `/api/classes/${classId}/sessions/${sessionId}`,
    create: (classId: string) => `/api/classes/${classId}/sessions`,
    update: (classId: string, sessionId: string) => `/api/classes/${classId}/sessions/${sessionId}`,
    open: (classId: string, sessionId: string) => `/api/classes/${classId}/sessions/${sessionId}/open`,
    close: (classId: string, sessionId: string) => `/api/classes/${classId}/sessions/${sessionId}/close`,
  },

  // Schedule
  schedule: {
    get: '/api/schedule',
    generate: '/api/schedule/generate',
    conflicts: '/api/schedule/conflicts',
    aiSuggest: '/api/schedule/ai-suggest',
  },

  // Attendance
  attendance: {
    list: '/api/attendance',
    getBySession: (sessionId: string) => `/api/attendance/session/${sessionId}`,
    record: '/api/attendance/record',
    bulkRecord: '/api/attendance/bulk',
    update: (id: string) => `/api/attendance/${id}`,
    summary: (enrollmentId: string) => `/api/attendance/summary/${enrollmentId}`,
    signature: {
      sign: '/api/attendance/signature',
      verify: (sessionId: string) => `/api/attendance/signature/${sessionId}/verify`,
    },
  },

  // Materials
  materials: {
    list: '/api/materials',
    get: (id: string) => `/api/materials/${id}`,
    upload: '/api/materials/upload',
    update: (id: string) => `/api/materials/${id}`,
    delete: (id: string) => `/api/materials/${id}`,
    download: (id: string) => `/api/materials/${id}/download`,
  },

  // Assignments
  assignments: {
    list: '/api/assignments',
    get: (id: string) => `/api/assignments/${id}`,
    create: '/api/assignments',
    update: (id: string) => `/api/assignments/${id}`,
    delete: (id: string) => `/api/assignments/${id}`,
    submissions: (assignmentId: string) => `/api/assignments/${assignmentId}/submissions`,
    submit: (assignmentId: string) => `/api/assignments/${assignmentId}/submit`,
    grade: (assignmentId: string, submissionId: string) =>
      `/api/assignments/${assignmentId}/submissions/${submissionId}/grade`,
  },

  // Messages / Conversations
  messages: {
    conversations: '/api/conversations',
    getConversation: (id: string) => `/api/conversations/${id}`,
    createConversation: '/api/conversations',
    messages: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
    sendMessage: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
    markRead: (conversationId: string) => `/api/conversations/${conversationId}/read`,
    deleteMessage: (conversationId: string, messageId: string) =>
      `/api/conversations/${conversationId}/messages/${messageId}`,
    announcements: '/api/announcements',
    createAnnouncement: '/api/announcements',
  },

  // Notifications
  notifications: {
    list: '/api/notifications',
    get: (id: string) => `/api/notifications/${id}`,
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
    delete: (id: string) => `/api/notifications/${id}`,
    preferences: '/api/notifications/preferences',
    updatePreferences: '/api/notifications/preferences',
    subscribe: '/api/notifications/subscribe',
  },

  // Reports
  reports: {
    list: '/api/reports',
    get: (id: string) => `/api/reports/${id}`,
    generate: '/api/reports/generate',
    download: (id: string) => `/api/reports/${id}/download`,
    aiGenerate: '/api/reports/ai-generate',
  },

  // Audit
  audit: {
    list: '/api/audit',
    export: '/api/audit/export',
  },

  // AI
  ai: {
    suggestSchedule: '/api/ai/suggest-schedule',
    detectConflicts: '/api/ai/detect-conflicts',
    predictEvasion: '/api/ai/predict-evasion',
    generateReport: '/api/ai/generate-report',
  },

  // Upload
  upload: {
    file: '/api/upload',
    image: '/api/upload/image',
    avatar: '/api/upload/avatar',
  },

  // Dashboard
  dashboard: {
    data: '/api/dashboard',
    kpis: '/api/dashboard/kpis',
    charts: '/api/dashboard/charts',
  },
} as const;

// -----------------------------------------------------------------------------
// General Application Constants
// -----------------------------------------------------------------------------

export const APP_NAME = 'ORKESTRANDO';
export const APP_DESCRIPTION = 'Sistema de Gestão Acadêmica Inteligente';
export const APP_VERSION = '1.0.0';
export const APP_DEFAULT_LOCALE = 'pt-BR';
export const APP_DEFAULT_TIMEZONE = 'America/Sao_Paulo';
export const APP_DEFAULT_CURRENCY = 'BRL';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_SEARCH_LENGTH = 2;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const JWT_ACCESS_TOKEN_EXPIRY = '15m';
export const JWT_REFRESH_TOKEN_EXPIRY = '7d';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;

export const ATTENDANCE_AUTO_CLOSE_MINUTES = 240; // 4 hours
export const ATTENDANCE_LATE_THRESHOLD_MINUTES = 15;
export const ATTENDANCE_MINIMUM_REQUIRED = 0.75; // 75%

export const MAX_CONCURRENT_SESSIONS = 3;
export const SESSION_TIMEOUT_MINUTES = 30;

export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
] as const;
