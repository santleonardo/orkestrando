import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
} from '@/lib/api-utils'

// ==================== POST /api/ai/suggest ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, z.object({
      semesterId: z.string().optional(),
      classId: z.string().optional(),
      teacherId: z.string().optional(),
      constraint: z.string().optional(),
    }))

    // PLACEHOLDER: In production, integrate with AI service (OpenAI, etc.)
    // For now, provide data-driven suggestions based on existing schedule data

    const classes = await db.class.findMany({
      where: {
        ...(body.classId ? { id: body.classId } : {}),
        ...(body.semesterId ? { semesterId: body.semesterId } : {}),
      },
      include: {
        subject: true,
        teacher: {
          include: { availability: { where: body.semesterId ? { semesterId: body.semesterId } : undefined } },
        },
        room: true,
        semester: true,
        sessions: { orderBy: { date: 'desc' }, take: 5 },
        _count: { select: { enrollments: true, sessions: true } },
      },
    })

    // Generate suggestions based on data analysis
    const suggestions: Array<{
      type: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      classId: string
      classCode: string
      message: string
      action: string
    }> = []

    for (const classItem of classes) {
      // Suggestion 1: No room assigned
      if (!classItem.roomId) {
        suggestions.push({
          type: 'ROOM_ASSIGNMENT',
          priority: 'HIGH',
          classId: classItem.id,
          classCode: classItem.code,
          message: `Class "${classItem.name}" (${classItem.code}) has no room assigned`,
          action: 'Assign a room with sufficient capacity for the enrolled students',
        })
      }

      // Suggestion 2: Over capacity
      if (classItem._count.enrollments > 0 && classItem.room && classItem._count.enrollments > classItem.room.capacity) {
        suggestions.push({
          type: 'OVERCAPACITY',
          priority: 'HIGH',
          classId: classItem.id,
          classCode: classItem.code,
          message: `Class "${classItem.name}" has ${classItem._count.enrollments} students but room capacity is ${classItem.room.capacity}`,
          action: 'Move to a larger room or reduce enrollment',
        })
      }

      // Suggestion 3: Teacher has limited availability
      if (classItem.teacher?.availability && classItem.teacher.availability.length < 3) {
        suggestions.push({
          type: 'AVAILABILITY',
          priority: 'MEDIUM',
          classId: classItem.id,
          classCode: classItem.code,
          message: `Teacher has only ${classItem.teacher.availability.length} availability slots for scheduling`,
          action: 'Consider adding more availability slots or redistributing classes',
        })
      }

      // Suggestion 4: High student count
      if (classItem._count.enrollments >= classItem.maxStudents * 0.9) {
        suggestions.push({
          type: 'ENROLLMENT',
          priority: 'MEDIUM',
          classId: classItem.id,
          classCode: classItem.code,
          message: `Class is at ${Math.round((classItem._count.enrollments / classItem.maxStudents) * 100)}% capacity (${classItem._count.enrollments}/${classItem.maxStudents})`,
          action: 'Consider creating an additional section',
        })
      }
    }

    // Sort by priority
    suggestions.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    return apiResponse({
      suggestions,
      totalSuggestions: suggestions.length,
      highPriority: suggestions.filter((s) => s.priority === 'HIGH').length,
      mediumPriority: suggestions.filter((s) => s.priority === 'MEDIUM').length,
      lowPriority: suggestions.filter((s) => s.priority === 'LOW').length,
      generatedAt: new Date().toISOString(),
      note: 'AI-powered suggestions will be enhanced with LLM integration',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
