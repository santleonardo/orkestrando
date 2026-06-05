-- =============================================================================
-- ORKESTRANDO - Production-Ready Initial Database Schema
-- Supabase PostgreSQL Migration
-- Version: 2.0 (with RBAC tables and comprehensive RLS)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'coordinator', 'teacher', 'student');
CREATE TYPE user_auth_provider AS ENUM ('email', 'google', 'microsoft', 'facebook');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'justified');
CREATE TYPE class_status AS ENUM ('active', 'inactive', 'completed', 'cancelled');
CREATE TYPE enrollment_status AS ENUM ('active', 'dropped', 'completed', 'suspended');
CREATE TYPE message_status AS ENUM ('sent', 'read', 'deleted');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system', 'audio');
CREATE TYPE availability_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE material_type AS ENUM ('pdf', 'docx', 'xlsx', 'pptx', 'mp3', 'mp4', 'image', 'zip', 'other');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE recurring_pattern AS ENUM ('weekly', 'biweekly', 'monthly');
CREATE TYPE contract_type AS ENUM ('full_time', 'part_time', 'freelancer');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'mixed');
CREATE TYPE course_modality AS ENUM ('in_person', 'online', 'hybrid');
CREATE TYPE room_type AS ENUM ('classroom', 'lab', 'auditorium', 'gym', 'library', 'other');
CREATE TYPE block_type AS ENUM ('vacation', 'sick_leave', 'personal', 'conference', 'other');
CREATE TYPE holiday_type AS ENUM ('national', 'state', 'municipal', 'institutional');
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'class', 'announcement');
CREATE TYPE conversation_role AS ENUM ('admin', 'member', 'moderator');
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded', 'returned');
CREATE TYPE assignment_material_type AS ENUM ('text', 'file', 'link', 'mixed');
CREATE TYPE report_format AS ENUM ('pdf', 'xlsx', 'csv');
CREATE TYPE report_status AS ENUM ('pending', 'generating', 'completed', 'failed');
CREATE TYPE report_type AS ENUM ('attendance', 'academic', 'financial', 'teacher', 'custom');
CREATE TYPE audit_action AS ENUM ('login', 'logout', 'upload', 'download', 'create', 'update', 'delete', 'signature', 'attendance', 'message', 'enrollment', 'schedule');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- =============================================================================
-- RBAC TABLES (Role-Based Access Control)
-- =============================================================================

-- ---- Roles ----

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Permissions ----

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permissions_resource ON permissions(resource);

-- ---- Role Permissions (junction table) ----

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- ---- User Roles (junction table) ----

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id, role_id, organization_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_organization ON user_roles(organization_id);

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- ---- Organization ----

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    address VARCHAR(300),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Brasil',
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    max_teachers INTEGER,
    max_students INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Users ----

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    auth_provider user_auth_provider DEFAULT 'email',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Profiles ----

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'student',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    avatar_url TEXT,
    date_of_birth DATE,
    gender gender_type,
    document VARCHAR(14),
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Teachers ----

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    hire_date DATE,
    contract_type contract_type DEFAULT 'part_time',
    subjects JSONB DEFAULT '[]'::jsonb,
    max_weekly_hours INTEGER DEFAULT 40,
    specialties TEXT[],
    qualifications TEXT,
    salary NUMERIC(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Students ----

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    enrollment_number VARCHAR(50) NOT NULL,
    enrollment_date DATE NOT NULL,
    course_level VARCHAR(100),
    semester INTEGER DEFAULT 1,
    overall_gpa NUMERIC(4,2),
    total_credits INTEGER,
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Coordinators ----

CREATE TABLE coordinators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    department VARCHAR(100),
    responsibilities JSONB DEFAULT '[]'::jsonb,
    managed_courses JSONB DEFAULT '[]'::jsonb,
    managed_teachers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Courses ----

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL,
    total_credits INTEGER NOT NULL,
    level course_level DEFAULT 'mixed',
    modality course_modality DEFAULT 'in_person',
    tuition_fee NUMERIC(12,2),
    max_capacity INTEGER DEFAULT 30,
    requirements TEXT,
    objectives JSONB DEFAULT '[]'::jsonb,
    competencies JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- ---- Subjects ----

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    course_ids JSONB DEFAULT '[]'::jsonb,
    workload_hours INTEGER NOT NULL,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- ---- Rooms ----

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    room_type room_type DEFAULT 'classroom',
    building VARCHAR(100),
    floor INTEGER,
    has_projector BOOLEAN DEFAULT FALSE,
    has_whiteboard BOOLEAN DEFAULT TRUE,
    has_audio_system BOOLEAN DEFAULT FALSE,
    has_computers BOOLEAN DEFAULT FALSE,
    wifi_available BOOLEAN DEFAULT TRUE,
    air_conditioned BOOLEAN DEFAULT FALSE,
    accessibility_features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- ---- Semesters ----

CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    term INTEGER NOT NULL CHECK (term IN (1, 2)),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_week INTEGER,
    total_weeks INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    holidays JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, year, term)
);

