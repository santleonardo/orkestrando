-- ============================================
-- ORKESTRANDO - Initial Seed Data
-- Permissions, Roles, Organization, Sample Users
-- ============================================

-- ============================================
-- 1. Permissions (Permissoes)
-- ============================================

INSERT INTO "permissions" ("id", "name", "description", "module") VALUES
  ('perm-0001', 'manage_teachers', 'Gerenciar professores (CRUD, disponibilidade, bloqueios)', 'teachers'),
  ('perm-0002', 'manage_students', 'Gerenciar alunos (matrículas, histórico, status)', 'students'),
  ('perm-0003', 'manage_classes', 'Gerenciar turmas (criação, edição, cancelamento)', 'classes'),
  ('perm-0004', 'manage_subjects', 'Gerenciar disciplinas (CRUD, pré-requisitos, ementas)', 'subjects'),
  ('perm-0005', 'manage_rooms', 'Gerenciar salas (CRUD, recursos, disponibilidade)', 'rooms'),
  ('perm-0006', 'manage_schedules', 'Gerenciar horários e grade de aulas', 'schedules'),
  ('perm-0007', 'view_reports', 'Visualizar relatórios e dashboards', 'reports'),
  ('perm-0008', 'manage_materials', 'Gerenciar materiais didáticos (upload, publicação)', 'materials'),
  ('perm-0009', 'manage_messages', 'Gerenciar mensagens e conversas', 'messages'),
  ('perm-0010', 'manage_attendance', 'Gerenciar frequência e assinaturas', 'attendance'),
  ('perm-0011', 'manage_enrollments', 'Gerenciar matrículas em turmas', 'enrollments'),
  ('perm-0012', 'manage_availability', 'Gerenciar disponibilidade de professores', 'availability'),
  ('perm-0013', 'manage_semesters', 'Gerenciar semestres letivos', 'semesters'),
  ('perm-0014', 'manage_courses', 'Gerenciar cursos (graduação, pós, técnico)', 'courses'),
  ('perm-0015', 'manage_announcements', 'Criar e gerenciar comunicados/avisos', 'announcements'),
  ('perm-0016', 'ai_features', 'Acessar funcionalidades de IA (sugestões, assistente)', 'ai'),
  ('perm-0017', 'audit_logs', 'Visualizar logs de auditoria do sistema', 'audit');

-- ============================================
-- 2. Role Permissions (PermissaoPapel)
-- ============================================

-- SUPER_ADMIN: Todas as permissoes
INSERT INTO "role_permissions" ("id", "role_id", "permission_id") VALUES
  ('rp-0001', 'SUPER_ADMIN', 'perm-0001'),
  ('rp-0002', 'SUPER_ADMIN', 'perm-0002'),
  ('rp-0003', 'SUPER_ADMIN', 'perm-0003'),
  ('rp-0004', 'SUPER_ADMIN', 'perm-0004'),
  ('rp-0005', 'SUPER_ADMIN', 'perm-0005'),
  ('rp-0006', 'SUPER_ADMIN', 'perm-0006'),
  ('rp-0007', 'SUPER_ADMIN', 'perm-0007'),
  ('rp-0008', 'SUPER_ADMIN', 'perm-0008'),
  ('rp-0009', 'SUPER_ADMIN', 'perm-0009'),
  ('rp-0010', 'SUPER_ADMIN', 'perm-0010'),
  ('rp-0011', 'SUPER_ADMIN', 'perm-0011'),
  ('rp-0012', 'SUPER_ADMIN', 'perm-0012'),
  ('rp-0013', 'SUPER_ADMIN', 'perm-0013'),
  ('rp-0014', 'SUPER_ADMIN', 'perm-0014'),
  ('rp-0015', 'SUPER_ADMIN', 'perm-0015'),
  ('rp-0016', 'SUPER_ADMIN', 'perm-0016'),
  ('rp-0017', 'SUPER_ADMIN', 'perm-0017');

