// ─── ORKESTRANDO — Role Provider ───

"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { createPermissionChecker } from "@/lib/rbac/guards";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac/permissions";
import type { RoleName, Permission, RoleContextType } from "@/types";

const RoleContext = createContext<RoleContextType>({
  role: null,
  permissions: [],
  hasPermission: () => false,
  isCoordenador: false,
  isProfessor: false,
  isAluno: false,
});

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const role = profile?.role ?? null;

  const permissions = useMemo<Permission[]>(() => {
    if (!role) return [];
    const ids = getPermissionsForRole(role);
    return PERMISSIONS.filter((p) => ids.includes(p.id));
  }, [role]);

  const hasPermission = useMemo(() => {
    return (action: string, resource: string) => {
      if (!role) return false;
      const checker = createPermissionChecker(role);
      return checker.can(action, resource);
    };
  }, [role]);

  const value = useMemo<RoleContextType>(
    () => ({
      role,
      permissions,
      hasPermission,
      isCoordenador: role === "Coordenador",
      isProfessor: role === "Professor",
      isAluno: role === "Aluno",
    }),
    [role, permissions, hasPermission]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