-- ---- Teacher Availability ----

CREATE TABLE teacher_availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time VARCHAR(5) NOT NULL CHECK (start_time ~ '^[0-9]{2}:[0-9]{2}$'),
    end_time VARCHAR(5) NOT NULL CHECK (end_time ~ '^[0-9]{2}:[0-9]{2}$'),
    recurring_pattern recurring_pattern DEFAULT 'weekly',
    status availability_status DEFAULT 'pending',
    valid_from DATE,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Teacher Blocks ----

CREATE TABLE teacher_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    block_type block_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES coordinators(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Holidays ----

CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    type holiday_type NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    affects_classes BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Classes (Turmas) ----

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    room_id UUID REFERENCES rooms(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(30) NOT NULL,
    max_capacity INTEGER DEFAULT 30,
    current_enrollment INTEGER DEFAULT 0,
    status class_status DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time VARCHAR(5) NOT NULL CHECK (start_time ~ '^[0-9]{2}:[0-9]{2}$'),
    end_time VARCHAR(5) NOT NULL CHECK (end_time ~ '^[0-9]{2}:[0-9]{2}$'),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    description TEXT,
    syllabus TEXT,
    grading_criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- ---- Class Sessions ----

CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    room_id UUID REFERENCES rooms(id),
    date DATE NOT NULL,
    start_time VARCHAR(5) NOT NULL CHECK (start_time ~ '^[0-9]{2}:[0-9]{2}$'),
    end_time VARCHAR(5) NOT NULL CHECK (end_time ~ '^[0-9]{2}:[0-9]{2}$'),
    status session_status DEFAULT 'scheduled',
    topic VARCHAR(200),
    description TEXT,
    materials JSONB DEFAULT '[]'::jsonb,
    attendance_recorded BOOLEAN DEFAULT FALSE,
    notes TEXT,
    substitute_teacher_id UUID REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Enrollments ----

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    status enrollment_status DEFAULT 'active',
    enrollment_date DATE NOT NULL,
    drop_date DATE,
    completion_date DATE,
    final_grade NUMERIC(4,2),
    attendance_rate NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

-- ---- Attendance ----

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    status attendance_status DEFAULT 'present',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- ---- Attendance Signatures ----

CREATE TABLE attendance_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID UNIQUE NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    signature_data TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    geolocation JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Materials ----

CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    uploaded_by_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    material_type material_type DEFAULT 'pdf',
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(200) NOT NULL,
    version INTEGER DEFAULT 1,
    current_version_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    download_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Material Versions ----

CREATE TABLE material_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(200) NOT NULL,
    version INTEGER NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES profiles(id),
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Assignments ----

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    created_by_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    max_grade NUMERIC(4,2) DEFAULT 10.0,
    weight NUMERIC(3,2) DEFAULT 1.0,
    material_type assignment_material_type DEFAULT 'text',
    allow_late_submission BOOLEAN DEFAULT FALSE,
    late_penalty NUMERIC(5,2),
    max_file_size BIGINT,
    allowed_extensions JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Assignment Submissions ----

CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    status assignment_status DEFAULT 'pending',
    content TEXT,
    file_url TEXT,
    file_name VARCHAR(500),
    file_size BIGINT,
    submitted_at TIMESTAMPTZ,
    grade NUMERIC(4,2),
    feedback TEXT,
    graded_by_id UUID,
    graded_at TIMESTAMPTZ,
    late_days INTEGER,
    plagiarism_score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- ---- Conversations ----

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    type conversation_type DEFAULT 'direct',
    title VARCHAR(200),
    avatar_url TEXT,
    participant_ids JSONB DEFAULT '[]'::jsonb,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Conversation Participants ----

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    role conversation_role DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    has_left BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- ---- Messages ----

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    status message_status DEFAULT 'sent',
    message_type message_type DEFAULT 'text',
    reply_to_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    reactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Message Attachments ----

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(200) NOT NULL,
    width INTEGER,
    height INTEGER,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Notifications ----

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    channel notification_channel[] DEFAULT ARRAY['in_app']::notification_channel[],
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Reports ----

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    report_type report_type NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    data_url TEXT,
    format report_format DEFAULT 'pdf',
    status report_status DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Audit Logs ----

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL,
    action audit_action NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    previous_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_organization ON profiles(organization_id);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_organization ON teachers(organization_id);
CREATE INDEX idx_teachers_active ON teachers(is_active);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_organization ON students(organization_id);
CREATE INDEX idx_students_enrollment_number ON students(enrollment_number);
CREATE INDEX idx_students_active ON students(is_active);

CREATE INDEX idx_coordinators_user_id ON coordinators(user_id);
CREATE INDEX idx_coordinators_organization ON coordinators(organization_id);

CREATE INDEX idx_courses_organization ON courses(organization_id);
CREATE INDEX idx_courses_active ON courses(is_active);

CREATE INDEX idx_subjects_organization ON subjects(organization_id);

CREATE INDEX idx_rooms_organization ON rooms(organization_id);
CREATE INDEX idx_rooms_active ON rooms(is_active);

CREATE INDEX idx_semesters_organization ON semesters(organization_id);
CREATE INDEX idx_semesters_active ON semesters(is_active);

CREATE INDEX idx_teacher_avail_teacher ON teacher_availabilities(teacher_id);
CREATE INDEX idx_teacher_avail_organization ON teacher_availabilities(organization_id);
CREATE INDEX idx_teacher_avail_day ON teacher_availabilities(day_of_week);
CREATE INDEX idx_teacher_avail_status ON teacher_availabilities(status);

CREATE INDEX idx_teacher_blocks_teacher ON teacher_blocks(teacher_id);
CREATE INDEX idx_teacher_blocks_organization ON teacher_blocks(organization_id);
CREATE INDEX idx_teacher_blocks_dates ON teacher_blocks(start_date, end_date);

CREATE INDEX idx_holidays_organization ON holidays(organization_id);
CREATE INDEX idx_holidays_date ON holidays(date);

CREATE INDEX idx_classes_organization ON classes(organization_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_semester ON classes(semester_id);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_course ON classes(course_id);

CREATE INDEX idx_sessions_class ON class_sessions(class_id);
CREATE INDEX idx_sessions_teacher ON class_sessions(teacher_id);
CREATE INDEX idx_sessions_room ON class_sessions(room_id);
CREATE INDEX idx_sessions_date ON class_sessions(date);
CREATE INDEX idx_sessions_status ON class_sessions(status);
CREATE INDEX idx_sessions_date_status ON class_sessions(date, status);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_enrollments_semester ON enrollments(semester_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_status ON attendance(status);

CREATE INDEX idx_signatures_student ON attendance_signatures(student_id);
CREATE INDEX idx_signatures_valid ON attendance_signatures(is_valid);

CREATE INDEX idx_materials_organization ON materials(organization_id);
CREATE INDEX idx_materials_class ON materials(class_id);
CREATE INDEX idx_materials_uploader ON materials(uploaded_by_id);

CREATE INDEX idx_assignments_organization ON assignments(organization_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_published ON assignments(is_published);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_class ON assignment_submissions(class_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);

CREATE INDEX idx_conversations_organization ON conversations(organization_id);

CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

CREATE INDEX idx_attachments_message ON message_attachments(message_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_organization ON notifications(organization_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_reports_organization ON reports(organization_id);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_audit_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity);
CREATE INDEX idx_audit_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =============================================================================
-- TRIGGER: Updated At Timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coordinators_updated_at BEFORE UPDATE ON coordinators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_availabilities_updated_at BEFORE UPDATE ON teacher_availabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_blocks_updated_at BEFORE UPDATE ON teacher_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_sessions_updated_at BEFORE UPDATE ON class_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_signatures_updated_at BEFORE UPDATE ON attendance_signatures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_versions_updated_at BEFORE UPDATE ON material_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON conversation_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON message_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS HELPER FUNCTIONS
-- =============================================================================

-- Check if current user has a specific role via user_roles table (RBAC)
CREATE OR REPLACE FUNCTION user_has_role(target_role TEXT) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = target_role
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin or coordinator (convenience helper)
CREATE OR REPLACE FUNCTION user_is_admin_or_coordinator() RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'coordinator')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION current_user_org_id() RETURNS UUID AS $$
    SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's profile role (from profiles table as fallback)
CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- RLS POLICIES: RBAC Tables
-- =============================================================================

-- Roles: Admins/coordinators can manage roles; teachers/students can read
CREATE POLICY "roles_admin_all" ON roles FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "roles_read" ON roles FOR SELECT TO authenticated USING (user_has_role('admin') OR user_has_role('coordinator') OR user_has_role('teacher') OR user_has_role('student'));

-- Permissions: Admins/coordinators can manage; all authenticated can read
CREATE POLICY "permissions_admin_all" ON permissions FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "permissions_read" ON permissions FOR SELECT TO authenticated USING (true);

-- Role Permissions: Admins/coordinators can manage
CREATE POLICY "role_permissions_admin_all" ON role_permissions FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "role_permissions_read" ON role_permissions FOR SELECT TO authenticated USING (true);

-- User Roles: Admins can manage all; coordinators can assign within their org; users can read their own
CREATE POLICY "user_roles_admin_all" ON user_roles FOR ALL TO authenticated USING (user_has_role('admin'));
CREATE POLICY "user_roles_coordinator_manage" ON user_roles FOR ALL TO authenticated USING (
    user_has_role('coordinator') AND organization_id = current_user_org_id()
);
CREATE POLICY "user_roles_self_read" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- RLS POLICIES: Organizations
-- =============================================================================

CREATE POLICY "organizations_admin_all" ON organizations FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "organizations_org_read" ON organizations FOR SELECT TO authenticated USING (id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Users
-- =============================================================================

CREATE POLICY "users_admin_all" ON users FOR ALL TO authenticated USING (user_has_role('admin'));
CREATE POLICY "users_coordinator_read" ON users FOR SELECT TO authenticated USING (
    user_is_admin_or_coordinator() AND organization_id = current_user_org_id()
);
CREATE POLICY "users_self_read" ON users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_self_update" ON users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- =============================================================================
-- RLS POLICIES: Profiles
-- =============================================================================

CREATE POLICY "profiles_admin_all" ON profiles FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "profiles_teacher_read" ON profiles FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t
        JOIN classes c ON c.teacher_id = t.id
        JOIN enrollments e ON e.class_id = c.id
        JOIN students s ON s.id = e.student_id
        WHERE t.user_id = auth.uid() AND s.profile_id = profiles.id
    )
);
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_student_own" ON profiles FOR SELECT TO authenticated USING (
    user_id = auth.uid()
);

-- =============================================================================
-- RLS POLICIES: Teachers
-- =============================================================================

CREATE POLICY "teachers_admin_all" ON teachers FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "teachers_self_read" ON teachers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "teachers_self_update" ON teachers FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "teachers_org_read" ON teachers FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Students
-- =============================================================================

CREATE POLICY "students_admin_all" ON students FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "students_self_read" ON students FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "students_self_update" ON students FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "students_teacher_read" ON students FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t
        JOIN classes c ON c.teacher_id = t.id
        JOIN enrollments e ON e.class_id = c.id
        WHERE t.user_id = auth.uid() AND e.student_id = students.id
    )
);
CREATE POLICY "students_org_read" ON students FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Coordinators
-- =============================================================================

CREATE POLICY "coordinators_admin_all" ON coordinators FOR ALL TO authenticated USING (user_has_role('admin'));
CREATE POLICY "coordinators_self_read" ON coordinators FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "coordinators_org_read" ON coordinators FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Courses, Subjects, Rooms (Academic)
-- =============================================================================

CREATE POLICY "courses_admin_all" ON courses FOR ALL TO authenticated USING (
    user_is_admin_or_coordinator() AND organization_id = current_user_org_id()
);
CREATE POLICY "courses_org_read" ON courses FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

CREATE POLICY "subjects_admin_all" ON subjects FOR ALL TO authenticated USING (
    user_is_admin_or_coordinator() AND organization_id = current_user_org_id()
);
CREATE POLICY "subjects_org_read" ON subjects FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

CREATE POLICY "rooms_admin_all" ON rooms FOR ALL TO authenticated USING (
    user_is_admin_or_coordinator() AND organization_id = current_user_org_id()
);
CREATE POLICY "rooms_org_read" ON rooms FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Semesters
-- =============================================================================

CREATE POLICY "semesters_admin_all" ON semesters FOR ALL TO authenticated USING (
    user_is_admin_or_coordinator() AND organization_id = current_user_org_id()
);
CREATE POLICY "semesters_org_read" ON semesters FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Teacher Availability
-- =============================================================================

CREATE POLICY "teacher_avail_admin_all" ON teacher_availabilities FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "teacher_avail_self_all" ON teacher_availabilities FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid())
);
CREATE POLICY "teacher_avail_teacher_read" ON teacher_availabilities FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Teacher Blocks
-- =============================================================================