-- COORDINATOR: Gerenciamento acadêmico completo (sem audit_logs)
INSERT INTO "role_permissions" ("id", "role_id", "permission_id") VALUES
  ('rp-0101', 'COORDINATOR', 'perm-0001'),
  ('rp-0102', 'COORDINATOR', 'perm-0002'),
  ('rp-0103', 'COORDINATOR', 'perm-0003'),
  ('rp-0104', 'COORDINATOR', 'perm-0004'),
  ('rp-0105', 'COORDINATOR', 'perm-0005'),
  ('rp-0106', 'COORDINATOR', 'perm-0006'),
  ('rp-0107', 'COORDINATOR', 'perm-0007'),
  ('rp-0108', 'COORDINATOR', 'perm-0008'),
  ('rp-0109', 'COORDINATOR', 'perm-0009'),
  ('rp-0110', 'COORDINATOR', 'perm-0010'),
  ('rp-0111', 'COORDINATOR', 'perm-0011'),
  ('rp-0112', 'COORDINATOR', 'perm-0012'),
  ('rp-0113', 'COORDINATOR', 'perm-0013'),
  ('rp-0114', 'COORDINATOR', 'perm-0014'),
  ('rp-0115', 'COORDINATOR', 'perm-0015'),
  ('rp-0116', 'COORDINATOR', 'perm-0016');

-- PROFESSOR: Gestão de aula, frequência, materiais e trabalhos
INSERT INTO "role_permissions" ("id", "role_id", "permission_id") VALUES
  ('rp-0201', 'PROFESSOR', 'perm-0008'),  -- manage_materials
  ('rp-0202', 'PROFESSOR', 'perm-0009'),  -- manage_messages
  ('rp-0203', 'PROFESSOR', 'perm-0010'),  -- manage_attendance
  ('rp-0204', 'PROFESSOR', 'perm-0016');  -- ai_features

-- STUDENT: Acesso a materiais, mensagens e visualização
INSERT INTO "role_permissions" ("id", "role_id", "permission_id") VALUES
  ('rp-0301', 'STUDENT', 'perm-0009'),    -- manage_messages
  ('rp-0302', 'STUDENT', 'perm-0016');    -- ai_features

-- ASSISTANT: Assistente administrativo com acesso limitado
INSERT INTO "role_permissions" ("id", "role_id", "permission_id") VALUES
  ('rp-0401', 'ASSISTANT', 'perm-0002'),   -- manage_students
  ('rp-0402', 'ASSISTANT', 'perm-0003'),   -- manage_classes
  ('rp-0403', 'ASSISTANT', 'perm-0005'),   -- manage_rooms
  ('rp-0404', 'ASSISTANT', 'perm-0006'),   -- manage_schedules
  ('rp-0405', 'ASSISTANT', 'perm-0009'),   -- manage_messages
  ('rp-0406', 'ASSISTANT', 'perm-0010'),   -- manage_attendance
  ('rp-0407', 'ASSISTANT', 'perm-0011'),   -- manage_enrollments
  ('rp-0408', 'ASSISTANT', 'perm-0015');   -- manage_announcements

-- ============================================
-- 3. Sample Organization (Organizacao)
-- ============================================

INSERT INTO "organizations" ("id", "name", "slug", "logo", "settings", "created_at", "updated_at") VALUES
  (
    'org-0001',
    'ORKESTRANDO - Sistema Acadêmico',
    'orkestrando',
    NULL,
    '{"language": "pt-BR", "timezone": "America/Sao_Paulo", "academicCalendar": {"startMonth": "february", "endMonth": "december", "breaks": ["july", "december"]}, "attendance": {"maxAbsences": 25, "lateThreshold": 15}, "grading": {"scale": "0-10", "passingGrade": 6.0}, "notifications": {"emailEnabled": true, "pushEnabled": true, "smsEnabled": false}}'::jsonb,
    NOW(),
    NOW()
  );

-- ============================================
-- 4. Sample Profiles and Users
-- ============================================

