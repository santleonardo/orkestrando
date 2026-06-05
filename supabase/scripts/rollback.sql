-- =============================================================================
-- ORKESTRANDO - Rollback Script
-- Drops ALL tables in correct reverse-dependency order
-- WARNING: This will permanently delete all data. Use with extreme caution.
-- =============================================================================

BEGIN;

-- Drop tables with foreign key dependencies first (reverse order of creation)

-- RBAC junction tables
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Message Attachments (depends on messages)
DROP TABLE IF EXISTS message_attachments CASCADE;

-- Messages (depends on conversations, profiles)
DROP TABLE IF EXISTS messages CASCADE;

-- Conversation Participants (depends on conversations, profiles)
DROP TABLE IF EXISTS conversation_participants CASCADE;

-- Conversations (depends on organizations)
DROP TABLE IF EXISTS conversations CASCADE;

-- Notifications (depends on profiles, organizations)
DROP TABLE IF EXISTS notifications CASCADE;

-- Assignment Submissions (depends on assignments, students, classes)
DROP TABLE IF EXISTS assignment_submissions CASCADE;

-- Assignments (depends on organizations, classes)
DROP TABLE IF EXISTS assignments CASCADE;

-- Material Versions (depends on materials)
DROP TABLE IF EXISTS material_versions CASCADE;

-- Materials (depends on organizations, classes, profiles)
DROP TABLE IF EXISTS materials CASCADE;

-- Attendance Signatures (depends on attendance, students)
DROP TABLE IF EXISTS attendance_signatures CASCADE;

-- Attendance (depends on class_sessions, students, classes)
DROP TABLE IF EXISTS attendance CASCADE;

-- Enrollments (depends on students, classes, semesters, organizations)
DROP TABLE IF EXISTS enrollments CASCADE;

-- Class Sessions (depends on classes, teachers, rooms)
DROP TABLE IF EXISTS class_sessions CASCADE;

-- Classes (depends on organizations, courses, subjects, teachers, semesters, rooms)
DROP TABLE IF EXISTS classes CASCADE;

-- Holidays (depends on organizations)
DROP TABLE IF EXISTS holidays CASCADE;

-- Teacher Blocks (depends on teachers, organizations)
DROP TABLE IF EXISTS teacher_blocks CASCADE;

-- Teacher Availability (depends on teachers, organizations)
DROP TABLE IF EXISTS teacher_availabilities CASCADE;

-- Semesters (depends on organizations)
DROP TABLE IF EXISTS semesters CASCADE;

-- Rooms (depends on organizations)
DROP TABLE IF EXISTS rooms CASCADE;

-- Subjects (depends on organizations)
DROP TABLE IF EXISTS subjects CASCADE;

-- Courses (depends on organizations)
DROP TABLE IF EXISTS courses CASCADE;

-- Coordinators (depends on profiles, users, organizations)
DROP TABLE IF EXISTS coordinators CASCADE;

-- Students (depends on profiles, users, organizations)
DROP TABLE IF EXISTS students CASCADE;

-- Teachers (depends on profiles, users, organizations)
DROP TABLE IF EXISTS teachers CASCADE;

-- Profiles (depends on users, organizations)
DROP TABLE IF EXISTS profiles CASCADE;

-- Users (depends on organizations)
DROP TABLE IF EXISTS users CASCADE;

-- Roles and Permissions (RBAC)
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;

-- Organizations (root table)
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS current_user_org_id() CASCADE;
DROP FUNCTION IF EXISTS current_user_role() CASCADE;

-- Drop enum types (reverse of creation order)
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_format CASCADE;
DROP TYPE IF EXISTS assignment_material_type CASCADE;
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS conversation_role CASCADE;
DROP TYPE IF EXISTS conversation_type CASCADE;
DROP TYPE IF EXISTS holiday_type CASCADE;
DROP TYPE IF EXISTS block_type CASCADE;
DROP TYPE IF EXISTS room_type CASCADE;
DROP TYPE IF EXISTS course_modality CASCADE;
DROP TYPE IF EXISTS course_level CASCADE;
DROP TYPE IF EXISTS contract_type CASCADE;
DROP TYPE IF EXISTS recurring_pattern CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS material_type CASCADE;
DROP TYPE IF EXISTS availability_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;
DROP TYPE IF EXISTS class_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS user_auth_provider CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

COMMIT;

-- Optional: drop extension
-- DROP EXTENSION IF EXISTS "uuid-ossp";
