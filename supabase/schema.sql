-- ─── ORKESTRANDO — Supabase SQL Schema ───
-- Execute no Supabase SQL Editor

-- ═══════════════════════════════════════════
-- EXTENSÕES
-- ═══════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════
-- ORGANIZATIONS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ═══════════════════════════════════════════
-- ROLES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_roles_name ON roles(name);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
  ('Coordenador', 'Administrador da plataforma. Gerencia organizações, usuários, turmas e configurações globais.'),
  ('Professor', 'Gestor pedagógico. Cria e gerencia turmas, atividades, materiais e avaliações.'),
  ('Aluno', 'Participante das turmas. Acessa materiais, entrega atividades e acompanha seu progresso.')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════
-- PERMISSIONS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(action, resource)
);

CREATE INDEX idx_permissions_action_resource ON permissions(action, resource);

-- Seed default permissions
INSERT INTO permissions (action, resource, description) VALUES
  ('read', 'organization', 'Visualizar dados da organização'),
  ('update', 'organization', 'Atualizar dados da organização'),
  ('delete', 'organization', 'Excluir organização'),
  ('read', 'users', 'Visualizar usuários'),
  ('create', 'users', 'Criar usuários'),
  ('update', 'users', 'Atualizar usuários'),
  ('delete', 'users', 'Excluir usuários'),
  ('read', 'roles', 'Visualizar roles'),
  ('assign', 'roles', 'Atribuir roles a usuários'),
  ('read', 'classes', 'Visualizar turmas'),
  ('create', 'classes', 'Criar turmas'),
  ('update', 'classes', 'Atualizar turmas'),
  ('delete', 'classes', 'Excluir turmas'),
  ('read', 'materials', 'Visualizar materiais'),
  ('create', 'materials', 'Criar materiais'),
  ('update', 'materials', 'Atualizar materiais'),
  ('delete', 'materials', 'Excluir materiais'),
  ('read', 'assignments', 'Visualizar atividades'),
  ('create', 'assignments', 'Criar atividades'),
  ('update', 'assignments', 'Atualizar atividades'),
  ('delete', 'assignments', 'Excluir atividades'),
  ('submit', 'assignments', 'Submeter atividades'),
  ('grade', 'assignments', 'Avaliar atividades'),
  ('read', 'reports', 'Visualizar relatórios'),
  ('create', 'reports', 'Criar relatórios'),
  ('export', 'reports', 'Exportar relatórios'),
  ('read', 'messages', 'Visualizar mensagens'),
  ('send', 'messages', 'Enviar mensagens'),
  ('read', 'signatures', 'Visualizar assinaturas'),
  ('create', 'signatures', 'Criar assinaturas')
ON CONFLICT (action, resource) DO NOTHING;

-- ═══════════════════════════════════════════
-- ROLE_PERMISSIONS (pivot)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- Seed role-permission mappings
-- Coordenador gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'Coordenador'
ON CONFLICT DO NOTHING;

-- Professor gets specific permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Professor'
  AND (p.action, p.resource) IN (
    ('read', 'organization'),
    ('read', 'users'),
    ('read', 'roles'),
    ('read', 'classes'),
    ('create', 'classes'),
    ('update', 'classes'),
    ('read', 'materials'),
    ('create', 'materials'),
    ('update', 'materials'),
    ('delete', 'materials'),
    ('read', 'assignments'),
    ('create', 'assignments'),
    ('update', 'assignments'),
    ('delete', 'assignments'),
    ('grade', 'assignments'),
    ('read', 'reports'),
    ('create', 'reports'),
    ('export', 'reports'),
    ('read', 'messages'),
    ('send', 'messages'),
    ('read', 'signatures')
  )
ON CONFLICT DO NOTHING;

-- Aluno gets specific permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Aluno'
  AND (p.action, p.resource) IN (
    ('read', 'organization'),
    ('read', 'users'),
    ('read', 'classes'),
    ('read', 'materials'),
    ('read', 'assignments'),
    ('submit', 'assignments'),
    ('read', 'reports'),
    ('read', 'messages'),
    ('send', 'messages'),
    ('read', 'signatures'),
    ('create', 'signatures')
  )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Aluno',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ═══════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════

-- ─── Organizations ───
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read their own organization
CREATE POLICY "Users can read own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Only Coordenador can update/delete
CREATE POLICY "Coordenador can update organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'Coordenador'
    )
  );

CREATE POLICY "Coordenador can delete organization"
  ON organizations FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'Coordenador'
    )
  );

-- ─── Profiles ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles in their organization
CREATE POLICY "Users can read profiles in own org"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Coordenador can create/update/delete profiles in their org
CREATE POLICY "Coordenador can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'Coordenador'
    )
  );

CREATE POLICY "Coordenador can update any profile in org"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'Coordenador'
    )
  );

CREATE POLICY "Coordenador can delete profiles in org"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'Coordenador'
    )
  );

-- ─── Roles ───
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Only Coordenador can manage roles (via service role, typically)
CREATE POLICY "Coordenador can manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'Coordenador'
  )
);

-- ─── Permissions ───
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- ─── Role Permissions ───
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coordenador can manage role permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'Coordenador'
  )
);

-- ═══════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get or create default organization
  SELECT id INTO default_org_id FROM organizations LIMIT 1;

  IF default_org_id IS NULL THEN
    INSERT INTO organizations (name, slug) VALUES ('Organização Padrão', 'org-padrao')
    RETURNING id INTO default_org_id;
  END IF;

  -- Create profile
  INSERT INTO profiles (user_id, organization_id, full_name, role)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'Aluno'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
