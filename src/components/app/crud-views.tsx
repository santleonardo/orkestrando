'use client'

import React from 'react'
import { useStore } from '@/lib/store'
import { CrudView, FormField, ColumnDef, CrudViewConfig } from './crud-view'
import { getInitials } from './helpers'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { WEEKDAYS } from './constants'
import { GraduationCap, Users, BookOpen, Building2, School, CheckCircle2, XCircle } from 'lucide-react'

/* ─── Professores ─── */

export function TeachersView() {
  const config: CrudViewConfig = {
    title: 'Professores', dataKey: 'profiles', fetchKey: 'fetchProfiles',
    createKey: 'createProfile', updateKey: 'updateProfile', deleteKey: 'deleteProfile',
    dataFilter: (items) => items.filter(p => p.role === 'PROFESSOR'),
    emptyIcon: GraduationCap, emptyTitle: 'Nenhum professor cadastrado', emptyDesc: 'Adicione o primeiro professor.',
    searchPlaceholder: 'Buscar professores...',
    columns: [
      { key: 'displayName', label: 'Nome', render: (v, r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8"><AvatarFallback className="bg-teal-100 text-teal-700 text-xs">{getInitials(v)}</AvatarFallback></Avatar>
          <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
        </div>
      )},
      { key: 'department', label: 'Departamento', render: v => <Badge variant="outline">{v || 'N/A'}</Badge> },
      { key: 'phone', label: 'Telefone' },
      { key: 'isActive', label: 'Status', render: v => <Badge className={v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{v ? 'Ativo' : 'Inativo'}</Badge> },
    ],
    formFields: [
      { key: 'firstName', label: 'Nome', type: 'text', placeholder: 'João' },
      { key: 'lastName', label: 'Sobrenome', type: 'text', placeholder: 'Silva' },
      { key: 'email', label: 'E-mail', type: 'text', placeholder: 'professor@escola.com' },
      { key: 'phone', label: 'Telefone', type: 'text', placeholder: '+55 11 99999' },
      { key: 'department', label: 'Departamento', type: 'text', placeholder: 'Ciência da Computação' },
    ],
    createExtra: (form) => ({
      role: 'PROFESSOR',
      password: 'password123',
      displayName: `${form.firstName} ${form.lastName}`,
    }),
  }
  return <CrudView config={config} />
}

/* ─── Alunos ─── */

export function StudentsView() {
  const config: CrudViewConfig = {
    title: 'Alunos', dataKey: 'profiles', fetchKey: 'fetchProfiles',
    createKey: 'createProfile', updateKey: 'updateProfile', deleteKey: 'deleteProfile',
    dataFilter: (items) => items.filter(p => p.role === 'STUDENT'),
    emptyIcon: Users, emptyTitle: 'Nenhum aluno cadastrado', emptyDesc: 'Adicione o primeiro aluno.',
    searchPlaceholder: 'Buscar alunos...',
    columns: [
      { key: 'displayName', label: 'Nome', render: (v, r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{getInitials(v)}</AvatarFallback></Avatar>
          <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
        </div>
      )},
      { key: 'course', label: 'Curso', render: v => <Badge variant="outline">{v || 'N/A'}</Badge> },
      { key: 'semester', label: 'Semestre' },
      { key: 'shift', label: 'Turno' },
      { key: 'isActive', label: 'Status', render: v => <Badge className={v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{v ? 'Ativo' : 'Inativo'}</Badge> },
    ],
    formFields: [
      { key: 'firstName', label: 'Nome', type: 'text', placeholder: 'João' },
      { key: 'lastName', label: 'Sobrenome', type: 'text', placeholder: 'Silva' },
      { key: 'email', label: 'E-mail', type: 'text', placeholder: 'aluno@escola.com' },
      { key: 'phone', label: 'Telefone', type: 'text' },
      { key: 'course', label: 'Curso', type: 'text' },
      { key: 'semester', label: 'Semestre', type: 'number' },
      { key: 'shift', label: 'Turno', type: 'select', options: [
        { label: 'Manhã', value: 'Manhã' }, { label: 'Tarde', value: 'Tarde' }, { label: 'Noite', value: 'Noite' },
      ]},
    ],
    transformForm: (form) => ({ ...form, semester: parseInt(form.semester) || null }),
    createExtra: (form) => ({
      role: 'STUDENT',
      password: 'password123',
      displayName: `${form.firstName} ${form.lastName}`,
      semester: parseInt(form.semester) || null,
    }),
  }
  return <CrudView config={config} />
}

/* ─── Disciplinas ─── */

export function SubjectsView() {
  const config: CrudViewConfig = {
    title: 'Disciplinas', dataKey: 'subjects', fetchKey: 'fetchSubjects',
    createKey: 'createSubject', updateKey: 'updateSubject', deleteKey: 'deleteSubject',
    emptyIcon: BookOpen, emptyTitle: 'Nenhuma disciplina cadastrada', emptyDesc: 'Crie a primeira disciplina.',
    searchPlaceholder: 'Buscar disciplinas...',
    columns: [
      { key: 'code', label: 'Código', render: v => <Badge className="bg-emerald-100 text-emerald-700" variant="outline">{v}</Badge> },
      { key: 'name', label: 'Nome' },
      { key: 'hoursWeek', label: 'Horas/Semana' },
      { key: 'credits', label: 'Créditos' },
      { key: 'sem', label: 'Semestre', render: v => v || '-' },
      { key: 'isActive', label: 'Status', render: v => <Badge className={v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{v ? 'Ativa' : 'Inativa'}</Badge> },
    ],
    formFields: [
      { key: 'code', label: 'Código', type: 'text', placeholder: 'CC101' },
      { key: 'name', label: 'Nome', type: 'text', placeholder: 'Introdução à Computação' },
      { key: 'hoursWeek', label: 'Horas/Semana', type: 'number' },
      { key: 'credits', label: 'Créditos', type: 'number' },
      { key: 'sem', label: 'Semestre', type: 'number', placeholder: 'Opcional' },
    ],
    transformForm: (form) => ({ ...form, hoursWeek: parseInt(form.hoursWeek), credits: parseInt(form.credits), sem: parseInt(form.sem) || null }),
  }
  return <CrudView config={config} />
}

/* ─── Salas ─── */

export function RoomsView() {
  const config: CrudViewConfig = {
    title: 'Salas', dataKey: 'rooms', fetchKey: 'fetchRooms',
    createKey: 'createRoom', updateKey: 'updateRoom', deleteKey: 'deleteRoom',
    emptyIcon: Building2, emptyTitle: 'Nenhuma sala cadastrada', emptyDesc: 'Adicione a primeira sala.',
    searchPlaceholder: 'Buscar salas...',
    columns: [
      { key: 'code', label: 'Código', render: v => <Badge className="bg-teal-100 text-teal-700" variant="outline">{v}</Badge> },
      { key: 'name', label: 'Nome' },
      { key: 'type', label: 'Tipo', render: v => <Badge variant="outline">{v}</Badge> },
      { key: 'capacity', label: 'Capacidade' },
      { key: 'building', label: 'Prédio', render: v => v || '-' },
      { key: 'hasProjector', label: 'Projetor', render: v => v ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
      { key: 'hasComputers', label: 'Computadores', render: v => v ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
    ],
    formFields: [
      { key: 'code', label: 'Código', type: 'text', placeholder: 'S101' },
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'type', label: 'Tipo', type: 'select', options: [
        { label: 'Sala de Aula', value: 'CLASSROOM' }, { label: 'Laboratório', value: 'LAB' }, { label: 'Auditório', value: 'AUDITORIUM' },
      ]},
      { key: 'capacity', label: 'Capacidade', type: 'number' },
      { key: 'building', label: 'Prédio', type: 'text' },
      { key: 'hasProjector', label: 'Projetor', type: 'checkbox' },
      { key: 'hasComputers', label: 'Computadores', type: 'checkbox' },
      { key: 'hasAC', label: 'Ar Condicionado', type: 'checkbox' },
      { key: 'hasWhiteboard', label: 'Quadro Branco', type: 'checkbox' },
    ],
    transformForm: (form) => ({ ...form, capacity: parseInt(form.capacity) }),
  }
  return <CrudView config={config} />
}

/* ─── Turmas ─── */

export function ClassesView() {
  const store = useStore()
  const config: CrudViewConfig = {
    title: 'Turmas', dataKey: 'classes', fetchKey: 'fetchClasses',
    createKey: 'createClass', updateKey: 'updateClass', deleteKey: 'deleteClass',
    extraFetchKeys: ['fetchSubjects', 'fetchProfiles', 'fetchRooms'],
    emptyIcon: School, emptyTitle: 'Nenhuma turma cadastrada', emptyDesc: 'Crie a primeira turma.',
    searchPlaceholder: 'Buscar turmas...',
    columns: [
      { key: 'code', label: 'Código', render: v => <Badge className="bg-cyan-100 text-cyan-700" variant="outline">{v}</Badge> },
      { key: 'subject', label: 'Disciplina', render: (v) => <span className="text-sm">{v?.name || '-'}</span> },
      { key: 'teacher', label: 'Professor', render: (v) => <span className="text-sm">{v?.displayName || '-'}</span> },
      { key: 'room', label: 'Sala', render: (v) => <Badge variant="outline">{v?.code || '-'}</Badge> },
      { key: 'weekday', label: 'Dia' },
      { key: 'startTime', label: 'Horário', render: (v, r) => <span className="text-sm">{v} - {r.endTime}</span> },
      { key: 'vacancies', label: 'Vagas' },
    ],
    formFields: [
      { key: 'code', label: 'Código', type: 'text', placeholder: 'CC101-A' },
      { key: 'name', label: 'Nome', type: 'text', placeholder: 'Opcional' },
      { key: 'weekday', label: 'Dia', type: 'select', options: WEEKDAYS.map(d => ({ label: d, value: d })) },
      { key: 'startTime', label: 'Início', type: 'time' },
      { key: 'endTime', label: 'Término', type: 'time' },
      { key: 'vacancies', label: 'Vagas', type: 'number' },
    ],
    transformForm: (form) => ({ ...form, vacancies: parseInt(form.vacancies) }),
  }
  return <CrudView config={config} />
}
