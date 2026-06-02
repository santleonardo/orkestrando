-- =============================================================================
-- ORKESTRANDO - Setup Completo (RUN THIS FILE FIRST)
-- Este arquivo apaga tudo e recria do zero.
-- Cole todo o conteudo no SQL Editor do Supabase e clique em Run.
-- =============================================================================

-- STEP 1: Remove tudo que existe (limpeza completa)
DROP TABLE IF EXISTS "session_settings" CASCADE;
DROP TABLE IF EXISTS "reports" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "message_attachments" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "conversation_participants" CASCADE;
DROP TABLE IF EXISTS "conversations" CASCADE;
DROP TABLE IF EXISTS "assignment_submissions" CASCADE;
DROP TABLE IF EXISTS "assignments" CASCADE;
DROP TABLE IF EXISTS "materials" CASCADE;
DROP TABLE IF EXISTS "attendance_signatures" CASCADE;
DROP TABLE IF EXISTS "attendances" CASCADE;
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "class_sessions" CASCADE;
DROP TABLE IF EXISTS "classes" CASCADE;
DROP TABLE IF EXISTS "holidays" CASCADE;
DROP TABLE IF EXISTS "teacher_blocks" CASCADE;
DROP TABLE IF EXISTS "teacher_availabilities" CASCADE;
DROP TABLE IF EXISTS "semesters" CASCADE;
DROP TABLE IF EXISTS "rooms" CASCADE;
DROP TABLE IF EXISTS "subjects" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "coordinators" CASCADE;
DROP TABLE IF EXISTS "students" CASCADE;
DROP TABLE IF EXISTS "teachers" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "organizations" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Weekday" CASCADE;
DROP TYPE IF EXISTS "AttendanceStatus" CASCADE;
DROP TYPE IF EXISTS "MessageStatus" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "MaterialType" CASCADE;
DROP TYPE IF EXISTS "AssignmentStatus" CASCADE;
DROP TYPE IF EXISTS "ConversationType" CASCADE;
DROP TYPE IF EXISTS "SignatureType" CASCADE;
DROP TYPE IF EXISTS "SemesterStatus" CASCADE;

DROP FUNCTION IF EXISTS public.get_current_user_org_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_coordinator() CASCADE;

-- STEP 2: Cria os tipos (Enums)
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

-- STEP 3: Cria as tabelas

-- 1. Organizations
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- 2. Profiles
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 3. Permissions
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- 4. Role Permissions
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "role_id" "Role" NOT NULL,
    "permission_id" TEXT NOT NULL,
    "profile_id" TEXT,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_profile_id_key" ON "role_permissions"("role_id", "permission_id", "profile_id");

-- 5. Teachers
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "profile_id" TEXT NOT NULL,
    "department" TEXT,
    "specializations" TEXT[] NOT NULL DEFAULT '{}',
    "hire_date" TIMESTAMP(3),
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "teachers_profile_id_key" ON "teachers"("profile_id");

-- 6. Students
CREATE TABLE "students" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 7. Coordinators
CREATE TABLE "coordinators" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "profile_id" TEXT NOT NULL,
    "department" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coordinators_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "coordinators_profile_id_key" ON "coordinators"("profile_id");

-- 8. Courses
CREATE TABLE "courses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 9. Subjects
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 10. Rooms
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 11. Semesters
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "SemesterStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- 12. Teacher Availabilities
CREATE TABLE "teacher_availabilities" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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
CREATE UNIQUE INDEX "teacher_availabilities_teacher_id_semester_id_weekday_start_time_end_time_key" ON "teacher_availabilities"("teacher_id", "semester_id", "weekday", "start_time", "end_time");

-- 13. Teacher Blocks
CREATE TABLE "teacher_blocks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 14. Holidays
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "org_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NATIONAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "holidays_org_id_date_key" ON "holidays"("org_id", "date");

-- 15. Classes
CREATE TABLE "classes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 16. Class Sessions
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 17. Enrollments
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 18. Attendances
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 19. Attendance Signatures
CREATE TABLE "attendance_signatures" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 20. Materials
CREATE TABLE "materials" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 21. Assignments
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 22. Assignment Submissions
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 23. Conversations
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "org_id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "created_by" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- 24. Conversation Participants
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "conversation_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "conversation_participants_conversation_id_profile_id_key" ON "conversation_participants"("conversation_id", "profile_id");

-- 25. Messages
CREATE TABLE "messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "org_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- 26. Message Attachments
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "message_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL DEFAULT 0,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- 27. Notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 28. Audit Logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- 29. Reports
CREATE TABLE "reports" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "org_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "data" JSONB NOT NULL DEFAULT '{}',
    "generated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- 30. Session Settings
CREATE TABLE "session_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "org_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "session_settings_semester_id_setting_key_key" ON "session_settings"("semester_id", "setting_key");

-- STEP 4: Foreign Keys
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

