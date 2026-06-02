// =============================================================================
// ORKESTRANDO - Academic Management System
// Core TypeScript Types, Enums, and Interfaces
// =============================================================================

// -----------------------------------------------------------------------------
// Enums (matching Prisma schema)
// -----------------------------------------------------------------------------

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COORDINATOR = 'COORDINATOR',
  PROFESSOR = 'PROFESSOR',
  STUDENT = 'STUDENT',
  ASSISTANT = 'ASSISTANT',
}

export enum Weekday {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export enum MaterialType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  XLSX = 'XLSX',
  PPTX = 'PPTX',
  MP3 = 'MP3',
  MP4 = 'MP4',
  IMAGE = 'IMAGE',
  ZIP = 'ZIP',
  OTHER = 'OTHER',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum SignatureType {
  OPEN_CLASS = 'OPEN_CLASS',
  CLOSE_CLASS = 'CLOSE_CLASS',
  ATTENDANCE = 'ATTENDANCE',
}

export enum SemesterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UPCOMING = 'UPCOMING',
}

export enum ClassSessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  DROPPED = 'DROPPED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RoomType {
  LAB = 'LAB',
  CLASSROOM = 'CLASSROOM',
  AUDITORIUM = 'AUDITORIUM',
  STUDIO = 'STUDIO',
}

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  LOCAL = 'LOCAL',
  INSTITUTIONAL = 'INSTITUTIONAL',
}

export enum BlockReason {
  VACATION = 'VACATION',
  MEETING = 'MEETING',
  PERSONAL = 'PERSONAL',
  MEDICAL = 'MEDICAL',
  OTHER = 'OTHER',
}

export enum ReportType {
  FREQUENCY = 'FREQUENCY',
  HOURS = 'HOURS',
  EVASION = 'EVASION',
  ROOMS = 'ROOMS',
  TEACHERS = 'TEACHERS',
  MONTHLY = 'MONTHLY',
  SEMESTRAL = 'SEMESTRAL',
  CUSTOM = 'CUSTOM',
}

// -----------------------------------------------------------------------------
// Entity Interfaces (matching database schema)
// -----------------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  domain?: string | null;
  address?: string | null;
  phone?: string | null;
  email: string;
  website?: string | null;
  maxStudents?: number | null;
  timezone: string;
  locale: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  orgId: string;
  userId: string;
  role: Role;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  module: string;
  action: string;
  createdAt: Date;
}

export interface Teacher {
  id: string;
  profileId: string;
  orgId: string;
  employeeId?: string | null;
  department?: string | null;
  specialization?: string | null;
  bio?: string | null;
  hireDate?: Date | null;
  maxHoursPerWeek?: number | null;
  maxConcurrentClasses?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
  availabilities?: TeacherAvailability[];
  blocks?: TeacherBlock[];
  classes?: Class[];
}

export interface Student {
  id: string;
  profileId: string;
  orgId: string;
  studentId?: string | null;
  registrationNumber?: string | null;
  course?: string | null;
  semester?: number | null;
  shift?: string | null;
  enrollmentDate?: Date | null;
  expectedGraduation?: Date | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
  enrollments?: Enrollment[];
}

export interface Coordinator {
  id: string;
  profileId: string;
  orgId: string;
  department?: string | null;
  coordinatorLevel?: string | null;
  assignedCourses?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
}

export interface Course {
  id: string;
  orgId: string;
  name: string;
  code: string;
  description?: string | null;
  duration?: number | null;
  totalHours?: number | null;
  modality?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  orgId: string;
  courseId: string;
  code: string;
  name: string;
  description?: string | null;
  hoursPerWeek?: number | null;
  totalHours?: number | null;
  credits?: number | null;
  semester?: number | null;
  prerequisites?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  course?: Course;
  classes?: Class[];
}

