-- =============================================================================
-- ORKESTRANDO - Row Level Security (RLS) Policies
-- Versao corrigida - idempotente (pode ser re-executado)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on all tables (safe to run multiple times)
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
-- Helper functions in PUBLIC schema
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role::TEXT FROM public.profiles WHERE user_id = auth.uid()::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::text AND role = 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_coordinator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::text AND role = 'COORDINATOR');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- SUPER_ADMIN Policies (sees all data)
-- =============================================================================

DROP POLICY IF EXISTS "super_admin_all_orgs" ON organizations;
CREATE POLICY "super_admin_all_orgs" ON organizations
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_profiles" ON profiles;
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_permissions" ON permissions;
CREATE POLICY "super_admin_all_permissions" ON permissions
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_role_permissions" ON role_permissions;
CREATE POLICY "super_admin_all_role_permissions" ON role_permissions
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_teachers" ON teachers;
CREATE POLICY "super_admin_all_teachers" ON teachers
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_students" ON students;
CREATE POLICY "super_admin_all_students" ON students
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_coordinators" ON coordinators;
CREATE POLICY "super_admin_all_coordinators" ON coordinators
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_courses" ON courses;
CREATE POLICY "super_admin_all_courses" ON courses
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_subjects" ON subjects;
CREATE POLICY "super_admin_all_subjects" ON subjects
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_rooms" ON rooms;
CREATE POLICY "super_admin_all_rooms" ON rooms
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_semesters" ON semesters;
CREATE POLICY "super_admin_all_semesters" ON semesters
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_availabilities" ON teacher_availabilities;
CREATE POLICY "super_admin_all_availabilities" ON teacher_availabilities
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_blocks" ON teacher_blocks;
CREATE POLICY "super_admin_all_blocks" ON teacher_blocks
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_holidays" ON holidays;
CREATE POLICY "super_admin_all_holidays" ON holidays
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_classes" ON classes;
CREATE POLICY "super_admin_all_classes" ON classes
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_sessions" ON class_sessions;
CREATE POLICY "super_admin_all_sessions" ON class_sessions
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_enrollments" ON enrollments;
CREATE POLICY "super_admin_all_enrollments" ON enrollments
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_attendances" ON attendances;
CREATE POLICY "super_admin_all_attendances" ON attendances
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_signatures" ON attendance_signatures;
CREATE POLICY "super_admin_all_signatures" ON attendance_signatures
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_materials" ON materials;
CREATE POLICY "super_admin_all_materials" ON materials
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_assignments" ON assignments;
CREATE POLICY "super_admin_all_assignments" ON assignments
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_submissions" ON assignment_submissions;
CREATE POLICY "super_admin_all_submissions" ON assignment_submissions
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_conversations" ON conversations;
CREATE POLICY "super_admin_all_conversations" ON conversations
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_participants" ON conversation_participants;
CREATE POLICY "super_admin_all_participants" ON conversation_participants
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_messages" ON messages;
CREATE POLICY "super_admin_all_messages" ON messages
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_attachments" ON message_attachments;
CREATE POLICY "super_admin_all_attachments" ON message_attachments
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_notifications" ON notifications;
CREATE POLICY "super_admin_all_notifications" ON notifications
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_audit_logs" ON audit_logs;
CREATE POLICY "super_admin_all_audit_logs" ON audit_logs
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_reports" ON reports;
CREATE POLICY "super_admin_all_reports" ON reports
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_all_settings" ON session_settings;
CREATE POLICY "super_admin_all_settings" ON session_settings
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- =============================================================================
-- COORDINATOR Policies (sees only data from own organization)
-- =============================================================================

