// =============================================================================
// ORKESTRANDO - Complete TypeScript Type Definitions
// =============================================================================

// ---- Enums & Literal Types ----

export type UserRole = 'admin' | 'coordinator' | 'teacher' | 'student'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified'
export type ClassStatus = 'active' | 'inactive' | 'completed' | 'cancelled'
export type EnrollmentStatus = 'active' | 'dropped' | 'completed' | 'suspended'
export type MessageStatus = 'sent' | 'read' | 'deleted'
export type AvailabilityStatus = 'pending' | 'approved' | 'rejected'
export type MaterialType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'mp3' | 'mp4' | 'image' | 'zip' | 'other'
export type NotificationType = 'info' | 'warning' | 'success' | 'error'
export type NotificationChannel = 'in_app' | 'email' | 'push'
export type AssignmentSubmissionStatus = 'pending' | 'submitted' | 'graded' | 'returned'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
export type RecurringPattern = 'weekly' | 'biweekly' | 'monthly'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0=Sunday
export type AuditAction =
  | 'login'
  | 'logout'
  | 'upload'
  | 'download'
  | 'create'
  | 'update'
  | 'delete'
  | 'signature'
  | 'attendance'
  | 'message'
  | 'enrollment'
  | 'schedule'

// ---- Base Types ----

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface TimestampRange {
  startDate: string
  endDate: string
}

// ---- Organization ----

export interface Organization extends BaseEntity {
  name: string
  slug: string
  logoUrl?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  phone?: string
  email?: string
  website?: string
  settings: Record<string, unknown>
  maxTeachers?: number
  maxStudents?: number
}

// ---- User & Profile ----

export interface User extends BaseEntity {
  email: string
  phone?: string
  passwordHash?: string
  emailVerified: boolean
  isActive: boolean
  lastLoginAt?: string
  authProvider: 'email' | 'google' | 'microsoft' | 'facebook'
  organizationId: string
}

export interface Profile extends BaseEntity {
  userId: string
  role: UserRole
  firstName: string
  lastName: string
  fullName: string
  avatarUrl?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  document?: string // CPF
  emergencyContact?: string
  emergencyPhone?: string
  bio?: string
  preferences: Record<string, unknown>
  organizationId: string
}

// ---- Teacher ----

export interface Teacher extends BaseEntity {
  profileId: string
  userId: string
  organizationId: string
  hireDate?: string
  contractType: 'full_time' | 'part_time' | 'freelancer'
  subjects: string[] // subject IDs
  maxWeeklyHours: number
  specialties?: string[]
  qualifications?: string
  salary?: number
  isActive: boolean
}

// ---- Student ----

export interface Student extends BaseEntity {
  profileId: string
  userId: string
  organizationId: string
  enrollmentNumber: string
  enrollmentDate: string
  courseLevel?: string
  semester: number
  overallGpa?: number
  totalCredits?: number
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  isActive: boolean
}

// ---- Coordinator ----

export interface Coordinator extends BaseEntity {
  profileId: string
  userId: string
  organizationId: string
  department?: string
  responsibilities?: string[]
  managedCourses: string[] // course IDs
  managedTeachers: string[] // teacher IDs
}

// ---- Course ----

export interface Course extends BaseEntity {
  organizationId: string
  name: string
  code: string
  description?: string
  durationHours: number
  totalCredits: number
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  modality: 'in_person' | 'online' | 'hybrid'
  tuitionFee?: number
  maxCapacity: number
  requirements?: string
  objectives?: string[]
  competencies?: string[]
  isActive: boolean
  imageUrl?: string
}

// ---- Subject ----

export interface Subject extends BaseEntity {
  organizationId: string
  name: string
  code: string
  description?: string
  courseIds: string[] // courses this subject belongs to
  workloadHours: number
  prerequisites?: string[] // subject IDs
  isActive: boolean
}

// ---- Room ----

export interface Room extends BaseEntity {
  organizationId: string
  name: string
  code: string
  capacity: number
  roomType: 'classroom' | 'lab' | 'auditorium' | 'gym' | 'library' | 'other'
  building?: string
  floor?: number
  hasProjector: boolean
  hasWhiteboard: boolean
  hasAudioSystem: boolean
  hasComputers: boolean
  wifiAvailable: boolean
  airConditioned: boolean
  accessibilityFeatures?: string[]
  isActive: boolean
}

// ---- Semester ----

export interface Semester extends BaseEntity {
  organizationId: string
  name: string
  year: number
  term: number // 1 or 2
  startDate: string
  endDate: string
  currentWeek?: number
  totalWeeks: number
  isActive: boolean
  holidays: string[] // holiday IDs
}

// ---- Teacher Availability ----

export interface TeacherAvailability extends BaseEntity {
  teacherId: string
  organizationId: string
  dayOfWeek: DayOfWeek
  startTime: string // HH:mm format
  endTime: string
  recurringPattern: RecurringPattern
  status: AvailabilityStatus
  validFrom?: string
  validUntil?: string
  notes?: string
}

