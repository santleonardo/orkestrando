import { NextRequest, NextResponse } from 'next/server'
import { createMessageSchema, createConversationSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile } from '@/lib/supabase/data-store'
import type { Conversation, Message, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/messages - List conversations and messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')
    const type = searchParams.get('type')

    const store = getStore()

    // If a specific conversation is requested, return its messages
    if (conversationId) {
      const conversation = store.conversations.find((c) => c.id === conversationId)
      if (!conversation) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'NOT_FOUND', message: 'Conversa não encontrada' } },
          { status: 404 }
        )
      }

      let messages = store.messages
        .filter((m) => m.conversationId === conversationId && m.status !== 'deleted')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

      const result = paginate(messages, page, limit)

      // Enrich messages with sender names
      const enrichedData = result.data.map((m) => {
        const senderProfile = getProfile(m.senderId)
        return {
          ...m,
          senderName: senderProfile.fullName,
          senderFirstName: senderProfile.firstName,
        }
      })

      // Enrich conversation
      const participants = conversation.participantIds.map((pid) => {
        const profile = getProfile(pid)
        return { id: pid, name: profile.fullName, avatarUrl: null }
      })

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          conversation: {
            ...conversation,
            participants,
          },
          messages: enrichedData,
          pagination: result.pagination,
        },
      })
    }

    // Otherwise, return conversation list
    let conversations = [...store.conversations]

    // Filter by user participation
    if (userId) {
      conversations = conversations.filter((c) => c.participantIds.includes(userId))
    }
    if (type) {
      conversations = conversations.filter((c) => c.type === type)
    }

    // Exclude archived
    conversations = conversations.filter((c) => !c.isArchived)

    // Sort by last message time
    conversations.sort((a, b) => (b.lastMessageAt || b.createdAt).localeCompare(a.lastMessageAt || a.createdAt))

    const result = paginate(conversations, page, limit)

    // Enrich with participant details
    const enrichedData = result.data.map((conv) => {
      const participants = conv.participantIds.map((pid) => {
        const profile = getProfile(pid)
        return { id: pid, name: profile.fullName, avatarUrl: null }
      })
      const unreadCount = store.messages.filter(
        (m) => m.conversationId === conv.id && m.senderId !== userId && m.status === 'sent'
      ).length

      return {
        ...conv,
        participants,
        unreadCount,
        displayTitle: conv.type === 'direct' && participants.length === 2
          ? participants.find((p) => p.id !== userId)?.name || conv.title
          : conv.title,
      }
    })

    return NextResponse.json<PaginatedResponse<Conversation & { participants: { id: string; name: string }[]; unreadCount: number }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/messages] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send message or create conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const store = getStore()
    const now = new Date().toISOString()

    // Check if this is a new conversation or a message
    if (body.participantIds) {
      // Create conversation
      const parsed = createConversationSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
          { status: 400 }
        )
      }

      const conversation: Conversation = {
        id: crypto.randomUUID(),
        organizationId: parsed.data.organizationId,
        type: parsed.data.type || 'direct',
        title: parsed.data.title,
        avatarUrl: null,
        participantIds: parsed.data.participantIds,
        isArchived: false,
        metadata: body.metadata || undefined,
        createdAt: now,
        updatedAt: now,
      }

      const result = insertItem(store.conversations, conversation)

      if (result.error) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
          { status: 500 }
        )
      }

      const participants = conversation.participantIds.map((pid) => {
        const profile = getProfile(pid)
        return { id: pid, name: profile.fullName }
      })

      return NextResponse.json<ApiResponse>(
        { success: true, data: { ...conversation, participants }, message: 'Conversa criada com sucesso' },
        { status: 201 }
      )
    }

    // Send message
    const parsed = createMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    // Validate conversation exists
    const conversation = store.conversations.find((c) => c.id === parsed.data.conversationId)
    if (!conversation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversa não encontrada' } },
        { status: 404 }
      )
    }

    const message: Message = {
      id: crypto.randomUUID(),
      conversationId: parsed.data.conversationId,
      senderId: parsed.data.senderId,
      content: parsed.data.content,
      status: 'sent',
      messageType: parsed.data.messageType || 'text',
      replyToId: parsed.data.replyToId,
      isEdited: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.messages, message)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    // Update conversation's last message info
    conversation.lastMessageAt = now
    conversation.lastMessagePreview = parsed.data.content.substring(0, 100)
    conversation.updatedAt = now

    const senderProfile = getProfile(parsed.data.senderId)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ...message, senderName: senderProfile.fullName },
        message: 'Mensagem enviada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/messages] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
