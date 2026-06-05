-- =============================================================================
-- ORKESTRANDO - Seed Script
-- Inserts default roles, permissions, role-permission mappings, and sample data
-- Run AFTER 001_initial_schema.sql migration
-- =============================================================================

-- =============================================================================
-- ROLES
-- =============================================================================

INSERT INTO roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrador do sistema - acesso total a todas as funcionalidades'),
  ('00000000-0000-0000-0000-000000000002', 'coordinator', 'Coordenador acadêmico - gerencia turmas, professores, alunos e horários'),
  ('00000000-0000-0000-0000-000000000003', 'teacher', 'Professor - gerencia suas aulas, materiais, frequência e disponibilidade'),
  ('00000000-0000-0000-0000-000000000004', 'student', 'Aluno - visualiza turmas, materiais, frequência e notas')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- PERMISSIONS (all resource.action pairs from the PERMISSIONS constant)
-- =============================================================================

INSERT INTO permissions (id, name, resource, action, description) VALUES
  -- Users
  ('10000000-0000-0000-0000-000000000001', 'users.create', 'users', 'create', 'Criar novos usuários'),
  ('10000000-0000-0000-0000-000000000002', 'users.read', 'users', 'read', 'Visualizar dados de usuários'),
  ('10000000-0000-0000-0000-000000000003', 'users.update', 'users', 'update', 'Atualizar dados de usuários'),
  ('10000000-0000-0000-0000-000000000004', 'users.delete', 'users', 'delete', 'Excluir usuários'),
  -- Organizations
  ('10000000-0000-0000-0000-000000000005', 'organizations.create', 'organizations', 'create', 'Criar organizações'),
  ('10000000-0000-0000-0000-000000000006', 'organizations.read', 'organizations', 'read', 'Visualizar dados da organização'),
  ('10000000-0000-0000-0000-000000000007', 'organizations.update', 'organizations', 'update', 'Atualizar dados da organização'),
  ('10000000-0000-0000-0000-000000000008', 'organizations.delete', 'organizations', 'delete', 'Excluir organizações'),
  -- Teachers
  ('10000000-0000-0000-0000-000000000009', 'teachers.create', 'teachers', 'create', 'Cadastrar professores'),
  ('10000000-0000-0000-0000-00000000000a', 'teachers.read', 'teachers', 'read', 'Visualizar dados de professores'),
  ('10000000-0000-0000-0000-00000000000b', 'teachers.update', 'teachers', 'update', 'Atualizar dados de professores'),
  ('10000000-0000-0000-0000-00000000000c', 'teachers.delete', 'teachers', 'delete', 'Excluir professores'),
  -- Students
  ('10000000-0000-0000-0000-00000000000d', 'students.create', 'students', 'create', 'Cadastrar alunos'),
  ('10000000-0000-0000-0000-00000000000e', 'students.read', 'students', 'read', 'Visualizar dados de alunos'),
  ('10000000-0000-0000-0000-00000000000f', 'students.update', 'students', 'update', 'Atualizar dados de alunos'),
  ('10000000-0000-0000-0000-000000000010', 'students.delete', 'students', 'delete', 'Excluir alunos'),
  -- Coordinators
  ('10000000-0000-0000-0000-000000000011', 'coordinators.create', 'coordinators', 'create', 'Cadastrar coordenadores'),
  ('10000000-0000-0000-0000-000000000012', 'coordinators.read', 'coordinators', 'read', 'Visualizar dados de coordenadores'),
  ('10000000-0000-0000-0000-000000000013', 'coordinators.update', 'coordinators', 'update', 'Atualizar dados de coordenadores'),
  ('10000000-0000-0000-0000-000000000014', 'coordinators.delete', 'coordinators', 'delete', 'Excluir coordenadores'),
  -- Courses
  ('10000000-0000-0000-0000-000000000015', 'courses.create', 'courses', 'create', 'Criar cursos'),
  ('10000000-0000-0000-0000-000000000016', 'courses.read', 'courses', 'read', 'Visualizar cursos'),
  ('10000000-0000-0000-0000-000000000017', 'courses.update', 'courses', 'update', 'Atualizar cursos'),
  ('10000000-0000-0000-0000-000000000018', 'courses.delete', 'courses', 'delete', 'Excluir cursos'),
  -- Subjects
  ('10000000-0000-0000-0000-000000000019', 'subjects.create', 'subjects', 'create', 'Criar disciplinas'),
  ('10000000-0000-0000-0000-00000000001a', 'subjects.read', 'subjects', 'read', 'Visualizar disciplinas'),
  ('10000000-0000-0000-0000-00000000001b', 'subjects.update', 'subjects', 'update', 'Atualizar disciplinas'),
  ('10000000-0000-0000-0000-00000000001c', 'subjects.delete', 'subjects', 'delete', 'Excluir disciplinas'),
  -- Rooms
  ('10000000-0000-0000-0000-00000000001d', 'rooms.create', 'rooms', 'create', 'Criar salas'),
  ('10000000-0000-0000-0000-00000000001e', 'rooms.read', 'rooms', 'read', 'Visualizar salas'),
  ('10000000-0000-0000-0000-00000000001f', 'rooms.update', 'rooms', 'update', 'Atualizar salas'),
  ('10000000-0000-0000-0000-000000000020', 'rooms.delete', 'rooms', 'delete', 'Excluir salas'),
  -- Classes
  ('10000000-0000-0000-0000-000000000021', 'classes.create', 'classes', 'create', 'Criar turmas'),
  ('10000000-0000-0000-0000-000000000022', 'classes.read', 'classes', 'read', 'Visualizar turmas'),
  ('10000000-0000-0000-0000-000000000023', 'classes.update', 'classes', 'update', 'Atualizar turmas'),
  ('10000000-0000-0000-0000-000000000024', 'classes.delete', 'classes', 'delete', 'Excluir turmas'),
  -- Schedule
  ('10000000-0000-0000-0000-000000000025', 'schedule.create', 'schedule', 'create', 'Criar agendamentos'),
  ('10000000-0000-0000-0000-000000000026', 'schedule.read', 'schedule', 'read', 'Visualizar agendamentos'),
  ('10000000-0000-0000-0000-000000000027', 'schedule.update', 'schedule', 'update', 'Atualizar agendamentos'),
  ('10000000-0000-0000-0000-000000000028', 'schedule.delete', 'schedule', 'delete', 'Excluir agendamentos'),
  -- Availability
  ('10000000-0000-0000-0000-000000000029', 'availability.create', 'availability', 'create', 'Criar disponibilidade'),
  ('10000000-0000-0000-0000-00000000002a', 'availability.read', 'availability', 'read', 'Visualizar disponibilidade'),
  ('10000000-0000-0000-0000-00000000002b', 'availability.update', 'availability', 'update', 'Atualizar disponibilidade'),
  ('10000000-0000-0000-0000-00000000002c', 'availability.delete', 'availability', 'delete', 'Excluir disponibilidade'),
  ('10000000-0000-0000-0000-00000000002d', 'availability.approve', 'availability', 'approve', 'Aprovar disponibilidade'),
  ('10000000-0000-0000-0000-00000000002e', 'availability.reject', 'availability', 'reject', 'Rejeitar disponibilidade'),
  -- Attendance
  ('10000000-0000-0000-0000-00000000002f', 'attendance.create', 'attendance', 'create', 'Registrar frequência'),
  ('10000000-0000-0000-0000-000000000030', 'attendance.read', 'attendance', 'read', 'Visualizar frequência'),
  ('10000000-0000-0000-0000-000000000031', 'attendance.update', 'attendance', 'update', 'Atualizar frequência'),
  ('10000000-0000-0000-0000-000000000032', 'attendance.sign', 'attendance', 'sign', 'Assinar digitalmente frequência'),
  -- Materials
  ('10000000-0000-0000-0000-000000000033', 'materials.create', 'materials', 'create', 'Criar materiais didáticos'),
  ('10000000-0000-0000-0000-000000000034', 'materials.read', 'materials', 'read', 'Visualizar materiais didáticos'),
  ('10000000-0000-0000-0000-000000000035', 'materials.update', 'materials', 'update', 'Atualizar materiais didáticos'),
  ('10000000-0000-0000-0000-000000000036', 'materials.delete', 'materials', 'delete', 'Excluir materiais didáticos'),
  ('10000000-0000-0000-0000-000000000037', 'materials.publish', 'materials', 'publish', 'Publicar materiais didáticos'),
  -- Assignments
  ('10000000-0000-0000-0000-000000000038', 'assignments.create', 'assignments', 'create', 'Criar atividades/avaliações'),
  ('10000000-0000-0000-0000-000000000039', 'assignments.read', 'assignments', 'read', 'Visualizar atividades/avaliações'),
  ('10000000-0000-0000-0000-00000000003a', 'assignments.update', 'assignments', 'update', 'Atualizar atividades/avaliações'),
  ('10000000-0000-0000-0000-00000000003b', 'assignments.delete', 'assignments', 'delete', 'Excluir atividades/avaliações'),
  ('10000000-0000-0000-0000-00000000003c', 'assignments.grade', 'assignments', 'grade', 'Atribuir notas a atividades'),
  -- Messages
  ('10000000-0000-0000-0000-00000000003d', 'messages.create', 'messages', 'create', 'Enviar mensagens'),
  ('10000000-0000-0000-0000-00000000003e', 'messages.read', 'messages', 'read', 'Visualizar mensagens'),
  ('10000000-0000-0000-0000-00000000003f', 'messages.update', 'messages', 'update', 'Atualizar mensagens'),
  ('10000000-0000-0000-0000-000000000040', 'messages.delete', 'messages', 'delete', 'Excluir mensagens'),
  -- Reports
  ('10000000-0000-0000-0000-000000000041', 'reports.create', 'reports', 'create', 'Criar relatórios'),
  ('10000000-0000-0000-0000-000000000042', 'reports.read', 'reports', 'read', 'Visualizar relatórios'),
  ('10000000-0000-0000-0000-000000000043', 'reports.export', 'reports', 'export', 'Exportar relatórios'),
  -- Audit
  ('10000000-0000-0000-0000-000000000044', 'audit.read', 'audit', 'read', 'Visualizar logs de auditoria'),
  -- Notifications
  ('10000000-0000-0000-0000-000000000045', 'notifications.manage', 'notifications', 'manage', 'Gerenciar notificações'),
  -- Semesters
  ('10000000-0000-0000-0000-000000000046', 'semesters.create', 'semesters', 'create', 'Criar semestres'),
  ('10000000-0000-0000-0000-000000000047', 'semesters.read', 'semesters', 'read', 'Visualizar semestres'),
  ('10000000-0000-0000-0000-000000000048', 'semesters.update', 'semesters', 'update', 'Atualizar semestres'),
  ('10000000-0000-0000-0000-000000000049', 'semesters.delete', 'semesters', 'delete', 'Excluir semestres'),
  -- Holidays
  ('10000000-0000-0000-0000-00000000004a', 'holidays.create', 'holidays', 'create', 'Criar feriados'),
  ('10000000-0000-0000-0000-00000000004b', 'holidays.read', 'holidays', 'read', 'Visualizar feriados'),
  ('10000000-0000-0000-0000-00000000004c', 'holidays.update', 'holidays', 'update', 'Atualizar feriados'),
  ('10000000-0000-0000-0000-00000000004d', 'holidays.delete', 'holidays', 'delete', 'Excluir feriados'),
  -- AI
  ('10000000-0000-0000-0000-00000000004e', 'ai.use', 'ai', 'use', 'Usar funcionalidades de IA'),
  ('10000000-0000-0000-0000-00000000004f', 'ai.admin', 'ai', 'admin', 'Administrar configurações de IA'),
  -- Enrollments
  ('10000000-0000-0000-0000-000000000050', 'enrollments.create', 'enrollments', 'create', 'Criar matrículas'),
  ('10000000-0000-0000-0000-000000000051', 'enrollments.read', 'enrollments', 'read', 'Visualizar matrículas'),
  ('10000000-0000-0000-0000-000000000052', 'enrollments.update', 'enrollments', 'update', 'Atualizar matrículas'),
  ('10000000-0000-0000-0000-000000000053', 'enrollments.delete', 'enrollments', 'delete', 'Excluir matrículas')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- ROLE-PERMISSION MAPPINGS