// ---- Teacher Block ----

export interface TeacherBlock extends BaseEntity {
  teacherId: string
  organizationId: string
  blockType: 'vacation' | 'sick_leave' | 'personal' | 'conference' | 'other'
  startDate: string
  endDate: string
  reason?: string
  isApproved: boolean
  approvedBy?: string
}

// ---- Holiday ----

export interface Holiday extends BaseEntity {
  organizationId: string
  name: string
  date: string
  type: 'national' | 'state' | 'municipal' | 'institutional'
  isRecurring: boolean
  affectsClasses: boolean
}

// ---- Class (Turma) ----

export interface Class extends BaseEntity {
  organizationId: string
  courseId: string
  subjectId: string
  teacherId: string
  semesterId: string
  roomId?: string
  name: string
  code: string
  schedule: ClassSchedule
  maxCapacity: number
  currentEnrollment: number
  status: ClassStatus
  startDate: string
  endDate: string
  startTime: string // HH:mm
  endTime: string
  dayOfWeek: DayOfWeek
  description?: string
  syllabus?: string
  gradingCriteria?: GradingCriteria
}

export interface ClassSchedule {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  recurring: boolean
  recurrencePattern?: RecurringPattern
}

export interface GradingCriteria {
  attendanceWeight: number // 0-1
  participationWeight: number
  assignmentWeight: number
  examWeight: number
  passingGrade: number
  maxAbsences: number
}

// ---- Class Session ----

export interface ClassSession extends BaseEntity {
  classId: string
  teacherId: string
  roomId?: string
  date: string
  startTime: string
  endTime: string
  status: SessionStatus
  topic?: string
  description?: string
  materials?: string[] // material IDs
  attendanceRecorded: boolean
  notes?: string
  substituteTeacherId?: string
}

// ---- Enrollment ----

export interface Enrollment extends BaseEntity {
  studentId: string
  classId: string
  semesterId: string
  organizationId: string
  status: EnrollmentStatus
  enrollmentDate: string
  dropDate?: string
  completionDate?: string
  finalGrade?: number
  attendanceRate?: number
  notes?: string
}

// ---- Attendance ----

export interface Attendance extends BaseEntity {
  sessionId: string
  studentId: string
  classId: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  recordedBy: string // teacher ID
}

// ---- Attendance Signature (Digital) ----

export interface AttendanceSignature extends BaseEntity {
  attendanceId: string
  studentId: string
  signatureData: string // base64 or encrypted
  ipAddress?: string
  userAgent?: string
  geolocation?: GeoLocation
  verifiedAt?: string
  isValid: boolean
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
}

// ---- Material ----

export interface Material extends BaseEntity {
  organizationId: string
  classId: string
  uploadedById: string
  title: string
  description?: string
  materialType: MaterialType
  fileUrl: string
  fileSize: number // bytes
  fileName: string
  mimeType: string
  version: number
  currentVersionId: string
  downloadCount: number
  isPublished: boolean
  tags?: string[]
}

// ---- Material Version ----

export interface MaterialVersion extends BaseEntity {
  materialId: string
  fileUrl: string
  fileSize: number
  fileName: string
  mimeType: string
  version: number
  uploadedById: string
  changelog?: string
}

// ---- Assignment ----

export interface Assignment extends BaseEntity {
  organizationId: string
  classId: string
  createdById: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  maxGrade: number
  weight: number // 0-1
  materialType: 'text' | 'file' | 'link' | 'mixed'
  allowLateSubmission: boolean
  latePenalty?: number // percentage penalty
  maxFileSize?: number // bytes
  allowedExtensions?: string[]
  isPublished: boolean
  publishedAt?: string
}

// ---- Assignment Submission ----

export interface AssignmentSubmission extends BaseEntity {
  assignmentId: string
  studentId: string
  classId: string
  status: AssignmentSubmissionStatus
  content?: string // text response
  fileUrl?: string
  fileName?: string
  fileSize?: number
  submittedAt?: string
  grade?: number
  feedback?: string
  gradedById?: string
  gradedAt?: string
  lateDays?: number
  plagiarismScore?: number
}

// ---- Conversation ----

export interface Conversation extends BaseEntity {
  organizationId: string
  type: 'direct' | 'group' | 'class' | 'announcement'
  title?: string
  avatarUrl?: string
  participantIds: string[]
  lastMessageAt?: string
  lastMessagePreview?: string
  isArchived: boolean
  metadata?: Record<string, unknown>
}

// ---- Conversation Participant ----

export interface ConversationParticipant extends BaseEntity {
  conversationId: string
  userId: string
  role: 'admin' | 'member' | 'moderator'
  joinedAt: string
  lastReadAt?: string
  isMuted: boolean
  hasLeft: boolean
}

