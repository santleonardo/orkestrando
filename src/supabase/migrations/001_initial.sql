-- =============================================================================
-- ORKESTRANDO - Initial Database Migration
-- Creates all tables, enums, indexes matching the Prisma schema
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT', 'ASSISTANT');

CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

CREATE TYPE "MaterialType" AS ENUM ('PDF', 'DOCX', 'XLSX', 'PPTX', 'MP3', 'MP4', 'IMAGE', 'ZIP', 'OTHER');

CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'RETURNED');

CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP', 'ANNOUNCEMENT');

CREATE TYPE "SignatureType" AS ENUM ('OPEN_CLASS', 'CLOSE_CLASS', 'ATTENDANCE');

CREATE TYPE "SemesterStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UPCOMING');

-- -----------------------------------------------------------------------------
-- 1. Organization (organizacoes)
-- -----------------------------------------------------------------------------

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- -----------------------------------------------------------------------------
-- 2. Profile (perfil)
-- -----------------------------------------------------------------------------

CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX "profiles_org_id_email_key" ON "profiles"("org_id", "email");
CREATE INDEX "profiles_org_id_role_idx" ON "profiles"("org_id", "role");
CREATE INDEX "profiles_org_id_is_active_idx" ON "profiles"("org_id", "is_active");
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");

-- -----------------------------------------------------------------------------
-- 3. Permission (permissao)
-- -----------------------------------------------------------------------------

CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- -----------------------------------------------------------------------------
-- 4. RolePermission (permissao_papel)
-- -----------------------------------------------------------------------------

CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" "Role" NOT NULL,
    "permission_id" TEXT NOT NULL,
    "profile_id" TEXT,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_profile_id_key" ON "role_permissions"("role_id", "permission_id", "profile_id");
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");
CREATE INDEX "role_permissions_profile_id_idx" ON "role_permissions"("profile_id");

-- -----------------------------------------------------------------------------
-- 5. Teacher (professor)
-- -----------------------------------------------------------------------------

CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "department" TEXT,
    "specializations" TEXT[] NOT NULL DEFAULT '{}',
    "hire_date" TIMESTAMP(3),
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "teachers_profile_id_key" ON "teachers"("profile_id");
CREATE INDEX "teachers_department_idx" ON "teachers"("department");

-- -----------------------------------------------------------------------------
-- 6. Student (aluno)
-- -----------------------------------------------------------------------------

CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "enrollment_number" TEXT NOT NULL,
    "course" TEXT,
    "semester" INTEGER,
    "shift" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "students_profile_id_key" ON "students"("profile_id");
CREATE INDEX "students_enrollment_number_idx" ON "students"("enrollment_number");
CREATE INDEX "students_course_idx" ON "students"("course");
CREATE INDEX "students_status_idx" ON "students"("status");

-- -----------------------------------------------------------------------------
-- 7. Coordinator (coordenador)
-- -----------------------------------------------------------------------------

CREATE TABLE "coordinators" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "department" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coordinators_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coordinators_profile_id_key" ON "coordinators"("profile_id");
CREATE INDEX "coordinators_department_idx" ON "coordinators"("department");

-- -----------------------------------------------------------------------------
-- 8. Course (curso)
-- -----------------------------------------------------------------------------

CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "total_credits" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "courses_org_id_code_key" ON "courses"("org_id", "code");
CREATE INDEX "courses_org_id_is_active_idx" ON "courses"("org_id", "is_active");

-- -----------------------------------------------------------------------------
-- 9. Subject (disciplina)
-- -----------------------------------------------------------------------------

CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "course_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "workload" INTEGER NOT NULL DEFAULT 0,
    "semester" INTEGER,
    "is_elective" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "prerequisites" TEXT[] NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subjects_org_id_code_key" ON "subjects"("org_id", "code");
CREATE INDEX "subjects_org_id_course_id_idx" ON "subjects"("org_id", "course_id");
CREATE INDEX "subjects_org_id_is_active_idx" ON "subjects"("org_id", "is_active");
CREATE INDEX "subjects_org_id_semester_idx" ON "subjects"("org_id", "semester");

-- -----------------------------------------------------------------------------
-- 10. Room (sala)
-- -----------------------------------------------------------------------------

CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'CLASSROOM',
    "building" TEXT,
    "floor" INTEGER,
    "resources" TEXT[] NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rooms_org_id_code_key" ON "rooms"("org_id", "code");
CREATE INDEX "rooms_org_id_type_idx" ON "rooms"("org_id", "type");
CREATE INDEX "rooms_org_id_is_active_idx" ON "rooms"("org_id", "is_active");
CREATE INDEX "rooms_org_id_capacity_idx" ON "rooms"("org_id", "capacity");

-- -----------------------------------------------------------------------------
-- 11. Semester (semestre)
-- -----------------------------------------------------------------------------

CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "SemesterStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "semesters_org_id_status_idx" ON "semesters"("org_id", "status");
CREATE INDEX "semesters_org_id_start_date_idx" ON "semesters"("org_id", "start_date");
CREATE INDEX "semesters_start_date_end_date_idx" ON "semesters"("start_date", "end_date");

-- -----------------------------------------------------------------------------
-- 12. TeacherAvailability (disponibilidade_professor)
-- -----------------------------------------------------------------------------

CREATE TABLE "teacher_availabilities" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_availabilities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "teacher_availabilities_org_id_teacher_id_idx" ON "teacher_availabilities"("org_id", "teacher_id");
CREATE INDEX "teacher_availabilities_org_id_semester_id_idx" ON "teacher_availabilities"("org_id", "semester_id");
CREATE INDEX "teacher_availabilities_teacher_id_semester_id_weekday_idx" ON "teacher_availabilities"("teacher_id", "semester_id", "weekday");
CREATE UNIQUE INDEX "teacher_availabilities_teacher_id_semester_id_weekday_start_time_end_time_key" ON "teacher_availabilities"("teacher_id", "semester_id", "weekday", "start_time", "end_time");

-- -----------------------------------------------------------------------------
-- 13. TeacherBlock (bloqueio_professor)
-- -----------------------------------------------------------------------------

CREATE TABLE "teacher_blocks" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_blocks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "teacher_blocks_org_id_teacher_id_idx" ON "teacher_blocks"("org_id", "teacher_id");
CREATE INDEX "teacher_blocks_org_id_semester_id_idx" ON "teacher_blocks"("org_id", "semester_id");
CREATE INDEX "teacher_blocks_teacher_id_date_idx" ON "teacher_blocks"("teacher_id", "date");
CREATE INDEX "teacher_blocks_date_idx" ON "teacher_blocks"("date");

-- -----------------------------------------------------------------------------
-- 14. Holiday (feriado)
-- -----------------------------------------------------------------------------

CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NATIONAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "holidays_org_id_date_key" ON "holidays"("org_id", "date");
CREATE INDEX "holidays_org_id_type_idx" ON "holidays"("org_id", "type");
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- -----------------------------------------------------------------------------
-- 15. Class (turma)
-- -----------------------------------------------------------------------------

CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "room_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "max_students" INTEGER NOT NULL DEFAULT 0,
    "current_students" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "classes_org_id_code_key" ON "classes"("org_id", "code");
CREATE INDEX "classes_org_id_subject_id_idx" ON "classes"("org_id", "subject_id");
CREATE INDEX "classes_org_id_semester_id_idx" ON "classes"("org_id", "semester_id");
CREATE INDEX "classes_org_id_teacher_id_idx" ON "classes"("org_id", "teacher_id");
CREATE INDEX "classes_org_id_status_idx" ON "classes"("org_id", "status");
CREATE INDEX "classes_semester_id_teacher_id_idx" ON "classes"("semester_id", "teacher_id");

-- -----------------------------------------------------------------------------
-- 16. ClassSession (aula)
-- -----------------------------------------------------------------------------

CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "topic" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "teacher_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "class_sessions_org_id_class_id_idx" ON "class_sessions"("org_id", "class_id");
CREATE INDEX "class_sessions_class_id_date_idx" ON "class_sessions"("class_id", "date");
CREATE INDEX "class_sessions_org_id_date_idx" ON "class_sessions"("org_id", "date");
CREATE INDEX "class_sessions_status_idx" ON "class_sessions"("status");
CREATE INDEX "class_sessions_date_idx" ON "class_sessions"("date");

-- -----------------------------------------------------------------------------
-- 17. Enrollment (matricula)
-- -----------------------------------------------------------------------------

CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dropped_at" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "enrollments_student_id_class_id_semester_id_key" ON "enrollments"("student_id", "class_id", "semester_id");
CREATE INDEX "enrollments_org_id_student_id_idx" ON "enrollments"("org_id", "student_id");
CREATE INDEX "enrollments_org_id_class_id_idx" ON "enrollments"("org_id", "class_id");
CREATE INDEX "enrollments_org_id_semester_id_idx" ON "enrollments"("org_id", "semester_id");
CREATE INDEX "enrollments_student_id_status_idx" ON "enrollments"("student_id", "status");
CREATE INDEX "enrollments_class_id_status_idx" ON "enrollments"("class_id", "status");

-- -----------------------------------------------------------------------------
-- 18. Attendance (frequencia)
-- -----------------------------------------------------------------------------

CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "class_session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "noted_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "attendances_class_session_id_student_id_key" ON "attendances"("class_session_id", "student_id");
CREATE INDEX "attendances_org_id_class_session_id_idx" ON "attendances"("org_id", "class_session_id");
CREATE INDEX "attendances_org_id_student_id_idx" ON "attendances"("org_id", "student_id");
CREATE INDEX "attendances_student_id_status_idx" ON "attendances"("student_id", "status");
CREATE INDEX "attendances_class_session_id_status_idx" ON "attendances"("class_session_id", "status");

-- -----------------------------------------------------------------------------
-- 19. AttendanceSignature (assinatura_frequencia)
-- -----------------------------------------------------------------------------

CREATE TABLE "attendance_signatures" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "attendance_id" TEXT NOT NULL,
    "class_session_id" TEXT NOT NULL,
    "signed_by" TEXT NOT NULL,
    "signature_type" "SignatureType" NOT NULL DEFAULT 'ATTENDANCE',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_signatures_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "attendance_signatures_org_id_attendance_id_idx" ON "attendance_signatures"("org_id", "attendance_id");
CREATE INDEX "attendance_signatures_org_id_class_session_id_idx" ON "attendance_signatures"("org_id", "class_session_id");
CREATE INDEX "attendance_signatures_signed_by_idx" ON "attendance_signatures"("signed_by");
CREATE INDEX "attendance_signatures_class_session_id_signature_type_idx" ON "attendance_signatures"("class_session_id", "signature_type");

-- -----------------------------------------------------------------------------
-- 20. Material (material)
-- -----------------------------------------------------------------------------

CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MaterialType" NOT NULL DEFAULT 'PDF',
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "materials_org_id_subject_id_idx" ON "materials"("org_id", "subject_id");
CREATE INDEX "materials_org_id_class_id_idx" ON "materials"("org_id", "class_id");
CREATE INDEX "materials_uploaded_by_idx" ON "materials"("uploaded_by");
CREATE INDEX "materials_org_id_type_idx" ON "materials"("org_id", "type");
CREATE INDEX "materials_is_published_idx" ON "materials"("is_published");

-- -----------------------------------------------------------------------------
-- 21. Assignment (trabalho)
-- -----------------------------------------------------------------------------

CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "max_grade" DECIMAL(5,2) NOT NULL DEFAULT 10.0,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "assignments_org_id_subject_id_idx" ON "assignments"("org_id", "subject_id");
CREATE INDEX "assignments_org_id_class_id_idx" ON "assignments"("org_id", "class_id");
CREATE INDEX "assignments_created_by_idx" ON "assignments"("created_by");
CREATE INDEX "assignments_org_id_status_idx" ON "assignments"("org_id", "status");
CREATE INDEX "assignments_due_date_idx" ON "assignments"("due_date");

-- -----------------------------------------------------------------------------
-- 22. AssignmentSubmission (entrega_trabalho)
-- -----------------------------------------------------------------------------

CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL DEFAULT 0,
    "grade" DECIMAL(5,2),
    "feedback" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "graded_at" TIMESTAMP(3),

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_key" ON "assignment_submissions"("assignment_id", "student_id");
CREATE INDEX "assignment_submissions_org_id_assignment_id_idx" ON "assignment_submissions"("org_id", "assignment_id");
CREATE INDEX "assignment_submissions_org_id_student_id_idx" ON "assignment_submissions"("org_id", "student_id");
CREATE INDEX "assignment_submissions_student_id_submitted_at_idx" ON "assignment_submissions"("student_id", "submitted_at");