-- 4a. Coordinator Profile
INSERT INTO "profiles" ("id", "user_id", "org_id", "role", "first_name", "last_name", "email", "phone", "avatar", "is_active", "created_at", "updated_at") VALUES
  (
    'profile-0001',
    'auth-coordinator-001',
    'org-0001',
    'COORDINATOR',
    'Maria',
    'Silva',
    'maria.silva@orkestrando.edu.br',
    '+55-11-99999-0001',
    NULL,
    TRUE,
    NOW(),
    NOW()
  );

-- 4b. Professor Profile
INSERT INTO "profiles" ("id", "user_id", "org_id", "role", "first_name", "last_name", "email", "phone", "avatar", "is_active", "created_at", "updated_at") VALUES
  (
    'profile-0002',
    'auth-professor-001',
    'org-0001',
    'PROFESSOR',
    'João',
    'Santos',
    'joao.santos@orkestrando.edu.br',
    '+55-11-99999-0002',
    NULL,
    TRUE,
    NOW(),
    NOW()
  );

-- 4c. Student Profile
INSERT INTO "profiles" ("id", "user_id", "org_id", "role", "first_name", "last_name", "email", "phone", "avatar", "is_active", "created_at", "updated_at") VALUES
  (
    'profile-0003',
    'auth-student-001',
    'org-0001',
    'STUDENT',
    'Ana',
    'Oliveira',
    'ana.oliveira@orkestrando.edu.br',
    '+55-11-99999-0003',
    NULL,
    TRUE,
    NOW(),
    NOW()
  );

-- 4d. Super Admin Profile
INSERT INTO "profiles" ("id", "user_id", "org_id", "role", "first_name", "last_name", "email", "phone", "avatar", "is_active", "created_at", "updated_at") VALUES
  (
    'profile-0000',
    'auth-admin-001',
    'org-0001',
    'SUPER_ADMIN',
    'Admin',
    'ORKESTRANDO',
    'admin@orkestrando.edu.br',
    NULL,
    NULL,
    TRUE,
    NOW(),
    NOW()
  );

-- 4e. Assistant Profile
INSERT INTO "profiles" ("id", "user_id", "org_id", "role", "first_name", "last_name", "email", "phone", "avatar", "is_active", "created_at", "updated_at") VALUES
  (
    'profile-0004',
    'auth-assistant-001',
    'org-0001',
    'ASSISTANT',
    'Carlos',
    'Pereira',
    'carlos.pereira@orkestrando.edu.br',
    '+55-11-99999-0004',
    NULL,
    TRUE,
    NOW(),
    NOW()
  );

-- ============================================
-- 5. Sample Coordinator
-- ============================================

INSERT INTO "coordinators" ("id", "profile_id", "department", "level", "created_at") VALUES
  (
    'coord-0001',
    'profile-0001',
    'Ciência da Computação',
    3,
    NOW()
  );

-- ============================================
-- 6. Sample Teacher
-- ============================================

INSERT INTO "teachers" ("id", "profile_id", "department", "specializations", "hire_date", "bio", "created_at") VALUES
  (
    'teacher-0001',
    'profile-0002',
    'Ciência da Computação',
    ARRAY['Algoritmos', 'Estrutura de Dados', 'Programação Orientada a Objetos', 'Banco de Dados'],
    '2020-03-01',
    'Doutor em Ciência da Computação pela USP com mais de 10 anos de experiência em ensino superior. Especialista em algoritmos e estruturas de dados, com pesquisas na área de inteligência artificial e aprendizado de máquina.',
    NOW()
  );

-- ============================================
-- 7. Sample Student
-- ============================================

INSERT INTO "students" ("id", "profile_id", "enrollment_number", "course", "semester", "shift", "status", "created_at") VALUES
  (
    'student-0001',
    'profile-0003',
    '2024001',
    'Ciência da Computação',
    3,
    'Integral',
    'active',
    NOW()
  );

-- ============================================
-- 8. Sample Courses
-- ============================================