// ---- Message ----

export interface Message extends BaseEntity {
  conversationId: string
  senderId: string
  content: string
  status: MessageStatus
  messageType: 'text' | 'image' | 'file' | 'system' | 'audio'
  replyToId?: string
  isEdited: boolean
  editedAt?: string
  isPinned: boolean
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  emoji: string
  userIds: string[]
}

// ---- Message Attachment ----

export interface MessageAttachment extends BaseEntity {
  messageId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  width?: number
  height?: number
  thumbnailUrl?: string
}

// ---- Notification ----

export interface Notification extends BaseEntity {
  userId: string
  organizationId: string
  title: string
  message: string
  type: NotificationType
  channel: NotificationChannel[]
  isRead: boolean
  readAt?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
  expiresAt?: string
}

// ---- Report ----

export interface Report extends BaseEntity {
  organizationId: string
  createdById: string
  title: string
  description?: string
  reportType: 'attendance' | 'academic' | 'financial' | 'teacher' | 'custom'
  parameters: Record<string, unknown>
  dataUrl?: string
  format: 'pdf' | 'xlsx' | 'csv'
  status: 'pending' | 'generating' | 'completed' | 'failed'
  completedAt?: string
  fileSize?: number
}

// ---- Audit Log ----

export interface AuditLog extends BaseEntity {
  organizationId: string
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  previousValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

// ---- AI Related Types ----

export interface SchedulePreference {
  dayOfWeek: DayOfWeek
  preferredStartTime?: string
  preferredEndTime?: string
  avoidTimes?: string[]
  preferredRoomTypes?: string[]
  weight: number // 0-1 importance
}

export interface ScheduleSuggestion {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  roomId: string
  score: number
  reasons: string[]
  conflicts: string[]
}

export interface ConflictWarning {
  type: 'teacher_overlap' | 'room_overlap' | 'student_overlap' | 'holiday' | 'vacation' | 'availability'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedEntityId: string
  affectedEntityName: string
  suggestion?: string
}

export interface DropoutPrediction {
  studentId: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  factors: DropoutFactor[]
  recommendations: string[]
}

export interface DropoutFactor {
  factor: string
  weight: number
  description: string
  currentValue: number | string
  thresholdValue: number | string
}

export interface AcademicContext {
  classId?: string
  subjectName?: string
  topic?: string
  studentLevel?: string
  previousTopics?: string[]
  language?: string
}

export interface AttendanceAnalysis {
  classId: string
  className: string
  overallRate: number
  trend: 'improving' | 'stable' | 'declining'
  averagePerSession: number
  sessionsAnalyzed: number
  atRiskStudents: AtRiskStudent[]
  dayOfWeekBreakdown: DayOfWeekBreakdown[]
  recommendations: string[]
}

export interface AtRiskStudent {
  studentId: string
  studentName: string
  attendanceRate: number
  consecutiveAbsences: number
  riskLevel: 'low' | 'medium' | 'high'
  lastAttendanceDate?: string
}

export interface DayOfWeekBreakdown {
  dayOfWeek: DayOfWeek
  averageRate: number
  totalSessions: number
}

// ---- Conflict Engine Types ----

export interface ConflictResult {
  hasConflict: boolean
  conflicts: ConflictError[]
}

export interface ConflictError {
  type: 'teacher_overlap' | 'room_overlap' | 'student_overlap' | 'holiday' | 'vacation' | 'availability_mismatch'
  severity: 'error' | 'warning'
  message: string
  conflictingEntityId: string
  conflictingEntityName: string
  details?: Record<string, unknown>
}

export interface ConflictReport {
  valid: boolean
  errors: ConflictError[]
  warnings: ConflictWarning[]
}

export interface ValidationContext {
  existingSessions: ClassSession[]
  teacherAvailability: TeacherAvailability[]
  holidays: Holiday[]
  teacherBlocks: TeacherBlock[]
  existingEnrollments: Enrollment[]
}

export interface ValidationResult {
  valid: boolean
  errors: ConflictError[]
  warnings: ConflictWarning[]
}

// ---- Audit Filter ----

export interface AuditFilter {
  organizationId: string
  userId?: string
  action?: AuditAction
  entity?: string
  entityId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

// ---- API Request/Response Types ----

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  field?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Auth types
export interface AuthResponse {
  user: User
  profile: Profile
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

// Dashboard types
export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalCourses: number
  activeSessions: number
  todayAttendanceRate: number
  pendingAlerts: number
  upcomingClasses: UpcomingClass[]
}

export interface UpcomingClass {
  id: string
  className: string
  subjectName: string
  teacherName: string
  roomName: string
  startTime: string
  endTime: string
  date: string
}

// Calendar types
export interface CalendarEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  type: 'class' | 'exam' | 'holiday' | 'event' | 'block'
  color: string
  metadata?: Record<string, unknown>
}
