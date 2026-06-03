'use client'

import React from 'react'
import { useStore } from '@/lib/store'
import { CrudView, FormField, ColumnDef, CrudViewConfig } from './crud-view'
import { getInitials } from './helpers'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { WEEKDAYS } from './constants'
import { GraduationCap, Users, BookOpen, Building2, School, CheckCircle2, XCircle } from 'lucide-react'

/* ─── Teachers ─── */

export function TeachersView() {
  const config: CrudViewConfig = {
    title: 'Teachers', dataKey: 'profiles', fetchKey: 'fetchProfiles',
    createKey: 'createProfile', updateKey: 'updateProfile', deleteKey: 'deleteProfile',
    dataFilter: (items) => items.filter(p => p.role === 'PROFESSOR'),
    emptyIcon: GraduationCap, emptyTitle: 'No teachers yet', emptyDesc: 'Add your first teacher.',
    searchPlaceholder: 'Search teachers...',
    columns: [
      { key: 'displayName', label: 'Name', render: (v, r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8"><AvatarFallback className="bg-teal-100 text-teal-700 text-xs">{getInitials(v)}</AvatarFallback></Avatar>
          <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
        </div>
      )},
      { key: 'department', label: 'Department', render: v => <Badge variant="outline">{v || 'N/A'}</Badge> },
      { key: 'phone', label: 'Phone' },
      { key: 'isActive', label: 'Status', render: v => <Badge className={v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{v ? 'Active' : 'Inactive'}</Badge> },
    ],
    formFields: [
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'John' },
      { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'teacher@school.com' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 234 567' },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'Computer Science' },
    ],
    createExtra: (form) => ({
      role: 'PROFESSOR',
      password: 'password123',
      displayName: `${form.firstName} ${form.lastName}`,
    }),
  }
  return <CrudView config={config} />
}

/* ─── Students ─── */

export function StudentsView() {
  const config: CrudViewConfig = {
    title: 'Students', dataKey: 'profiles', fetchKey: 'fetchProfiles',
    createKey: 'createProfile', updateKey: 'updateProfile', deleteKey: 'deleteProfile',
    dataFilter: (items) => items.filter(p => p.role === 'STUDENT'),
    emptyIcon: Users, emptyTitle: 'No students yet', emptyDesc: 'Add your first student.',
    searchPlaceholder: 'Search students...',
    columns: [
      { key: 'displayName', label: 'Name', render: (v, r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{getInitials(v)}</AvatarFallback></Avatar>
          <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
        </div>
      )},
      { key: 'course', label: 'Course', render: v => <Badge variant="outline">{v || 'N/A'}</Badge> },
      { key: 'semester', label: 'Semester' },
      { key: 'shift', label: 'Shift' },
      { key: 'isActive', label: 'Status', render: v => <Badge className={v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{v ? 'Active' : 'Inactive'}</Badge> },
    ],
    formFields: [
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'John' },
      { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'student@school.com' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'course', label: 'Course', type: 'text' },
      { key: 'semester', label: 'Semester', type: 'number' },
      { key: 'shift', label: 'Shift', type: 'select', options: [
        { label: 'Morning', value: 'Morning' }, { label: 'Afternoon', value: 'Afternoon' }, { label: 'Evening', value: 'Evening' },
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

/* ─── Subjects ─── */

export function SubjectsView() {
  const config: CrudViewConfig = {
    title: 'Subjects', dataKey: 'subjects', fetchKey: 'fetchSubjects',
    createKey: 'createSubject', updateKey: 'updateSubject', deleteKey: 'deleteSubject',
    emptyIcon: BookOpen, emptyTitle: 'No subjects yet', emptyDesc: 'Create your first subject.',
    searchPlaceholder: 'Search subjects...',
    columns: [
      { key: 'code', label: 'Code', render: v => <Badge className="bg-emerald-100 text-emerald-700" variant="outline">{v}</Badge> },
      { key: 'name', label: 'Name' },
      { key: 'hoursWeek', label: 'Hours/Week' },
      { key: 'credits', label: 'Credits' },
      { key: 'sem', label: 'Semester', render: v => v || '-' },
      { key: 'isActive', label: 'Status', render: v => <Badge className={v ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{v ? 'Active' : 'Inactive'}</Badge> },
    ],
    formFields: [
      { key: 'code', label: 'Code', type: 'text', placeholder: 'CS101' },
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Computer Science 101' },
      { key: 'hoursWeek', label: 'Hours/Week', type: 'number' },
      { key: 'credits', label: 'Credits', type: 'number' },
      { key: 'sem', label: 'Semester', type: 'number', placeholder: 'Optional' },
    ],
    transformForm: (form) => ({ ...form, hoursWeek: parseInt(form.hoursWeek), credits: parseInt(form.credits), sem: parseInt(form.sem) || null }),
  }
  return <CrudView config={config} />
}

/* ─── Rooms ─── */

export function RoomsView() {
  const config: CrudViewConfig = {
    title: 'Rooms', dataKey: 'rooms', fetchKey: 'fetchRooms',
    createKey: 'createRoom', updateKey: 'updateRoom', deleteKey: 'deleteRoom',
    emptyIcon: Building2, emptyTitle: 'No rooms yet', emptyDesc: 'Add your first room.',
    searchPlaceholder: 'Search rooms...',
    columns: [
      { key: 'code', label: 'Code', render: v => <Badge className="bg-teal-100 text-teal-700" variant="outline">{v}</Badge> },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type', render: v => <Badge variant="outline">{v}</Badge> },
      { key: 'capacity', label: 'Capacity' },
      { key: 'building', label: 'Building', render: v => v || '-' },
      { key: 'hasProjector', label: 'Projector', render: v => v ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
      { key: 'hasComputers', label: 'Computers', render: v => v ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
    ],
    formFields: [
      { key: 'code', label: 'Code', type: 'text', placeholder: 'R101' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'select', options: [
        { label: 'Classroom', value: 'CLASSROOM' }, { label: 'Laboratory', value: 'LAB' }, { label: 'Auditorium', value: 'AUDITORIUM' },
      ]},
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'building', label: 'Building', type: 'text' },
      { key: 'hasProjector', label: 'Projector', type: 'checkbox' },
      { key: 'hasComputers', label: 'Computers', type: 'checkbox' },
      { key: 'hasAC', label: 'Air Conditioning', type: 'checkbox' },
      { key: 'hasWhiteboard', label: 'Whiteboard', type: 'checkbox' },
    ],
    transformForm: (form) => ({ ...form, capacity: parseInt(form.capacity) }),
  }
  return <CrudView config={config} />
}

/* ─── Classes ─── */

export function ClassesView() {
  const store = useStore()
  const config: CrudViewConfig = {
    title: 'Classes', dataKey: 'classes', fetchKey: 'fetchClasses',
    createKey: 'createClass', updateKey: 'updateClass', deleteKey: 'deleteClass',
    extraFetchKeys: ['fetchSubjects', 'fetchProfiles', 'fetchRooms'],
    emptyIcon: School, emptyTitle: 'No classes yet', emptyDesc: 'Create your first class.',
    searchPlaceholder: 'Search classes...',
    columns: [
      { key: 'code', label: 'Code', render: v => <Badge className="bg-cyan-100 text-cyan-700" variant="outline">{v}</Badge> },
      { key: 'subject', label: 'Subject', render: (v) => <span className="text-sm">{v?.name || '-'}</span> },
      { key: 'teacher', label: 'Teacher', render: (v) => <span className="text-sm">{v?.displayName || '-'}</span> },
      { key: 'room', label: 'Room', render: (v) => <Badge variant="outline">{v?.code || '-'}</Badge> },
      { key: 'weekday', label: 'Day' },
      { key: 'startTime', label: 'Time', render: (v, r) => <span className="text-sm">{v} - {r.endTime}</span> },
      { key: 'vacancies', label: 'Vacancies' },
    ],
    formFields: [
      { key: 'code', label: 'Code', type: 'text', placeholder: 'CS101-A' },
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Optional' },
      { key: 'weekday', label: 'Day', type: 'select', options: WEEKDAYS.map(d => ({ label: d, value: d })) },
      { key: 'startTime', label: 'Start', type: 'time' },
      { key: 'endTime', label: 'End', type: 'time' },
      { key: 'vacancies', label: 'Vacancies', type: 'number' },
    ],
    transformForm: (form) => ({ ...form, vacancies: parseInt(form.vacancies) }),
  }
  return <CrudView config={config} />
}
