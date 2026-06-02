-- =============================================================================
-- ORKESTRANDO - Row Level Security (RLS) Policies
-- Enables fine-grained access control for Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on all tables
-- -----------------------------------------------------------------------------

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Helper function: Get current user's org_id and role from auth.jwt()
-- =============================================================================

CREATE OR REPLACE FUNCTION auth.current_org_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT org_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.current_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role::TEXT FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- SUPER_ADMIN Policies (sees all data across all organizations)
-- =============================================================================

-- Organizations
CREATE POLICY "super_admin_select_all" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- Profiles
CREATE POLICY "super_admin_select_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- =============================================================================
-- COORDINATOR Policies (sees only data from their own organization)
-- =============================================================================

-- Organizations: Coordinators can view their own org
CREATE POLICY "coordinator_select_own_org" ON organizations
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      role = 'SUPER_ADMIN'
      OR id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Profiles: Coordinators see profiles in their org
CREATE POLICY "coordinator_select_org_profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id = auth.current_org_id()
    )
  );

-- Teachers: Coordinators see teachers in their org
CREATE POLICY "coordinator_select_org_teachers" ON teachers
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Students: Coordinators see students in their org
CREATE POLICY "coordinator_select_org_students" ON students
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Classes: Coordinators see classes in their org
CREATE POLICY "coordinator_select_org_classes" ON classes
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Class Sessions
CREATE POLICY "coordinator_select_org_sessions" ON class_sessions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Enrollments
CREATE POLICY "coordinator_select_org_enrollments" ON enrollments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Attendances
CREATE POLICY "coordinator_select_org_attendances" ON attendances
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Courses
CREATE POLICY "coordinator_select_org_courses" ON courses
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Subjects
CREATE POLICY "coordinator_select_org_subjects" ON subjects
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Rooms
CREATE POLICY "coordinator_select_org_rooms" ON rooms
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Semesters
CREATE POLICY "coordinator_select_org_semesters" ON semesters
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Teacher Availabilities
CREATE POLICY "coordinator_select_org_availabilities" ON teacher_availabilities
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Teacher Blocks
CREATE POLICY "coordinator_select_org_blocks" ON teacher_blocks
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Holidays
CREATE POLICY "coordinator_select_org_holidays" ON holidays
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Conversations
CREATE POLICY "coordinator_select_org_conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Messages
CREATE POLICY "coordinator_select_org_messages" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Notifications
CREATE POLICY "coordinator_select_org_notifications" ON notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Reports
CREATE POLICY "coordinator_select_org_reports" ON reports
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Audit Logs
CREATE POLICY "coordinator_select_org_audit_logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Materials
CREATE POLICY "coordinator_select_org_materials" ON materials
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Assignments
CREATE POLICY "coordinator_select_org_assignments" ON assignments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

-- =============================================================================
-- PROFESSOR Policies (sees only their own classes and related data)
-- =============================================================================

-- Classes: Professors see only classes they teach
CREATE POLICY "professor_select_own_classes" ON classes
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'COORDINATOR')
      OR teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())
    )
  );

-- Class Sessions: Professors see sessions for their classes
CREATE POLICY "professor_select_own_sessions" ON class_sessions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR'))
      OR class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()))
    )
  );

-- Enrollments: Professors see enrollments in their classes
CREATE POLICY "professor_select_class_enrollments" ON enrollments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR'))
      OR class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()))
    )
  );

-- Attendances: Professors see attendance for their class sessions
CREATE POLICY "professor_select_session_attendances" ON attendances
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR'))
      OR class_session_id IN (SELECT id FROM class_sessions WHERE class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())))
    )
  );

-- =============================================================================
-- STUDENT Policies (sees only their own enrollments, attendance, grades)
-- =============================================================================

-- Enrollments: Students see only their own enrollments
CREATE POLICY "student_select_own_enrollments" ON enrollments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR'))
      OR student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    )
  );

-- Attendances: Students see only their own attendance
CREATE POLICY "student_select_own_attendances" ON attendances
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR'))
      OR student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    )
  );

-- Assignment Submissions: Students see only their own submissions
CREATE POLICY "student_select_own_submissions" ON assignment_submissions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR', 'PROFESSOR'))
      OR student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    )
  );

-- Notifications: Users see only their own notifications
CREATE POLICY "user_select_own_notifications" ON notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR profile_id = auth.uid()
    )
  );

-- Messages: Users see messages in conversations they're part of
CREATE POLICY "user_select_own_messages" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN')
      OR conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid())
    )
  );

-- Conversations: Users see conversations they're part of
CREATE POLICY "user_select_own_conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'COORDINATOR'))
      OR id IN (SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid())
    )
  );

-- =============================================================================
-- INSERT/UPDATE/DELETE Policies (basic - restricted to service role for now)
-- =============================================================================

-- Service role bypasses RLS for all mutations (used by API routes with service role key)
-- All INSERT/UPDATE/DELETE operations are handled through API routes that use
-- the service role key, which bypasses RLS entirely.

-- =============================================================================
-- Realtime Subscription Policies
-- =============================================================================

-- Allow realtime subscriptions for users in the same organization
ALTER PUBLICATION supabase_realtime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "realtime_coordinator" ON supabase_realtime
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'SUPER_ADMIN'
        OR p.org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
      )
    )
  );