CREATE POLICY "teacher_blocks_admin_all" ON teacher_blocks FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "teacher_blocks_self_all" ON teacher_blocks FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid())
);

-- =============================================================================
-- RLS POLICIES: Holidays
-- =============================================================================

CREATE POLICY "holidays_admin_all" ON holidays FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "holidays_org_read" ON holidays FOR SELECT TO authenticated USING (organization_id = current_user_org_id());

-- =============================================================================
-- RLS POLICIES: Classes
-- =============================================================================

CREATE POLICY "classes_admin_all" ON classes FOR ALL TO authenticated USING (
    user_is_admin_or_coordinator() AND organization_id = current_user_org_id()
);
CREATE POLICY "classes_teacher_read" ON classes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid())
);
CREATE POLICY "classes_student_own" ON classes FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.class_id = classes.id
        AND e.student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
    )
);

-- =============================================================================
-- RLS POLICIES: Class Sessions
-- =============================================================================

CREATE POLICY "sessions_admin_all" ON class_sessions FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "sessions_teacher_read" ON class_sessions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid())
);
CREATE POLICY "sessions_teacher_update" ON class_sessions FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid())
);
CREATE POLICY "sessions_student_read" ON class_sessions FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.class_id = class_id
        AND e.student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
    )
);

-- =============================================================================
-- RLS POLICIES: Enrollments
-- =============================================================================