-- -----------------------------------------------------------------------------
-- 23. Conversation (conversa)
-- -----------------------------------------------------------------------------

CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "created_by" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversations_org_id_type_idx" ON "conversations"("org_id", "type");
CREATE INDEX "conversations_last_message_at_idx" ON "conversations"("last_message_at");
CREATE INDEX "conversations_created_by_idx" ON "conversations"("created_by");

-- -----------------------------------------------------------------------------
-- 24. ConversationParticipant (participante_conversa)
-- -----------------------------------------------------------------------------

CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversation_participants_conversation_id_profile_id_key" ON "conversation_participants"("conversation_id", "profile_id");
CREATE INDEX "conversation_participants_profile_id_idx" ON "conversation_participants"("profile_id");

-- -----------------------------------------------------------------------------
-- 25. Message (mensagem)
-- -----------------------------------------------------------------------------

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "messages_org_id_conversation_id_idx" ON "messages"("org_id", "conversation_id");
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX "messages_parent_id_idx" ON "messages"("parent_id");
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- -----------------------------------------------------------------------------
-- 26. MessageAttachment (anexo_mensagem)
-- -----------------------------------------------------------------------------

CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL DEFAULT 0,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "message_attachments_message_id_idx" ON "message_attachments"("message_id");

-- -----------------------------------------------------------------------------
-- 27. Notification (notificacao)
-- -----------------------------------------------------------------------------

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "data" JSONB NOT NULL DEFAULT '{}',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_org_id_profile_id_idx" ON "notifications"("org_id", "profile_id");
CREATE INDEX "notifications_profile_id_is_read_idx" ON "notifications"("profile_id", "is_read");
CREATE INDEX "notifications_org_id_type_idx" ON "notifications"("org_id", "type");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- -----------------------------------------------------------------------------
-- 28. AuditLog (log_auditoria)
-- -----------------------------------------------------------------------------

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "profile_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_org_id_action_idx" ON "audit_logs"("org_id", "action");
CREATE INDEX "audit_logs_org_id_resource_idx" ON "audit_logs"("org_id", "resource");
CREATE INDEX "audit_logs_org_id_profile_id_idx" ON "audit_logs"("org_id", "profile_id");
CREATE INDEX "audit_logs_profile_id_created_at_idx" ON "audit_logs"("profile_id", "created_at");
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- -----------------------------------------------------------------------------
-- 29. Report (relatorio)
-- -----------------------------------------------------------------------------

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "data" JSONB NOT NULL DEFAULT '{}',
    "generated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reports_org_id_type_idx" ON "reports"("org_id", "type");
CREATE INDEX "reports_generated_by_idx" ON "reports"("generated_by");
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- -----------------------------------------------------------------------------
-- 30. SessionSettings (configuracoes_sessao)
-- -----------------------------------------------------------------------------

CREATE TABLE "session_settings" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "session_settings_semester_id_setting_key_key" ON "session_settings"("semester_id", "setting_key");
CREATE INDEX "session_settings_org_id_semester_id_idx" ON "session_settings"("org_id", "semester_id");
CREATE INDEX "session_settings_org_id_setting_key_idx" ON "session_settings"("org_id", "setting_key");

-- -----------------------------------------------------------------------------
-- ALTER TABLE: Add foreign key constraints
-- -----------------------------------------------------------------------------

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coordinators" ADD CONSTRAINT "coordinators_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_blocks" ADD CONSTRAINT "teacher_blocks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_blocks" ADD CONSTRAINT "teacher_blocks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_blocks" ADD CONSTRAINT "teacher_blocks_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_signatures" ADD CONSTRAINT "attendance_signatures_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_signatures" ADD CONSTRAINT "attendance_signatures_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_signatures" ADD CONSTRAINT "attendance_signatures_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_signatures" ADD CONSTRAINT "attendance_signatures_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "materials" ADD CONSTRAINT "materials_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "materials" ADD CONSTRAINT "materials_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "materials" ADD CONSTRAINT "materials_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "materials" ADD CONSTRAINT "materials_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "profiles"("id") ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_settings" ADD CONSTRAINT "session_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_settings" ADD CONSTRAINT "session_settings_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
