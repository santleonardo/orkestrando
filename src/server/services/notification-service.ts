// =============================================================================
// ORKESTRANDO - Notification Service
// Handles in-app, email, and push notifications
// =============================================================================

import { v4 as uuidv4 } from 'uuid'
import type { Notification } from '@/lib/types'

// In production, these would be replaced by actual email/push service integrations
// such as SendGrid, AWS SES, Firebase Cloud Messaging, or OneSignal

export class NotificationService {
  /**
   * Creates an in-app notification record
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    channel: Array<'in_app' | 'email' | 'push'> = ['in_app'],
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      organizationId: metadata?.organizationId as string || '',
      title,
      message,
      type: type as Notification['type'],
      channel,
      isRead: false,
      actionUrl,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production, this would insert into the database
    // await db.notification.create({ data: notification })

    // If email channel is requested, send email in background
    if (channel.includes('email') && metadata?.email) {
      this.sendEmail(
        metadata.email as string,
        title,
        message
      ).catch(console.error)
    }

    // If push channel is requested, send push notification
    if (channel.includes('push')) {
      this.sendPush(userId, title, message).catch(console.error)
    }

    return notification
  }

  /**
   * Sends an email notification
   * In production, integrate with SendGrid, AWS SES, or similar
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<void> {
    // Placeholder for email integration
    // In production:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({ to, from: 'noreply@orkestrando.com', subject, html: body })

    console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${body.substring(0, 100)}...`)
  }

  /**
   * Sends a push notification
   * In production, integrate with Firebase Cloud Messaging or OneSignal
   */
  async sendPush(
    userId: string,
    title: string,
    body: string
  ): Promise<void> {
    // Placeholder for push notification integration
    // In production:
    // const admin = require('firebase-admin')
    // const message = { notification: { title, body }, token: userFcmToken }
    // await admin.messaging().send(message)

    console.log(`[PUSH] UserId: ${userId} | Title: ${title} | Body: ${body.substring(0, 100)}...`)
  }

  /**
   * Notifies participants when a new class is created
   */
  async notifyNewClass(
    classId: string,
    className: string,
    participantIds: string[],
    organizationId: string
  ): Promise<void> {
    const notifications = participantIds.map((userId) =>
      this.createNotification(
        userId,
        'Nova turma disponível',
        `Uma nova turma "${className}" foi criada e está disponível para matrícula.`,
        'info',
        ['in_app', 'push'],
        undefined,
        { classId, organizationId }
      )
    )

    await Promise.all(notifications)
  }

  /**
   * Notifies participants when a class schedule is changed
   */
  async notifyScheduleChange(
    classId: string,
    className: string,
    oldDate: string,
    newDate: string,
    participantIds: string[],
    organizationId: string
  ): Promise<void> {
    const notifications = participantIds.map((userId) =>
      this.createNotification(
        userId,
        'Alteração de horário',
        `O horário da turma "${className}" foi alterado de ${oldDate} para ${newDate}. Verifique o cronograma atualizado.`,
        'warning',
        ['in_app', 'email', 'push'],
        undefined,
        { classId, organizationId, oldDate, newDate }
      )
    )

    await Promise.all(notifications)
  }

  /**
   * Notifies when a student has low attendance rate
   */
  async notifyLowAttendance(
    studentId: string,
    studentName: string,
    classId: string,
    className: string,
    rate: number,
    organizationId: string,
    coordinatorIds: string[]
  ): Promise<void> {
    // Notify the student
    await this.createNotification(
      studentId,
      'Alerta de frequência',
      `Sua frequência na turma "${className}" está em ${rate.toFixed(1)}%. Procure manter uma frequência mínima de 75%.`,
      'warning',
      ['in_app', 'email', 'push'],
      undefined,
      { classId, organizationId }
    )

    // Notify coordinators
    const coordinatorNotifications = coordinatorIds.map((coordinatorId) =>
      this.createNotification(
        coordinatorId,
        'Alerta de frequência baixa',
        `O aluno ${studentName} na turma "${className}" está com frequência de ${rate.toFixed(1)}%. Ação pode ser necessária.`,
        'warning',
        ['in_app', 'email'],
        undefined,
        { classId, organizationId, studentId }
      )
    )

    await Promise.all(coordinatorNotifications)
  }

  /**
   * Notifies when new material is uploaded to a class
   */
  async notifyNewMaterial(
    classId: string,
    className: string,
    materialName: string,
    uploadedByName: string,
    participantIds: string[],
    organizationId: string
  ): Promise<void> {
    const notifications = participantIds.map((userId) =>
      this.createNotification(
        userId,
        'Novo material disponível',
        `${uploadedByName} adicionou o material "${materialName}" na turma "${className}".`,
        'info',
        ['in_app', 'push'],
        undefined,
        { classId, organizationId }
      )
    )

    await Promise.all(notifications)
  }

  /**
   * Notifies participants when a new message is sent in a conversation
   */
  async notifyNewMessage(
    conversationId: string,
    senderName: string,
    senderId: string,
    recipientIds: string[],
    messagePreview: string,
    organizationId: string
  ): Promise<void> {
    // Don't notify the sender
    const recipients = recipientIds.filter((id) => id !== senderId)

    const notifications = recipients.map((userId) =>
      this.createNotification(
        userId,
        `Nova mensagem de ${senderName}`,
        messagePreview.substring(0, 150),
        'info',
        ['in_app', 'push'],
        `/messages/${conversationId}`,
        { conversationId, organizationId, senderId }
      )
    )

    await Promise.all(notifications)
  }

  /**
   * Notifies when an assignment is created
   */
  async notifyNewAssignment(
    classId: string,
    className: string,
    assignmentTitle: string,
    dueDate: string,
    participantIds: string[],
    organizationId: string
  ): Promise<void> {
    const notifications = participantIds.map((userId) =>
      this.createNotification(
        userId,
        'Nova atividade',
        `Nova atividade "${assignmentTitle}" na turma "${className}". Data de entrega: ${dueDate}.`,
        'info',
        ['in_app', 'push'],
        undefined,
        { classId, organizationId }
      )
    )

    await Promise.all(notifications)
  }

  /**
   * Notifies when a grade is published
   */
  async notifyGradePublished(
    studentId: string,
    classId: string,
    className: string,
    assignmentTitle: string,
    grade: number,
    organizationId: string
  ): Promise<void> {
    await this.createNotification(
      studentId,
      'Nota publicada',
      `Sua nota na atividade "${assignmentTitle}" da turma "${className}" foi publicada: ${grade.toFixed(1)}.`,
      'success',
      ['in_app', 'email', 'push'],
      undefined,
      { classId, organizationId }
    )
  }

  /**
   * Sends a bulk notification to multiple users
   */
  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: string = 'info',
    channel: Array<'in_app' | 'email' | 'push'> = ['in_app'],
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const notifications = userIds.map((userId) =>
      this.createNotification(
        userId,
        title,
        message,
        type,
        channel,
        actionUrl,
        { ...metadata, userId }
      )
    )

    // Process in batches to avoid overwhelming the system
    const batchSize = 50
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize)
      await Promise.all(batch)
    }
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // In production: await db.notification.update({ where: { id: notificationId }, data: { isRead: true, readAt: new Date() } })
    console.log(`[NOTIFICATION] Marked as read: ${notificationId}`)
  }

  /**
   * Marks all notifications for a user as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    // In production: await db.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } })
    console.log(`[NOTIFICATION] All marked as read for user: ${userId}`)
  }
}