DROP POLICY IF EXISTS "coordinator_org_orgs" ON organizations;
CREATE POLICY "coordinator_org_orgs" ON organizations
  FOR SELECT USING (public.is_coordinator() AND id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_profiles" ON profiles;
CREATE POLICY "coordinator_org_profiles" ON profiles
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_teachers" ON teachers;
CREATE POLICY "coordinator_org_teachers" ON teachers
  FOR SELECT USING (public.is_coordinator() AND profile_id IN (SELECT id FROM public.profiles WHERE org_id = public.get_current_user_org_id()));

DROP POLICY IF EXISTS "coordinator_org_students" ON students;
CREATE POLICY "coordinator_org_students" ON students
  FOR SELECT USING (public.is_coordinator() AND profile_id IN (SELECT id FROM public.profiles WHERE org_id = public.get_current_user_org_id()));

DROP POLICY IF EXISTS "coordinator_org_courses" ON courses;
CREATE POLICY "coordinator_org_courses" ON courses
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_subjects" ON subjects;
CREATE POLICY "coordinator_org_subjects" ON subjects
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_rooms" ON rooms;
CREATE POLICY "coordinator_org_rooms" ON rooms
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_semesters" ON semesters;
CREATE POLICY "coordinator_org_semesters" ON semesters
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_availabilities" ON teacher_availabilities;
CREATE POLICY "coordinator_org_availabilities" ON teacher_availabilities
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_blocks" ON teacher_blocks;
CREATE POLICY "coordinator_org_blocks" ON teacher_blocks
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_holidays" ON holidays;
CREATE POLICY "coordinator_org_holidays" ON holidays
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_classes" ON classes;
CREATE POLICY "coordinator_org_classes" ON classes
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_sessions" ON class_sessions;
CREATE POLICY "coordinator_org_sessions" ON class_sessions
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_enrollments" ON enrollments;
CREATE POLICY "coordinator_org_enrollments" ON enrollments
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_attendances" ON attendances;
CREATE POLICY "coordinator_org_attendances" ON attendances
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_materials" ON materials;
CREATE POLICY "coordinator_org_materials" ON materials
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_assignments" ON assignments;
CREATE POLICY "coordinator_org_assignments" ON assignments
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_conversations" ON conversations;
CREATE POLICY "coordinator_org_conversations" ON conversations
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_messages" ON messages;
CREATE POLICY "coordinator_org_messages" ON messages
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_notifications" ON notifications;
CREATE POLICY "coordinator_org_notifications" ON notifications
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_reports" ON reports;
CREATE POLICY "coordinator_org_reports" ON reports
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

DROP POLICY IF EXISTS "coordinator_org_audit_logs" ON audit_logs;
CREATE POLICY "coordinator_org_audit_logs" ON audit_logs
  FOR SELECT USING (public.is_coordinator() AND org_id = public.get_current_user_org_id());

-- =============================================================================
-- PROFESSOR Policies (sees only own classes and related data)
-- =============================================================================

DROP POLICY IF EXISTS "professor_own_classes" ON classes;
CREATE POLICY "professor_own_classes" ON classes
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND teacher_id IN (SELECT id FROM public.teachers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );

DROP POLICY IF EXISTS "professor_own_sessions" ON class_sessions;
CREATE POLICY "professor_own_sessions" ON class_sessions
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text)))
  );

DROP POLICY IF EXISTS "professor_own_enrollments" ON enrollments;
CREATE POLICY "professor_own_enrollments" ON enrollments
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text)))
  );

DROP POLICY IF EXISTS "professor_own_attendances" ON attendances;
CREATE POLICY "professor_own_attendances" ON attendances
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND class_session_id IN (SELECT id FROM public.class_sessions WHERE class_id IN (SELECT id FROM public.classes WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))))
  );

DROP POLICY IF EXISTS "professor_own_materials" ON materials;
CREATE POLICY "professor_own_materials" ON materials
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text)
  );

-- =============================================================================
-- STUDENT Policies (sees only own enrollments, attendance, grades)
-- =============================================================================

DROP POLICY IF EXISTS "student_own_enrollments" ON enrollments;
CREATE POLICY "student_own_enrollments" ON enrollments
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );

DROP POLICY IF EXISTS "student_own_attendances" ON attendances;
CREATE POLICY "student_own_attendances" ON attendances
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );

DROP POLICY IF EXISTS "student_own_submissions" ON assignment_submissions;
CREATE POLICY "student_own_submissions" ON assignment_submissions
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );

DROP POLICY IF EXISTS "student_own_notifications" ON notifications;
CREATE POLICY "student_own_notifications" ON notifications
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "student_own_classes" ON classes;
CREATE POLICY "student_own_classes" ON classes
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND id IN (SELECT class_id FROM public.enrollments WHERE student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text)))
  );

DROP POLICY IF EXISTS "student_own_subjects" ON subjects;
CREATE POLICY "student_own_subjects" ON subjects
  FOR SELECT USING (
    org_id = public.get_current_user_org_id()
    AND id IN (SELECT subject_id FROM public.classes WHERE id IN (SELECT class_id FROM public.enrollments WHERE student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))))
  );

-- =============================================================================
-- Conversations and Messages (users see only conversations they belong to)
-- =============================================================================

DROP POLICY IF EXISTS "user_own_conversations" ON conversations;
CREATE POLICY "user_own_conversations" ON conversations
  FOR SELECT USING (
    id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );

DROP POLICY IF EXISTS "user_own_messages" ON messages;
CREATE POLICY "user_own_messages" ON messages
  FOR SELECT USING (
    conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );

DROP POLICY IF EXISTS "user_own_participants" ON conversation_participants;
CREATE POLICY "user_own_participants" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::text))
  );
