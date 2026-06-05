// ─── ORKESTRANDO — Role Definitions ───

import type { RoleName } from "@/types";

export const ROLES = {
  COORDENADOR: "Coordenador" as RoleName,
  PROFESSOR: "Professor" as RoleName,
  ALUNO: "Aluno" as RoleName,
} as const;

export const ROLE_HIERARCHY: Record<RoleName, number> = {
  Coordenador: 3,
  Professor: 2,
  Aluno: 1,
};

export const ROLE_LABELS: Record<RoleName, string> = {
  Coordenador: "Coordenador",
  Professor: "Professor",
  Aluno: "Aluno",
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  Coordenador:
    "Administrador da plataforma. Gerencia organizações, usuários, turmas e configurações globais.",
  Professor:
    "Gestor pedagógico. Cria e gerencia turmas, atividades, materiais e avaliações.",
  Aluno:
    "Participante das turmas. Acessa materiais, entrega atividades e acompanha seu progresso.",
};

export const ALL_ROLES: RoleName[] = [
  ROLES.COORDENADOR,
  ROLES.PROFESSOR,
  ROLES.ALUNO,
];

export function getRoleLevel(role: RoleName): number {
  return ROLE_HIERARCHY[role];
}

export function isRoleAtLeast(role: RoleName, minimum: RoleName): boolean {
  return getRoleLevel(role) >= getRoleLevel(minimum);
}
