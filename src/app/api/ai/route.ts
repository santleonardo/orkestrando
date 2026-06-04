import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPTS: Record<string, string> = {
  schedule_suggestion: `You are an academic scheduling assistant for ORKESTRANDO, a university management system.
Given the context of teachers, rooms, disciplines, and existing schedules, suggest optimal scheduling arrangements.
Consider: teacher availability, room capacity, avoiding conflicts, and balanced distribution.
Respond in Portuguese.`,

  conflict_detection: `You are an academic conflict detection assistant for ORKESTRANDO.
Analyze scheduling data and identify potential conflicts: teacher overlaps, room double-bookings, student schedule clashes.
Provide clear explanations and suggest resolutions.
Respond in Portuguese.`,

  dropout_prediction: `You are a student retention analysis assistant for ORKESTRANDO.
Analyze student attendance, grades, and engagement patterns to identify at-risk students.
Provide early warning indicators and suggest intervention strategies.
Respond in Portuguese.`,

  academic_assistant: `You are a general academic assistant for ORKESTRANDO university management system.
Help with questions about courses, disciplines, enrollment, scheduling, and academic policies.
Be helpful, accurate, and respond in Portuguese.`,

  auto_report: `You are an academic report generation assistant for ORKESTRANDO.
Analyze the provided data and generate clear, structured academic reports with insights and recommendations.
Respond in Portuguese with well-formatted text.`,
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { type, prompt, context, targetId } = body

    if (!type || !prompt) {
      return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 })
    }

    const validTypes = ['schedule_suggestion', 'conflict_detection', 'dropout_prediction', 'academic_assistant', 'auto_report']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const zai = await ZAI.create()

    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.academic_assistant
    const contextStr = context ? `\n\nContext/Additional Data:\n${JSON.stringify(context, null, 2)}` : ''

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prompt + contextStr },
    ]

    const response = await zai.chat.completions.create({
      messages,
    })

    const aiResponse = response?.choices?.[0]?.message?.content || 'Não foi possível gerar uma resposta.'

    // Save suggestion to database
    const suggestion = await db.aiSuggestion.create({
      data: {
        type,
        targetId,
        prompt,
        response: aiResponse,
        parameters: context ? JSON.stringify(context) : undefined,
        createdBy: user.id,
      },
    })

    return NextResponse.json({ data: { suggestion, response: aiResponse } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error generating AI suggestion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
