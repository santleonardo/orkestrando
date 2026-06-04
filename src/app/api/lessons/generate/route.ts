import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'
import { generateLessons } from '@/lib/class-generator'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { classId } = body

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 })
    }

    // Delete existing lessons for the class
    await db.lesson.deleteMany({ where: { classId } })

    // Generate new lessons
    const count = await generateLessons(classId)

    return NextResponse.json({
      data: { lessonsGenerated: count },
      message: `Successfully generated ${count} lessons`,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error generating lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