INSERT INTO "courses" ("id", "org_id", "name", "code", "description", "duration", "total_credits", "is_active", "created_at") VALUES
  (
    'course-0001',
    'org-0001',
    'Ciência da Computação',
    'CC',
    'Curso de Bacharelado em Ciência da Computação com foco em formação teórica e prática em algoritmos, programação, banco de dados, redes e inteligência artificial.',
    8,
    320,
    TRUE,
    NOW()
  ),
  (
    'course-0002',
    'org-0001',
    'Sistemas de Informação',
    'SI',
    'Curso de Bacharelado em Sistemas de Informação com ênfase em desenvolvimento de software, gestão de projetos e análise de sistemas.',
    8,
    300,
    TRUE,
    NOW()
  ),
  (
    'course-0003',
    'org-0001',
    'Engenharia de Software',
    'ES',
    'Curso de Bacharelado em Engenharia de Software com foco em metodologias ágeis, qualidade de software e arquitetura de sistemas.',
    10,
    360,
    TRUE,
    NOW()
  );

-- ============================================
-- 9. Sample Subjects
-- ============================================

INSERT INTO "subjects" ("id", "org_id", "course_id", "name", "code", "description", "credits", "workload", "semester", "is_elective", "is_active", "prerequisites", "created_at") VALUES
  (
    'subject-0001',
    'org-0001',
    'course-0001',
    'Algoritmos e Estruturas de Dados I',
    'AED-I',
    'Introdução a algoritmos de busca e ordenação, listas, pilhas, filas e árvores.',
    4,
    60,
    3,
    FALSE,
    TRUE,
    ARRAY['Programação II'],
    NOW()
  ),
  (
    'subject-0002',
    'org-0001',
    'course-0001',
    'Banco de Dados I',
    'BD-I',
    'Modelagem conceitual, lógica e física de banco de dados. SQL básico e intermediário.',
    4,
    60,
    3,
    FALSE,
    TRUE,
    ARRAY['Introdução à Computação'],
    NOW()
  ),
  (
    'subject-0003',
    'org-0001',
    'course-0001',
    'Programação Orientada a Objetos',
    'POO',
    'Paradigma de orientação a objetos: classes, herança, polimorfismo, interfaces e padrões de projeto.',
    4,
    60,
    2,
    FALSE,
    TRUE,
    ARRAY['Programação II'],
    NOW()
  ),
  (
    'subject-0004',
    'org-0001',
    'course-0001',
    'Inteligência Artificial',
    'IA',
    'Fundamentos de IA: busca, lógica, aprendizado de máquina e redes neurais.',
    4,
    60,
    6,
    TRUE,
    TRUE,
    ARRAY['Algoritmos e Estruturas de Dados II', 'Probabilidade e Estatística'],
    NOW()
  ),
  (
    'subject-0005',
    'org-0001',
    'course-0001',
    'Redes de Computadores',
    'RC',
    'Arquitetura de redes, protocolos TCP/IP, camadas OSI, segurança de redes.',
    4,
    60,
    4,
    FALSE,
    TRUE,
    ARRAY['Sistemas Operacionais'],
    NOW()
  );

-- ============================================
-- 10. Sample Rooms
-- ============================================

