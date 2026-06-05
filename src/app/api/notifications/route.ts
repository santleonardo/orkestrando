import { NextRequest, NextResponse } from 'next/server'
import { createNotificationSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile } from '@/lib/supabase/data-store'
import type { Notification, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/notifications - List user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    const isRead = searchParams.get('isRead')
    const type = searchParams.get('type')

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'userId é obrigatório' } },
        { status: 400 }
      )
    }

    const store = getStore()
    let notifications = [...store.notifications]

    // Filter by user
    notifications = notifications.filter((n) => n.userId === userId)

    // Filters
    if (isRead !== null && isRead !== '') {
      notifications = notifications.filter((n) => n.isRead === (isRead === 'true'))
    }
    if (type) {
      notifications = notifications.filter((n) => n.type === type)
    }

    // Sort by most recent
    notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const result = paginate(notifications, page, limit)

    // Compute unread count
    const unreadCount = store.notifications.filter(
      (n) => n.userId === userId && !n.isRead
    ).length

    return NextResponse.json<PaginatedResponse<Notification>>({
      data: result.data,
      pagination: result.pagination,
      unreadCount,
    })
  } catch (error) {
    console.error('[API/notifications] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createNotificationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()
    const data = parsed.data

    const notification: Notification = {
      id: crypto.randomUUID(),
      userId: data.userId,
      organizationId: data.organizationId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      channel: data.channel || ['in_app'],
      isRead: false,
      actionUrl: data.actionUrl,
      metadata: body.metadata || undefined,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.notifications, notification)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    // Support bulk notification
    if (body.bulkUserIds && Array.isArray(body.bulkUserIds)) {
      const bulkNotifications = body.bulkUserIds
        .filter((uid: string) => uid !== data.userId)
        .map((uid: string) => ({
          id: crypto.randomUUID(),
          userId: uid,
          organizationId: data.organizationId,
          title: data.title,
          message: data.message,
          type: data.type || 'info' as Notification['type'],
          channel: data.channel || ['in_app'] as Notification['channel'],
          isRead: false,
          actionUrl: data.actionUrl,
          createdAt: now,
          updatedAt: now,
        }))

      for (const notif of bulkNotifications) {
        insertItem(store.notifications, notif)
      }

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: notification,
          meta: { bulkCount: bulkNotifications.length + 1 },
          message: `Notificação criada para ${bulkNotifications.length + 1} usuários`,
        },
        { status: 201 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: notification, message: 'Notificação criada com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/notifications] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Mark as read / mark all as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const store = getStore()
    const now = new Date().toISOString()

    // Mark all as read for a user
    if (body.markAllAsRead && body.userId) {
      const notifications = store.notifications.filter(
        (n) => n.userId === body.userId && !n.isRead
      )

      for (const notif of notifications) {
        notif.isRead = true
        notif.readAt = now
        notif.updatedAt = now
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: { markedCount: notifications.length },
        message: `${notifications.length} notificações marcadas como lidas`,
      })
    }

    // Mark single notification as read
    if (body.notificationId) {
      const notification = store.notifications.find((n) => n.id === body.notificationId)

      if (!notification) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'NOT_FOUND', message: 'Notificação não encontrada' } },
          { status: 404 }
        )
      }

      notification.isRead = true
      notification.readAt = now
      notification.updatedAt = now

      return NextResponse.json<ApiResponse>({
        success: true,
        data: notification,
        message: 'Notificação marcada como lida',
      })
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Especifique notificationId ou markAllAsRead + userId' } },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API/notifications] PUT error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
