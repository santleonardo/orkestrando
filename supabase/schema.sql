-- ============================================================
-- Orkestrando — Schema SQL (Referência para Supabase)
-- Módulo Professor: Calendário e Disponibilidade
-- ============================================================

-- Extensão necessária para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('professor', 'aluno', 'coordenador')),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  semestre TEXT NOT NULL,
  ano INT NOT NULL,
  coordenador_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE materias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE disponibilidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  recorrente BOOLEAN NOT NULL DEFAULT false,
  data_especifica DATE,
  semestre TEXT NOT NULL,
  ano INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE aulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_hora_inicio TIMESTAMPTZ NOT NULL,
  data_hora_fim TIMESTAMPTZ NOT NULL,
  semestre TEXT NOT NULL,
  ano INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;

-- Profiles: SELECT e UPDATE no próprio profile
CREATE POLICY "Professores podem ver próprio profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Professores podem atualizar próprio profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Turmas: SELECT para professores associados
CREATE POLICY "Professores podem ver turmas associadas"
  ON turmas FOR SELECT
  USING (
    coordenador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM materias m
      WHERE m.turma_id = turmas.id AND m.professor_id = auth.uid()
    )
  );

-- Matérias: SELECT para professores associados
CREATE POLICY "Professores podem ver matérias associadas"
  ON materias FOR SELECT
  USING (professor_id = auth.uid());

-- Disponibilidades: INSERT, SELECT e DELETE para o próprio professor
CREATE POLICY "Professores podem ver próprias disponibilidades"
  ON disponibilidades FOR SELECT
  USING (professor_id = auth.uid());

CREATE POLICY "Professores podem inserir próprias disponibilidades"
  ON disponibilidades FOR INSERT
  WITH CHECK (professor_id = auth.uid());

CREATE POLICY "Professores podem excluir próprias disponibilidades"
  ON disponibilidades FOR DELETE
  USING (professor_id = auth.uid());

-- Aulas: SELECT para o professor da aula
CREATE POLICY "Professores podem ver próprias aulas"
  ON aulas FOR SELECT
  USING (professor_id = auth.uid());

-- ============================================================
-- TRIGGERS DE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_turmas_updated_at
  BEFORE UPDATE ON turmas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_materias_updated_at
  BEFORE UPDATE ON materias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_aulas_updated_at
  BEFORE UPDATE ON aulas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Coordenador
INSERT INTO profiles (id, role, nome, email, avatar_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'coordenador', 'Maria Coordenadora', 'coord@orkestrando.com', NULL);

-- Professores
INSERT INTO profiles (id, role, nome, email, avatar_url) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'professor', 'Carlos Silva', 'prof1@orkestrando.com', NULL),
  ('a0000000-0000-0000-0000-000000000003', 'professor', 'Ana Lima', 'prof2@orkestrando.com', NULL);

-- Turmas
INSERT INTO turmas (id, nome, descricao, semestre, ano, coordenador_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Turma A — 2025.2', 'Turma do período matutino', '2025.2', 2025, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Turma B — 2025.2', 'Turma do período vespertino', '2025.2', 2025, 'a0000000-0000-0000-0000-000000000001');

-- Matérias
INSERT INTO materias (id, nome, turma_id, professor_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Matemática', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000002', 'Física', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000003', 'Português', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003');

-- Disponibilidades do prof1
-- Segunda-feira (1), Quarta-feira (3), Sexta-feira (5): 08:00-12:00 recorrentes
INSERT INTO disponibilidades (id, professor_id, dia_semana, hora_inicio, hora_fim, recorrente, data_especifica, semestre, ano) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 1, '08:00', '12:00', true, NULL, '2025.2', 2025),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 3, '08:00', '12:00', true, NULL, '2025.2', 2025),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 5, '08:00', '12:00', true, NULL, '2025.2', 2025),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 4, '14:00', '18:00', false, '2025-08-14', '2025.2', 2025);

-- Aulas agendadas para prof1
INSERT INTO aulas (id, materia_id, professor_id, turma_id, titulo, descricao, data_hora_inicio, data_hora_fim, semestre, ano, status) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Aula de Álgebra', 'Introdução a equações do 2º grau', '2025-08-04T08:00:00-03:00', '2025-08-04T10:00:00-03:00', '2025.2', 2025, 'agendada'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Aula de Mecânica', 'Leis de Newton', '2025-08-06T08:00:00-03:00', '2025-08-06T10:00:00-03:00', '2025.2', 2025, 'agendada'),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Aula de Geometria', 'Teorema de Pitágoras', '2025-09-01T08:00:00-03:00', '2025-09-01T10:00:00-03:00', '2025.2', 2025, 'agendada');
