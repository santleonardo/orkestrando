// ─── ORKESTRANDO — Permission Definitions ───

import type { RoleName, Permission } from "@/types";
import { ROLES } from "./roles";

// ─── Permission Registry ───
export const PERMISSIONS: Permission[] = [
  // Organization
  { id: "org:read", action: "read", resource: "organization", description: "Visualizar dados da organização" },
  { id: "org:update", action: "update", resource: "organization", description: "Atualizar dados da organização" },
  { id: "org:delete", action: "delete", resource: "organization", description: "Excluir organização" },

  // Users / Profiles
  { id: "users:read", action: "read", resource: "users", description: "Visualizar usuários" },
  { id: "users:create", action: "create", resource: "users", description: "Criar usuários" },
  { id: "users:update", action: "update", resource: "users", description: "Atualizar usuários" },
  { id: "users:delete", action: "delete", resource: "users", description: "Excluir usuários" },

  // Roles
  { id: "roles:read", action: "read", resource: "roles", description: "Visualizar roles" },
  { id: "roles:assign", action: "assign", resource: "roles", description: "Atribuir roles a usuários" },

  // Classes / Turmas
  { id: "classes:read", action: "read", resource: "classes", description: "Visualizar turmas" },
  { id: "classes:create", action: "create", resource: "classes", description: "Criar turmas" },
  { id: "classes:update", action: "update", resource: "classes", description: "Atualizar turmas" },
  { id: "classes:delete", action: "delete", resource: "classes", description: "Excluir turmas" },

  // Materials
  { id: "materials:read", action: "read", resource: "materials", description: "Visualizar materiais" },
  { id: "materials:create", action: "create", resource: "materials", description: "Criar materiais" },
  { id: "materials:update", action: "update", resource: "materials", description: "Atualizar materiais" },
  { id: "materials:delete", action: "delete", resource: "materials", description: "Excluir materiais" },

  // Assignments / Atividades
  { id: "assignments:read", action: "read", resource: "assignments", description: "Visualizar atividades" },
  { id: "assignments:create", action: "create", resource: "assignments", description: "Criar atividades" },
  { id: "assignments:update", action: "update", resource: "assignments", description: "Atualizar atividades" },
  { id: "assignments:delete", action: "delete", resource: "assignments", description: "Excluir atividades" },
  { id: "assignments:submit", action: "submit", resource: "assignments", description: "Submeter atividades" },
  { id: "assignments:grade", action: "grade", resource: "assignments", description: "Avaliar atividades" },

  // Reports / Relatórios
  { id: "reports:read", action: "read", resource: "reports", description: "Visualizar relatórios" },
  { id: "reports:create", action: "create", resource: "reports", description: "Criar relatórios" },
  { id: "reports:export", action: "export", resource: "reports", description: "Exportar relatórios" },

  // Messages / Mensagens
  { id: "messages:read", action: "read", resource: "messages", description: "Visualizar mensagens" },
  { id: "messages:send", action: "send", resource: "messages", description: "Enviar mensagens" },

  // Signatures / Assinaturas
  { id: "signatures:read", action: "read", resource: "signatures", description: "Visualizar assinaturas" },
  { id: "signatures:create", action: "create", resource: "signatures", description: "Criar assinaturas" },
];

// ─── Role → Permission Mapping ───
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  Coordenador: PERMISSIONS.map((p) => p.id),

  Professor: [
    "org:read",
    "users:read",
    "roles:read",
    "classes:read",
    "classes:create",
    "classes:update",
    "materials:read",
    "materials:create",
    "materials:update",
    "materials:delete",
    "assignments:read",
    "assignments:create",
    "assignments:update",
    "assignments:delete",
    "assignments:grade",
    "reports:read",
    "reports:create",
    "reports:export",
    "messages:read",
    "messages:send",
    "signatures:read",
  ],

  Aluno: [
    "org:read",
    "users:read",
    "classes:read",
    "materials:read",
    "assignments:read",
    "assignments:submit",
    "reports:read",
    "messages:read",
    "messages:send",
    "signatures:read",
    "signatures:create",
  ],
};

export function getPermissionsForRole(role: RoleName): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(
  role: RoleName,
  permissionId: string
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permissionId) ?? false;
}

export function roleCanPerform(
  role: RoleName,
  action: string,
  resource: string
): boolean {
  const permissionId = `${resource}:${action}`;
  return roleHasPermission(role, permissionId);
}