CREATE POLICY "enrollments_admin_all" ON enrollments FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "enrollments_self_read" ON enrollments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid())
);
CREATE POLICY "enrollments_teacher_read" ON enrollments FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t JOIN classes c ON c.id = enrollments.class_id
        WHERE t.id = c.teacher_id AND t.user_id = auth.uid()
    )
);

-- =============================================================================
-- RLS POLICIES: Attendance
-- =============================================================================

CREATE POLICY "attendance_admin_all" ON attendance FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "attendance_self_read" ON attendance FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid())
);
CREATE POLICY "attendance_teacher_all" ON attendance FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM teachers t WHERE t.id = recorded_by AND t.user_id = auth.uid())
);
CREATE POLICY "attendance_teacher_read" ON attendance FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t JOIN classes c ON c.id = attendance.class_id
        WHERE t.id = c.teacher_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "attendance_student_sign" ON attendance FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid())
);

-- =============================================================================
-- RLS POLICIES: Attendance Signatures
-- =============================================================================

CREATE POLICY "signatures_admin_all" ON attendance_signatures FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "signatures_self_all" ON attendance_signatures FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid())
);

-- =============================================================================
-- RLS POLICIES: Materials
-- =============================================================================

CREATE POLICY "materials_admin_all" ON materials FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "materials_teacher_all" ON materials FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t JOIN classes c ON c.id = materials.class_id
        WHERE t.id = c.teacher_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "materials_student_read" ON materials FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM enrollments e WHERE e.class_id = materials.class_id
        AND e.student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
        AND materials.is_published = true
    )
);

