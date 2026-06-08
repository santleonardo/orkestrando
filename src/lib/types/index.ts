// src/lib/types/index.ts

export interface Profile {
  id: string;
  role: 'professor' | 'aluno' | 'coordenador';
  nome: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Turma {
  id: string;
  nome: string;
  descricao: string | null;
  semestre: string;
  ano: number;
  coordenador_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Materia {
  id: string;
  nome: string;
  turma_id: string;
  professor_id: string | null;
  turma?: Turma;
}

export interface Disponibilidade {
  id: string;
  professor_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  recorrente: boolean;
  data_especifica: string | null;
  semestre: string;
  ano: number;
  created_at: string;
}

export interface DisponibilidadeFormValues {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  recorrente: boolean;
  data_especifica?: string;
  semestre: string;
  ano: number;
}

export interface Aula {
  id: string;
  materia_id: string;
  professor_id: string;
  turma_id: string;
  titulo: string;
  descricao: string | null;
  data_hora_inicio: string;
  data_hora_fim: string;
  semestre: string;
  ano: number;
  status: 'agendada' | 'realizada' | 'cancelada';
  created_at: string;
  updated_at: string;
  materia?: Materia;
  turma?: Turma;
}

export type CalendarioEvento =
  | { tipo: 'disponibilidade'; dados: Disponibilidade }
  | { tipo: 'aula'; dados: Aula };

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}
