-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  Orkestrando — Setup Supabase                                            ║
-- ║  Cole este script inteiro no SQL Editor do Supabase e clique em RUN      ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "senha" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Perfis
CREATE TABLE IF NOT EXISTS "Profile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Turmas
CREATE TABLE IF NOT EXISTS "Turma" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "semestre" TEXT NOT NULL,
  "ano" INTEGER NOT NULL,
  "coordenadorId" TEXT REFERENCES "Profile"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Matérias
CREATE TABLE IF NOT EXISTS "Materia" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "turmaId" TEXT NOT NULL REFERENCES "Turma"("id") ON DELETE CASCADE,
  "professorId" TEXT REFERENCES "Profile"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Disponibilidades
CREATE TABLE IF NOT EXISTS "Disponibilidade" (
  "id" TEXT PRIMARY KEY,
  "professorId" TEXT NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "diaSemana" INTEGER NOT NULL,
  "horaInicio" TEXT NOT NULL,
  "horaFim" TEXT NOT NULL,
  "recorrente" BOOLEAN NOT NULL DEFAULT false,
  "dataEspecifica" TEXT,
  "semestre" TEXT NOT NULL,
  "ano" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS "Aula" (
  "id" TEXT PRIMARY KEY,
  "materiaId" TEXT NOT NULL REFERENCES "Materia"("id") ON DELETE CASCADE,
  "professorId" TEXT NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "turmaId" TEXT NOT NULL REFERENCES "Turma"("id") ON DELETE CASCADE,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "dataHoraInicio" TIMESTAMP(3) NOT NULL,
  "dataHoraFim" TIMESTAMP(3) NOT NULL,
  "semestre" TEXT NOT NULL,
  "ano" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'agendada',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS "Profile_userId_idx" ON "Profile"("userId");
CREATE INDEX IF NOT EXISTS "Turma_coordenadorId_idx" ON "Turma"("coordenadorId");
CREATE INDEX IF NOT EXISTS "Materia_turmaId_idx" ON "Materia"("turmaId");
CREATE INDEX IF NOT EXISTS "Materia_professorId_idx" ON "Materia"("professorId");
CREATE INDEX IF NOT EXISTS "Disponibilidade_professorId_idx" ON "Disponibilidade"("professorId");
CREATE INDEX IF NOT EXISTS "Aula_materiaId_idx" ON "Aula"("materiaId");
CREATE INDEX IF NOT EXISTS "Aula_professorId_idx" ON "Aula"("professorId");
CREATE INDEX IF NOT EXISTS "Aula_turmaId_idx" ON "Aula"("turmaId");

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_updated
  BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_profile_updated
  BEFORE UPDATE ON "Profile" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_turma_updated
  BEFORE UPDATE ON "Turma" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_aula_updated
  BEFORE UPDATE ON "Aula" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ✅ Tabelas criadas com sucesso!
-- Agora vá ao Vercel, configure a variável DATABASE_URL e faça o deploy.
-- Depois, chame o endpoint /api/seed?key=orkestrando2025 para popular o banco.