-- STEP 5: Dados iniciais

-- Organization
INSERT INTO "organizations" ("id", "name", "slug", "logo", "settings") VALUES
('org-001', 'ORKESTRANDO - Sistema Academico', 'orkestrando', NULL, '{"maxFileSize": 52428800, "allowedFileTypes": ["pdf","docx","xlsx","pptx","mp3","mp4","jpg","png","zip"], "attendancePercentage": 75, "sessionTimeout": 30}');

-- Permissions
INSERT INTO "permissions" ("id", "name", "description", "module") VALUES
('perm-01', 'manage_teachers', 'Gerenciar professores', 'teachers'),
('perm-02', 'manage_students', 'Gerenciar alunos', 'students'),
('perm-03', 'manage_classes', 'Gerenciar turmas', 'classes'),
('perm-04', 'manage_subjects', 'Gerenciar disciplinas', 'subjects'),
('perm-05', 'manage_rooms', 'Gerenciar salas', 'rooms'),
('perm-06', 'manage_schedules', 'Gerenciar agendamentos', 'schedules'),
('perm-07', 'view_reports', 'Visualizar relatorios', 'reports'),
('perm-08', 'manage_materials', 'Gerenciar materiais', 'materials'),
('perm-09', 'manage_messages', 'Gerenciar mensagens', 'messages'),
('perm-10', 'manage_attendance', 'Gerenciar frequencia', 'attendance'),
('perm-11', 'manage_enrollments', 'Gerenciar matriculas', 'enrollments'),
('perm-12', 'manage_availability', 'Gerenciar disponibilidade', 'availability'),
('perm-13', 'manage_semesters', 'Gerenciar semestres', 'semesters'),
('perm-14', 'manage_courses', 'Gerenciar cursos', 'courses'),
('perm-15', 'manage_announcements', 'Criar comunicados', 'announcements'),
('perm-16', 'ai_features', 'Usar recursos de IA', 'ai'),
('perm-17', 'audit_logs', 'Visualizar logs de auditoria', 'audit');

-- Courses
INSERT INTO "courses" ("id", "org_id", "name", "code", "description", "total_credits") VALUES
('course-01', 'org-001', 'Ciencia da Computacao', 'CC', 'Curso de Bacharelado em Ciencia da Computacao', 240),
('course-02', 'org-001', 'Sistemas de Informacao', 'SI', 'Curso de Bacharelado em Sistemas de Informacao', 240),
('course-03', 'org-001', 'Engenharia de Software', 'ES', 'Curso de Bacharelado em Engenharia de Software', 240);

-- Semesters
INSERT INTO "semesters" ("id", "org_id", "name", "start_date", "end_date", "status") VALUES
('sem-01', 'org-001', '2024/1', '2024-02-05', '2024-06-28', 'ACTIVE'),
('sem-02', 'org-001', '2024/2', '2024-08-05', '2024-12-20', 'UPCOMING');

-- Rooms
INSERT INTO "rooms" ("id", "org_id", "name", "code", "capacity", "type", "building", "floor", "resources") VALUES
('room-01', 'org-001', 'Sala 101', 'S-101', 40, 'CLASSROOM', 'Bloco A', 1, '{"projector","whiteboard","ac"}'),
('room-02', 'org-001', 'Sala 102', 'S-102', 35, 'CLASSROOM', 'Bloco A', 1, '{"projector","whiteboard"}'),
('room-03', 'org-001', 'Lab 01', 'L-01', 30, 'LAB', 'Bloco B', 1, '{"computers:30","projector","whiteboard"}'),
('room-04', 'org-001', 'Lab 02', 'L-02', 25, 'LAB', 'Bloco B', 1, '{"computers:25","projector"}'),
('room-05', 'org-001', 'Auditorio', 'AUD-01', 120, 'AUDITORIUM', 'Bloco C', 0, '{"projector","microphone","sound_system"}');

-- Subjects
INSERT INTO "subjects" ("id", "org_id", "course_id", "name", "code", "credits", "workload", "semester", "is_elective") VALUES
('sub-01', 'org-001', 'course-01', 'Algoritmos e Estruturas de Dados I', 'AED-I', 4, 60, 3, false),
('sub-02', 'org-001', 'course-01', 'Banco de Dados I', 'BD-I', 4, 60, 3, false),
('sub-03', 'org-001', 'course-01', 'Programacao Orientada a Objetos', 'POO', 4, 60, 3, false),
('sub-04', 'org-001', 'course-01', 'Inteligencia Artificial', 'IA', 4, 60, 5, false),
('sub-05', 'org-001', 'course-01', 'Redes de Computadores', 'RC', 4, 60, 5, false);

-- Done! Setup completo.
-- PROXIMO PASSO: Rode o arquivo 002_rls_policies.sql
-- DEPOIS: Crie os usuarios no Supabase Auth (Authentication > Users > Add User)