INSERT INTO "rooms" ("id", "org_id", "name", "code", "capacity", "type", "building", "floor", "resources", "is_active", "created_at") VALUES
  (
    'room-0001',
    'org-0001',
    'Sala 101 - Bloco A',
    'A-101',
    40,
    'CLASSROOM',
    'Bloco A',
    1,
    ARRAY['Projetor', 'Quadro branco', 'Ar-condicionado', 'Wi-Fi'],
    TRUE,
    NOW()
  ),
  (
    'room-0002',
    'org-0001',
    'Laboratório de Informática 1',
    'LAB-01',
    30,
    'LAB',
    'Bloco B',
    1,
    ARRAY['Computadores (30)', 'Projetor', 'Quadro branco', 'Ar-condicionado', 'Wi-Fi', 'Software: IDEs, DBMS'],
    TRUE,
    NOW()
  ),
  (
    'room-0003',
    'org-0001',
    'Laboratório de Informática 2',
    'LAB-02',
    30,
    'LAB',
    'Bloco B',
    1,
    ARRAY['Computadores (30)', 'Projetor', 'Quadro branco', 'Ar-condicionado', 'Wi-Fi', 'Software: IDEs, DBMS'],
    TRUE,
    NOW()
  ),
  (
    'room-0004',
    'org-0001',
    'Auditório Principal',
    'AUD-01',
    150,
    'AUDITORIUM',
    'Bloco Central',
    0,
    ARRAY['Microfone', 'Projetor', 'Sistema de som', 'Ar-condicionado', 'Wi-Fi', 'Câmera de gravação'],
    TRUE,
    NOW()
  ),
  (
    'room-0005',
    'org-0001',
    'Sala 201 - Bloco A',
    'A-201',
    35,
    'CLASSROOM',
    'Bloco A',
    2,
    ARRAY['Projetor', 'Quadro branco', 'Ar-condicionado', 'Wi-Fi'],
    TRUE,
    NOW()
  );

-- ============================================
-- 11. Sample Semester
-- ============================================

INSERT INTO "semesters" ("id", "org_id", "name", "start_date", "end_date", "status", "created_at") VALUES
  (
    'semester-0001',
    'org-0001',
    '2024/1',
    '2024-02-05',
    '2024-06-28',
    'ACTIVE',
    NOW()
  ),
  (
    'semester-0002',
    'org-0001',
    '2024/2',
    '2024-07-22',
    '2024-12-20',
    'UPCOMING',
    NOW()
  );

-- ============================================
-- 12. Sample Teacher Availability
-- ============================================

INSERT INTO "teacher_availabilities" ("id", "org_id", "teacher_id", "semester_id", "weekday", "start_time", "end_time", "is_active", "created_at", "updated_at") VALUES
  ('avail-0001', 'org-0001', 'teacher-0001', 'semester-0001', 'MONDAY',    '08:00', '12:00', TRUE, NOW(), NOW()),
  ('avail-0002', 'org-0001', 'teacher-0001', 'semester-0001', 'MONDAY',    '14:00', '18:00', TRUE, NOW(), NOW()),
  ('avail-0003', 'org-0001', 'teacher-0001', 'semester-0001', 'TUESDAY',   '08:00', '12:00', TRUE, NOW(), NOW()),
  ('avail-0004', 'org-0001', 'teacher-0001', 'semester-0001', 'WEDNESDAY', '08:00', '12:00', TRUE, NOW(), NOW()),
  ('avail-0005', 'org-0001', 'teacher-0001', 'semester-0001', 'WEDNESDAY', '14:00', '16:00', TRUE, NOW(), NOW()),
  ('avail-0006', 'org-0001', 'teacher-0001', 'semester-0001', 'THURSDAY',  '08:00', '12:00', TRUE, NOW(), NOW()),
  ('avail-0007', 'org-0001', 'teacher-0001', 'semester-0001', 'FRIDAY',    '08:00', '12:00', TRUE, NOW(), NOW());

-- ============================================
-- 13. Sample Classes (Turmas)
-- ============================================

INSERT INTO "classes" ("id", "org_id", "subject_id", "semester_id", "teacher_id", "room_id", "name", "code", "schedule", "max_students", "current_students", "status", "created_at") VALUES
  (
    'class-0001',
    'org-0001',
    'subject-0001',
    'semester-0001',
    'teacher-0001',
    'room-0002',
    'Turma A - Algoritmos e Estruturas de Dados I',
    'AED-I-2024-1A',
    '[{"weekday": "MONDAY", "startTime": "08:00", "endTime": "10:00"}, {"weekday": "WEDNESDAY", "startTime": "08:00", "endTime": "10:00"}]'::jsonb,
    30,
    28,
    'ACTIVE',
    NOW()
  ),
  (
    'class-0002',
    'org-0001',
    'subject-0002',
    'semester-0001',
    'teacher-0001',
    'room-0002',
    'Turma A - Banco de Dados I',
    'BD-I-2024-1A',
    '[{"weekday": "TUESDAY", "startTime": "08:00", "endTime": "10:00"}, {"weekday": "THURSDAY", "startTime": "10:00", "endTime": "12:00"}]'::jsonb,
    30,
    25,
    'ACTIVE',
    NOW()
  );