-- =============================================================================

-- Admin gets ALL permissions (excluding enrollments.delete for safety)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Coordinator permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'coordinator'
  AND p.name IN (
    'users.create', 'users.read', 'users.update',
    'teachers.create', 'teachers.read', 'teachers.update',
    'students.create', 'students.read', 'students.update',
    'courses.create', 'courses.read', 'courses.update',
    'subjects.create', 'subjects.read', 'subjects.update',
    'rooms.create', 'rooms.read', 'rooms.update',
    'classes.create', 'classes.read', 'classes.update', 'classes.delete',
    'schedule.create', 'schedule.read', 'schedule.update', 'schedule.delete',
    'availability.create', 'availability.read', 'availability.update', 'availability.approve', 'availability.reject',
    'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
    'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    'reports.create', 'reports.read', 'reports.export',
    'semesters.create', 'semesters.read', 'semesters.update',
    'holidays.create', 'holidays.read', 'holidays.update',
    'ai.use',
    'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Teacher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'teacher'
  AND p.name IN (
    'users.read',
    'students.read',
    'courses.read',
    'subjects.read',
    'rooms.read',
    'classes.read',
    'availability.create', 'availability.read', 'availability.update',
    'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
    'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    'reports.read', 'reports.export',
    'ai.use',
    'enrollments.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Student permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'student'
  AND p.name IN (
    'users.read',
    'courses.read',
    'subjects.read',
    'classes.read',
    'attendance.read',
    'materials.read',
    'assignments.read',
    'messages.create', 'messages.read',
    'enrollments.read',
    'reports.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- DEFAULT ORGANIZATION
-- =============================================================================

INSERT INTO organizations (id, name, slug, city, state, country, settings) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ORKESTRANDO Demo', 'orkestrando-demo', 'São Paulo', 'SP', 'Brasil', '{"theme": "emerald", "language": "pt-BR"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- SAMPLE BRAZILIAN HOLIDAYS (for the default org)
-- =============================================================================

INSERT INTO holidays (organization_id, name, date, type, is_recurring, affects_classes) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Carnaval', '2025-03-04', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Carnaval', '2025-03-05', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Sexta-feira Santa', '2025-04-18', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Tiradentes', '2025-04-21', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Dia do Trabalho', '2025-05-01', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Corpus Christi', '2025-06-19', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Independência do Brasil', '2025-09-07', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Nossa Senhora Aparecida', '2025-10-12', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Finados', '2025-11-02', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Proclamação da República', '2025-11-15', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Natal', '2025-12-25', 'national', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Confraternização Universal', '2026-01-01', 'national', true, true)
ON CONFLICT DO NOTHING;
