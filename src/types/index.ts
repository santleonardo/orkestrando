// ─── ORKESTRANDO — Global Type Definitions ───

import type { User } from "@supabase/supabase-js";

// ─── Roles ───
export type RoleName = "Coordenador" | "Professor" | "Aluno";

// ─── Profile ───
export interface Profile {
  id: string;
  user_id: string;
  organization_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: RoleName;
  created_at: string;
  updated_at: string;
}

// ─── Organization ───
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// ─── Permission ───
export interface Permission {
  id: string;
  action: string;
  resource: string;
  description: string | null;
}

// ─── Role-Permission pivot ───
export interface RolePermission {
  role_id: string;
  permission_id: string;
}

// ─── Auth Context ───
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Session Context ───
export interface SessionContextType {
  session: import("@supabase/supabase-js").Session | null;
  isLoading: boolean;
}

// ─── Role Context ───
export interface RoleContextType {
  role: RoleName | null;
  permissions: Permission[];
  hasPermission: (action: string, resource: string) => boolean;
  isCoordenador: boolean;
  isProfessor: boolean;
  isAluno: boolean;
}