-- =============================================================================
-- RLS POLICIES: Material Versions
-- =============================================================================

CREATE POLICY "material_versions_admin_all" ON material_versions FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "material_versions_teacher_read" ON material_versions FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM materials m JOIN classes c ON c.id = m.class_id
        JOIN teachers t ON t.id = c.teacher_id
        WHERE m.id = material_versions.material_id AND t.user_id = auth.uid()
    )
);

-- =============================================================================
-- RLS POLICIES: Assignments
-- =============================================================================

CREATE POLICY "assignments_admin_all" ON assignments FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "assignments_teacher_all" ON assignments FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t JOIN classes c ON c.id = assignments.class_id
        WHERE t.id = c.teacher_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "assignments_student_read" ON assignments FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM enrollments e WHERE e.class_id = assignments.class_id
        AND e.student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid())
        AND assignments.is_published = true
    )
);

-- =============================================================================
-- RLS POLICIES: Assignment Submissions
-- =============================================================================

CREATE POLICY "submissions_admin_all" ON assignment_submissions FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "submissions_teacher_all" ON assignment_submissions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM teachers t JOIN classes c ON c.id = assignment_submissions.class_id
        WHERE t.id = c.teacher_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "submissions_self_all" ON assignment_submissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.user_id = auth.uid())
);