export interface Room {
  id: string;
  orgId: string;
  name: string;
  code: string;
  type: RoomType;
  capacity?: number | null;
  building?: string | null;
  floor?: number | null;
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  hasComputers?: boolean;
  hasAirConditioning?: boolean;
  hasAudioSystem?: boolean;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Semester {
  id: string;
  orgId: string;
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  status: SemesterStatus;
  academicYear: number;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  orgId: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
}

export interface TeacherBlock {
  id: string;
  teacherId: string;
  orgId: string;
  startDate: Date;
  endDate: Date;
  reason: BlockReason;
  description?: string | null;
  isApproved: boolean;
  approvedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
}

export interface Holiday {
  id: string;
  orgId: string;
  name: string;
  date: Date;
  type: HolidayType;
  isRecurring: boolean;
  description?: string | null;
  createdAt: Date;
}

export interface Class {
  id: string;
  orgId: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  code: string;
  name?: string | null;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  vacancies?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  semester?: Semester;
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  sessions?: ClassSession[];
  enrollments?: Enrollment[];
}

export interface ClassSession {
  id: string;
  classId: string;
  orgId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: ClassSessionStatus;
  topic?: string | null;
  notes?: string | null;
  substituteTeacherId?: string | null;
  attendanceCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  classEntity?: Class;
  substituteTeacher?: Teacher;
  attendance?: Attendance[];
  signatures?: AttendanceSignature[];
  materials?: Material[];
}

export interface Enrollment {
  id: string;
  orgId: string;
  classId: string;
  studentId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  droppedAt?: Date | null;
  droppedReason?: string | null;
  finalGrade?: number | null;
  attendancePercentage?: number | null;
  createdAt: Date;
  updatedAt: Date;
  classEntity?: Class;
  student?: Student;
}

export interface Attendance {
  id: string;
  sessiondId: string;
  orgId: string;
  enrollmentId: string;
  status: AttendanceStatus;
  notes?: string | null;
  recordedBy?: string | null;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  enrollment?: Enrollment;
}

export interface AttendanceSignature {
  id: string;
  sessionId: string;
  orgId: string;
  profileId: string;
  type: SignatureType;
  signatureData: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  geolocation?: string | null;
  createdAt: Date;
  profile?: Profile;
}

export interface Material {
  id: string;
  orgId: string;
  sessionId?: string | null;
  classId: string;
  uploadedBy: string;
  title: string;
  description?: string | null;
  type: MaterialType;
  fileSize: number;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  isPublished: boolean;
  downloadCount?: number;
  createdAt: Date;
  updatedAt: Date;
  classEntity?: Class;
  session?: ClassSession;
}

export interface Assignment {
  id: string;
  orgId: string;
  classId: string;
  createdBy: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  dueDate: Date;
  maxGrade?: number | null;
  allowLateSubmission?: boolean;
  latePenalty?: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  classEntity?: Class;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  orgId: string;
  assignmentId: string;
  enrollmentId: string;
  status: AssignmentStatus;
  content?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  submittedAt?: Date | null;
  grade?: number | null;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignment?: Assignment;
  enrollment?: Enrollment;
}

export interface Conversation {
  id: string;
  orgId: string;
  type: ConversationType;
  title?: string | null;
  avatar?: string | null;
  lastMessageAt?: Date | null;
  lastMessagePreview?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  profileId: string;
  role?: string | null;
  joinedAt: Date;
  lastReadAt?: Date | null;
  isMuted: boolean;
  createdAt: Date;
  profile?: Profile;
  conversation?: Conversation;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  orgId: string;
  content: string;
  status: MessageStatus;
  replyToId?: string | null;
  isEdited: boolean;
  editedAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  conversation?: Conversation;
  sender?: Profile;
  attachments?: MessageAttachment[];
  replyTo?: Message;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  orgId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  message?: Message;
}

export interface Notification {
  id: string;
  orgId: string;
  profileId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  actionUrl?: string | null;
  createdAt: Date;
  profile?: Profile;
}

export interface AuditLog {
  id: string;
  orgId: string;
  profileId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  profile?: Profile;
}

export interface Report {
  id: string;
  orgId: string;
  generatedBy: string;
  type: ReportType;
  title: string;
  description?: string | null;
  parameters?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  completedAt?: Date | null;
  createdAt: Date;
  generatedByProfile?: Profile;
}

export interface SessionSettings {
  id: string;
  sessionId: string;
  orgId: string;
  requiresSignature: boolean;
  autoCloseMinutes?: number | null;
  gpsVerification: boolean;
  gpsRadius?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// -----------------------------------------------------------------------------
// Auth Types
// -----------------------------------------------------------------------------

export interface JwtPayload {
  sub: string;
  profileId: string;
  orgId: string;
  role: Role;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  profile: Profile;
  org: Organization;
  permissions: string[];
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

// -----------------------------------------------------------------------------
// Scheduling Types
// -----------------------------------------------------------------------------

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export interface ScheduleSlot {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  label?: string;
}

export interface ScheduleConflict {
  type: 'TEACHER_OVERLAP' | 'ROOM_OVERLAP' | 'STUDENT_OVERLAP';
  conflictingSlot: ScheduleSlot;
  existingSlot: ScheduleSlot;
  resourceId: string;
  resourceName: string;
  description: string;
}

export interface ConflictDetection {
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
  suggestedSlots: ScheduleSlot[];
}

// -----------------------------------------------------------------------------
// Dashboard & Analytics Types
// -----------------------------------------------------------------------------

export interface KPI {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  color?: string;
  description?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'radar';
  title: string;
  data: ChartDataPoint[];
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface SuperAdminDashboardData {
  totalOrganizations: number;
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  activeClasses: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  kpis: KPI[];
  charts: ChartConfig[];
  recentActivity: AuditLog[];
}

export interface CoordinatorDashboardData {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalRooms: number;
  averageAttendance: number;
  pendingAssignments: number;
  evasionRisk: number;
  kpis: KPI[];
  charts: ChartConfig[];
  upcomingSessions: ClassSession[];
  recentActivity: AuditLog[];
}

export interface ProfessorDashboardData {
  totalClasses: number;
  totalStudents: number;
  todaySessions: ClassSession[];
  pendingGrading: number;
  averageAttendance: number;
  upcomingAssignments: number;
  kpis: KPI[];
  charts: ChartConfig[];
  recentMessages: Message[];
  notifications: Notification[];
}

export interface StudentDashboardData {
  totalClasses: number;
  todaySessions: ClassSession[];
  pendingAssignments: number;
  attendancePercentage: number;
  overallGPA?: number;
  upcomingExams: Assignment[];
  kpis: KPI[];
  charts: ChartConfig[];
  recentMessages: Message[];
  notifications: Notification[];
}

export interface AssistantDashboardData {
  totalClasses: number;
  todaySessions: ClassSession[];
  pendingTasks: number;
  attendancePending: number;
  kpis: KPI[];
  charts: ChartConfig[];
}

export type DashboardData =
  | SuperAdminDashboardData
  | CoordinatorDashboardData
  | ProfessorDashboardData
  | StudentDashboardData
  | AssistantDashboardData;

// -----------------------------------------------------------------------------
// File Upload Types
// -----------------------------------------------------------------------------

export interface FileUpload {
  file: File;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  category: MaterialType;
}

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

// -----------------------------------------------------------------------------
// Notification Types
// -----------------------------------------------------------------------------

export interface NotificationPreference {
  type: NotificationType;
  channel: 'in_app' | 'email' | 'push' | 'sms';
  enabled: boolean;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// -----------------------------------------------------------------------------
// Attendance Types
// -----------------------------------------------------------------------------

export interface AttendanceRecord {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkAttendanceInput {
  sessionId: string;
  records: AttendanceRecord[];
}

export interface AttendanceSummary {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  percentage: number;
}

// -----------------------------------------------------------------------------
// Evasion Prediction Types
// -----------------------------------------------------------------------------

export interface EvasionRiskFactors {
  lowAttendance: boolean;
  lowGrades: boolean;
  missedAssignments: boolean;
  irregularAccess: boolean;
  financialIssues?: boolean;
  personalIssues?: boolean;
}

export interface EvasionPrediction {
  studentId: string;
  studentName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  factors: EvasionRiskFactors;
  suggestions: string[];
  lastUpdated: Date;
}

// -----------------------------------------------------------------------------
// Report Generation Types
// -----------------------------------------------------------------------------

export interface ReportParameters {
  type: ReportType;
  startDate: Date;
  endDate: Date;
  classIds?: string[];
  teacherIds?: string[];
  studentIds?: string[];
  roomIds?: string[];
  courseId?: string;
  semesterId?: string;
  includeCharts?: boolean;
  includeDetails?: boolean;
  format?: 'pdf' | 'xlsx' | 'csv';
}

export interface ReportSummary {
  title: string;
  generatedAt: Date;
  period: string;
  highlights: string[];
  data: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// AI Types
// -----------------------------------------------------------------------------

export interface AIScheduleSuggestion {
  suggestedSlot: ScheduleSlot;
  roomPreference?: string;
  confidence: number;
  reasoning: string;
  alternatives: ScheduleSlot[];
}

export interface AIConflictResolution {
  conflict: ScheduleConflict;
  resolution: string;
  alternativeSlots: ScheduleSlot[];
  impact: 'low' | 'medium' | 'high';
}

// -----------------------------------------------------------------------------
// Sidebar & Navigation Types
// -----------------------------------------------------------------------------

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  badge?: string | number;
  badgeColor?: string;
  children?: SidebarMenuItem[];
  roles?: Role[];
  isExternal?: boolean;
  isDivider?: boolean;
  isActive?: boolean;
}

// -----------------------------------------------------------------------------
// WebSocket Types
// -----------------------------------------------------------------------------

export interface WSEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
  senderId?: string;
}

export interface WSMessageEvent extends WSEvent {
  type: 'message:new' | 'message:edit' | 'message:delete' | 'message:read';
  payload: Message;
}

export interface WSNotificationEvent extends WSEvent {
  type: 'notification:new' | 'notification:read';
  payload: Notification;
}

export interface WSAttendanceEvent extends WSEvent {
  type: 'attendance:updated' | 'session:opened' | 'session:closed';
  payload: {
    sessionId: string;
    classId: string;
  };
}

// -----------------------------------------------------------------------------
// Filter & Query Types
// -----------------------------------------------------------------------------

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface EntityFilter {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClassFilter extends EntityFilter {
  semesterId?: string;
  teacherId?: string;
  subjectId?: string;
  roomId?: string;
  weekday?: Weekday;
  shift?: string;
}

export interface StudentFilter extends EntityFilter {
  courseId?: string;
  semester?: number;
  classId?: string;
  enrollmentStatus?: EnrollmentStatus;
  attendanceMin?: number;
  attendanceMax?: number;
}

export interface AttendanceFilter extends DateRangeFilter {
  sessionId?: string;
  classId?: string;
  studentId?: string;
  status?: AttendanceStatus;
}

// -----------------------------------------------------------------------------
// Misc Types
// -----------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isBot: boolean;
}
