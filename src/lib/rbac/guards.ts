// ─── ORKESTRANDO — RBAC Guard Utilities ───

import type { RoleName, Permission } from "@/types";
import { PERMISSIONS, roleCanPerform, getPermissionsForRole } from "./permissions";
import { isRoleAtLeast } from "./roles";

/**
 * Check if a role has a specific permission (action + resource).
 */
export function checkPermission(
  role: RoleName | null,
  action: string,
  resource: string
): boolean {
  if (!role) return false;
  return roleCanPerform(role, action, resource);
}

/**
 * Check if a role is at least a minimum level in the hierarchy.
 */
export function checkRoleLevel(
  role: RoleName | null,
  minimum: RoleName
): boolean {
  if (!role) return false;
  return isRoleAtLeast(role, minimum);
}

/**
 * Get all permissions for a role as Permission objects.
 */
export function getRolePermissionObjects(role: RoleName): Permission[] {
  const ids = getPermissionsForRole(role);
  return PERMISSIONS.filter((p: Permission) => ids.includes(p.id));
}

/**
 * Create a permission checker bound to a specific role.
 */
export function createPermissionChecker(role: RoleName | null) {
  return {
    can: (action: string, resource: string) =>
      checkPermission(role, action, resource),
    isAtLeast: (minimum: RoleName) => checkRoleLevel(role, minimum),
    isCoordenador: role === "Coordenador",
    isProfessor: role === "Professor",
    isAluno: role === "Aluno",
  };
}

/**
 * Route guard: define required permission for a route.
 * Used by middleware to enforce access control.
 */
export interface RouteGuard {
  path: string;
  action: string;
  resource: string;
  minimumRole?: RoleName;
}

export const ROUTE_GUARDS: RouteGuard[] = [
  // Admin routes
  { path: "/admin", action: "update", resource: "organization", minimumRole: "Coordenador" },
  { path: "/admin/users", action: "create", resource: "users", minimumRole: "Coordenador" },
  { path: "/admin/roles", action: "assign", resource: "roles", minimumRole: "Coordenador" },

  // Teacher routes
  { path: "/classes/new", action: "create", resource: "classes", minimumRole: "Professor" },
  { path: "/materials/new", action: "create", resource: "materials", minimumRole: "Professor" },
  { path: "/assignments/new", action: "create", resource: "assignments", minimumRole: "Professor" },
  { path: "/assignments/grade", action: "grade", resource: "assignments", minimumRole: "Professor" },

  // Student routes
  { path: "/assignments/submit", action: "submit", resource: "assignments", minimumRole: "Aluno" },

  // Shared routes
  { path: "/reports", action: "read", resource: "reports", minimumRole: "Aluno" },
  { path: "/messages", action: "read", resource: "messages", minimumRole: "Aluno" },
];

/**
 * Find the most specific matching guard for a given path.
 */
export function findGuardForPath(pathname: string): RouteGuard | null {
  const sorted = [...ROUTE_GUARDS].sort(
    (a, b) => b.path.length - a.path.length
  );
  for (const guard of sorted) {
    if (pathname.startsWith(guard.path)) {
      return guard;
    }
  }
  return null;
}