-- ============================================
-- 14. Sample Enrollment (Matricula)
-- ============================================

INSERT INTO "enrollments" ("id", "org_id", "student_id", "class_id", "semester_id", "status", "enrolled_at", "dropped_at") VALUES
  (
    'enroll-0001',
    'org-0001',
    'student-0001',
    'class-0001',
    'semester-0001',
    'ACTIVE',
    NOW(),
    NULL
  ),
  (
    'enroll-0002',
    'org-0001',
    'student-0001',
    'class-0002',
    'semester-0001',
    'ACTIVE',
    NOW(),
    NULL
  );

-- ============================================
-- 15. Sample Holidays (Feriados)
-- ============================================

INSERT INTO "holidays" ("id", "org_id", "date", "name", "type", "created_at") VALUES
  ('holiday-0001', 'org-0001', '2024-02-12', 'Carnaval',              'NATIONAL',     NOW()),
  ('holiday-0002', 'org-0001', '2024-02-13', 'Carnaval',              'NATIONAL',     NOW()),
  ('holiday-0003', 'org-0001', '2024-03-29', 'Sexta-feira Santa',     'NATIONAL',     NOW()),
  ('holiday-0004', 'org-0001', '2024-04-21', 'Tiradentes',            'NATIONAL',     NOW()),
  ('holiday-0005', 'org-0001', '2024-05-01', 'Dia do Trabalho',        'NATIONAL',     NOW()),
  ('holiday-0006', 'org-0001', '2024-05-30', 'Corpus Christi',        'NATIONAL',     NOW()),
  ('holiday-0007', 'org-0001', '2024-06-20', 'Aniversário de São Paulo','LOCAL',       NOW()),
  ('holiday-0008', 'org-0001', '2024-09-07', 'Independência do Brasil','NATIONAL',     NOW()),
  ('holiday-0009', 'org-0001', '2024-10-12', 'Nossa Senhora Aparecida','NATIONAL',     NOW()),
  ('holiday-0010', 'org-0001', '2024-11-02', 'Finados',                'NATIONAL',     NOW()),
  ('holiday-0011', 'org-0001', '2024-11-15', 'Proclamação da República','NATIONAL',    NOW()),
  ('holiday-0012', 'org-0001', '2024-11-20', 'Dia da Consciência Negra','NATIONAL',    NOW());

-- ============================================
-- 16. Sample Session Settings (Configuracoes de Sessao)
-- ============================================

INSERT INTO "session_settings" ("id", "org_id", "semester_id", "setting_key", "setting_value", "created_at", "updated_at") VALUES
  (
    'settings-0001',
    'org-0001',
    'semester-0001',
    'attendance_settings',
    '{"requireDigitalSignature": true, "allowLateMinutes": 15, "maxAbsencePercentage": 25, "autoCloseAfter": 30, "requirePhoto": false}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'settings-0002',
    'org-0001',
    'semester-0001',
    'class_session_settings',
    '{"defaultDurationMinutes": 120, "minDurationMinutes": 30, "maxDurationMinutes": 240, "bufferBetweenClasses": 10}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'settings-0003',
    'org-0001',
    'semester-0001',
    'grading_settings',
    '{"scale": "0-10", "passingGrade": 6.0, "maxAbsences": 15, "finalExamWeight": 0.4, "assignmentWeight": 0.3, "participationWeight": 0.1, "attendanceWeight": 0.2}'::jsonb,
    NOW(),
    NOW()
  );