-- =============================================================================
-- RLS POLICIES: Conversations
-- =============================================================================

CREATE POLICY "conversations_admin_all" ON conversations FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "conversations_participant_read" ON conversations FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id AND cp.user_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    )
);
CREATE POLICY "conversations_participant_all" ON conversations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id AND cp.user_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    )
);

-- =============================================================================
-- RLS POLICIES: Conversation Participants
-- =============================================================================

CREATE POLICY "participants_admin_all" ON conversation_participants FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "participants_self_all" ON conversation_participants FOR ALL TO authenticated USING (
    user_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);

-- =============================================================================
-- RLS POLICIES: Messages
-- =============================================================================

CREATE POLICY "messages_admin_all" ON messages FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "messages_participant_read" ON messages FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id AND cp.user_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    )
);
CREATE POLICY "messages_sender_all" ON messages FOR ALL TO authenticated USING (
    sender_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);

-- =============================================================================
-- RLS POLICIES: Message Attachments
-- =============================================================================

CREATE POLICY "attachments_admin_all" ON message_attachments FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "attachments_participant_read" ON message_attachments FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
        WHERE m.id = message_id AND cp.user_id IN (
            SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
        )
    )
);

-- =============================================================================
-- RLS POLICIES: Notifications
-- =============================================================================

CREATE POLICY "notifications_self_all" ON notifications FOR ALL TO authenticated USING (
    user_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);
CREATE POLICY "notifications_admin_all" ON notifications FOR ALL TO authenticated USING (user_is_admin_or_coordinator());

-- =============================================================================
-- RLS POLICIES: Reports
-- =============================================================================

CREATE POLICY "reports_admin_all" ON reports FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "reports_self_read" ON reports FOR SELECT TO authenticated USING (
    created_by_id = auth.uid()
);
CREATE POLICY "reports_teacher_read" ON reports FOR SELECT TO authenticated USING (
    user_has_role('teacher') AND organization_id = current_user_org_id()
);

-- =============================================================================
-- RLS POLICIES: Audit Logs
-- =============================================================================

