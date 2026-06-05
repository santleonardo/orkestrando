'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types'

interface PermissionHook {
  can: (action: string, resource?: string) => boolean
  cannot: (action: string, resource?: string) => boolean
  isCoordinator: boolean
  isTeacher: boolean
  isStudent: boolean
  isAdmin: boolean
  hasRole: (role: UserRole) => boolean
  role: UserRole | null
  permissions: string[]
  loading: boolean
}

export function usePermissions(
  role: UserRole | null,
  userId?: string
): PermissionHook {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!role || !userId) {
      // Fallback to static permissions for quick UI rendering
      setUserPermissions(getStaticPermissions(role))
      return
    }

    setLoading(true)
    const fetchPermissions = async () => {
      try {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select(
            'role:roles(name, permissions:role_permissions(permission:permissions(name)))'
          )
          .eq('user_id', userId)

        if (userRoles && userRoles.length > 0) {
          const perms = userRoles
            .flatMap((ur: any) =>
              ur.role?.permissions?.map(
                (rp: any) => rp.permission?.name
              ) || []
            )
            .filter(Boolean)
          setUserPermissions(perms)
        } else {
          setUserPermissions(getStaticPermissions(role))
        }
      } catch {
        setUserPermissions(getStaticPermissions(role))
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [role, userId, supabase])

  const can = (action: string, resource?: string): boolean => {
    if (!role) return false
    if (role === 'admin') return true
    const permission = resource ? `${resource}.${action}` : action
    return userPermissions.includes(permission)
  }

  const cannot = (action: string, resource?: string): boolean =>
    !can(action, resource)

  const isCoordinator = role === 'coordinator'
  const isTeacher = role === 'teacher'
  const isStudent = role === 'student'
  const isAdmin = role === 'admin'

  const hasRole = (targetRole: UserRole): boolean => role === targetRole

  return {
    can,
    cannot,
    isCoordinator,
    isTeacher,
    isStudent,
    isAdmin,
    hasRole,
    role,
    permissions: userPermissions,
    loading,
  }
}

// Static fallback (same as PERMISSIONS constant for offline/error resilience)
function getStaticPermissions(role: string | null): string[] {
  if (!role) return []
  const map: Record<string, string[]> = {
    admin: ['*'],
    coordinator: [
      'users.create', 'users.read', 'users.update',
      'teachers.create', 'teachers.read', 'teachers.update',
      'students.create', 'students.read', 'students.update',
      'courses.create', 'courses.read', 'courses.update',
      'subjects.create', 'subjects.read', 'subjects.update',
      'rooms.create', 'rooms.read', 'rooms.update',
      'classes.create', 'classes.read', 'classes.update', 'classes.delete',
      'schedule.create', 'schedule.read', 'schedule.update', 'schedule.delete',
      'availability.create', 'availability.read', 'availability.update', 'availability.approve', 'availability.reject',
      'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
      'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
      'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
      'messages.create', 'messages.read', 'messages.update', 'messages.delete',
      'reports.create', 'reports.read', 'reports.export',
      'semesters.create', 'semesters.read', 'semesters.update',
      'holidays.create', 'holidays.read', 'holidays.update',
      'enrollments.create', 'enrollments.read', 'enrollments.update', 'enrollments.delete',
      'ai.use',
    ],
    teacher: [
      'users.read',
      'students.read',
      'courses.read',
      'subjects.read',
      'rooms.read',
      'classes.read',
      'availability.create', 'availability.read', 'availability.update',
      'attendance.create', 'attendance.read', 'attendance.update', 'attendance.sign',
      'materials.create', 'materials.read', 'materials.update', 'materials.delete', 'materials.publish',
      'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete', 'assignments.grade',
      'messages.create', 'messages.read', 'messages.update', 'messages.delete',
      'reports.read', 'reports.export',
      'ai.use',
      'enrollments.read',
    ],
    student: [
      'users.read',
      'courses.read',
      'subjects.read',
      'classes.read',
      'attendance.read',
      'materials.read',
      'assignments.read',
      'messages.create', 'messages.read',
      'enrollments.read',
      'reports.read',
    ],
  }
  return map[role] || []
}