CREATE POLICY "audit_logs_admin_all" ON audit_logs FOR ALL TO authenticated USING (user_is_admin_or_coordinator());
CREATE POLICY "audit_logs_self_read" ON audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- SEED DATA: Default Roles and Permissions
-- =============================================================================

INSERT INTO roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrador do sistema - acesso total'),
  ('00000000-0000-0000-0000-000000000002', 'coordinator', 'Coordenador acadêmico'),
  ('00000000-0000-0000-0000-000000000003', 'teacher', 'Professor'),
  ('00000000-0000-0000-0000-000000000004', 'student', 'Aluno')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (id, name, resource, action) VALUES
  ('10000000-0000-0000-0000-000000000001', 'users.create', 'users', 'create'),
  ('10000000-0000-0000-0000-000000000002', 'users.read', 'users', 'read'),
  ('10000000-0000-0000-0000-000000000003', 'users.update', 'users', 'update'),
  ('10000000-0000-0000-0000-000000000004', 'users.delete', 'users', 'delete'),
  ('10000000-0000-0000-0000-000000000005', 'teachers.create', 'teachers', 'create'),
  ('10000000-0000-0000-0000-000000000006', 'teachers.read', 'teachers', 'read'),
  ('10000000-0000-0000-0000-000000000007', 'teachers.update', 'teachers', 'update'),
  ('10000000-0000-0000-0000-000000000008', 'teachers.delete', 'teachers', 'delete'),
  ('10000000-0000-0000-0000-000000000009', 'students.create', 'students', 'create'),
  ('10000000-0000-0000-0000-00000000000a', 'students.read', 'students', 'read'),
  ('10000000-0000-0000-0000-00000000000b', 'students.update', 'students', 'update'),
  ('10000000-0000-0000-0000-00000000000c', 'students.delete', 'students', 'delete'),
  ('10000000-0000-0000-0000-00000000000d', 'courses.create', 'courses', 'create'),
  ('10000000-0000-0000-0000-00000000000e', 'courses.read', 'courses', 'read'),
  ('10000000-0000-0000-0000-00000000000f', 'courses.update', 'courses', 'update'),
  ('10000000-0000-0000-0000-000000000010', 'courses.delete', 'courses', 'delete'),
  ('10000000-0000-0000-0000-000000000011', 'classes.create', 'classes', 'create'),
  ('10000000-0000-0000-0000-000000000012', 'classes.read', 'classes', 'read'),
  ('10000000-0000-0000-0000-000000000013', 'classes.update', 'classes', 'update'),
  ('10000000-0000-0000-0000-000000000014', 'classes.delete', 'classes', 'delete'),
  ('10000000-0000-0000-0000-000000000015', 'schedule.create', 'schedule', 'create'),
  ('10000000-0000-0000-0000-000000000016', 'schedule.read', 'schedule', 'read'),
  ('10000000-0000-0000-0000-000000000017', 'schedule.update', 'schedule', 'update'),
  ('10000000-0000-0000-0000-000000000018', 'schedule.delete', 'schedule', 'delete'),
  ('10000000-0000-0000-0000-000000000019', 'availability.create', 'availability', 'create'),
  ('10000000-0000-0000-0000-00000000001a', 'availability.read', 'availability', 'read'),
  ('10000000-0000-0000-0000-00000000001b', 'availability.update', 'availability', 'update'),
  ('10000000-0000-0000-0000-00000000001c', 'availability.approve', 'availability', 'approve'),
  ('10000000-0000-0000-0000-00000000001d', 'availability.reject', 'availability', 'reject'),
  ('10000000-0000-0000-0000-00000000001e', 'attendance.create', 'attendance', 'create'),
  ('10000000-0000-0000-0000-00000000001f', 'attendance.read', 'attendance', 'read'),
  ('10000000-0000-0000-0000-000000000020', 'attendance.update', 'attendance', 'update'),
  ('10000000-0000-0000-0000-000000000021', 'attendance.sign', 'attendance', 'sign'),
  ('10000000-0000-0000-0000-000000000022', 'materials.create', 'materials', 'create'),
  ('10000000-0000-0000-0000-000000000023', 'materials.read', 'materials', 'read'),
  ('10000000-0000-0000-0000-000000000024', 'materials.update', 'materials', 'update'),
  ('10000000-0000-0000-0000-000000000025', 'materials.delete', 'materials', 'delete'),
  ('10000000-0000-0000-0000-000000000026', 'materials.publish', 'materials', 'publish'),
  ('10000000-0000-0000-0000-000000000027', 'assignments.create', 'assignments', 'create'),
  ('10000000-0000-0000-0000-000000000028', 'assignments.read', 'assignments', 'read'),
  ('10000000-0000-0000-0000-000000000029', 'assignments.update', 'assignments', 'update'),
  ('10000000-0000-0000-0000-00000000002a', 'assignments.delete', 'assignments', 'delete'),
  ('10000000-0000-0000-0000-00000000002b', 'assignments.grade', 'assignments', 'grade'),
  ('10000000-0000-0000-0000-00000000002c', 'messages.create', 'messages', 'create'),
  ('10000000-0000-0000-0000-00000000002d', 'messages.read', 'messages', 'read'),
  ('10000000-0000-0000-0000-00000000002e', 'messages.update', 'messages', 'update'),
  ('10000000-0000-0000-0000-00000000002f', 'messages.delete', 'messages', 'delete'),
  ('10000000-0000-0000-0000-000000000030', 'reports.create', 'reports', 'create'),
  ('10000000-0000-0000-0000-000000000031', 'reports.read', 'reports', 'read'),
  ('10000000-0000-0000-0000-000000000032', 'reports.export', 'reports', 'export'),
  ('10000000-0000-0000-0000-000000000033', 'semesters.create', 'semesters', 'create'),
  ('10000000-0000-0000-0000-000000000034', 'semesters.read', 'semesters', 'read'),
  ('10000000-0000-0000-0000-000000000035', 'semesters.update', 'semesters', 'update'),
  ('10000000-0000-0000-0000-000000000036', 'holidays.create', 'holidays', 'create'),
  ('10000000-0000-0000-0000-000000000037', 'holidays.read', 'holidays', 'read'),
  ('10000000-0000-0000-0000-000000000038', 'holidays.update', 'holidays', 'update'),
  ('10000000-0000-0000-0000-000000000039', 'enrollments.create', 'enrollments', 'create'),
  ('10000000-0000-0000-0000-00000000003a', 'enrollments.read', 'enrollments', 'read'),
  ('10000000-0000-0000-0000-00000000003b', 'enrollments.update', 'enrollments', 'update'),
  ('10000000-0000-0000-0000-00000000003c', 'enrollments.delete', 'enrollments', 'delete'),
  ('10000000-0000-0000-0000-00000000003d', 'ai.use', 'ai', 'use'),
  ('10000000-0000-0000-0000-00000000003e', 'subjects.create', 'subjects', 'create'),
  ('10000000-0000-0000-0000-00000000003f', 'subjects.read', 'subjects', 'read'),
  ('10000000-0000-0000-0000-000000000040', 'subjects.update', 'subjects', 'update'),
  ('10000000-0000-0000-0000-000000000041', 'rooms.create', 'rooms', 'create'),
  ('10000000-0000-0000-0000-000000000042', 'rooms.read', 'rooms', 'read'),
  ('10000000-0000-0000-0000-000000000043', 'rooms.update', 'rooms', 'update')
ON CONFLICT (name) DO NOTHING;

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Coordinator permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'coordinator'
  AND p.name NOT IN ('users.delete', 'teachers.delete', 'students.delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Teacher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'teacher'
  AND p.name IN (
    'users.read', 'students.read', 'courses.read', 'subjects.read', 'rooms.read',
    'classes.read', 'availability.create', 'availability.read', 'availability.update',
    'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
    'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    'reports.read', 'reports.export', 'ai.use', 'enrollments.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Student permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'student'
  AND p.name IN (
    'users.read', 'courses.read', 'subjects.read', 'classes.read',
    'attendance.read', 'materials.read', 'assignments.read',
    'messages.create', 'messages.read', 'enrollments.read', 'reports.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
