import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event, payload } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event) {
      case 'new_class': {
        const { classId, participantIds } = payload
        const notifications = participantIds.map((userId: string) => ({
          user_id: userId,
          title: 'Nova Turma',
          message: 'Você foi adicionado a uma nova turma.',
          type: 'class',
          reference_id: classId,
          is_read: false,
        }))
        await supabase.from('notifications').insert(notifications)
        break
      }
      case 'schedule_change': {
        const { classId, userIds, oldDate, newDate } = payload
        const notifications = userIds.map((userId: string) => ({
          user_id: userId,
          title: 'Alteração de Horário',
          message: `O horário de uma aula foi alterado.`,
          type: 'schedule',
          reference_id: classId,
          is_read: false,
        }))
        await supabase.from('notifications').insert(notifications)
        break
      }
      case 'class_cancelled': {
        const { classId, userIds } = payload
        const notifications = userIds.map((userId: string) => ({
          user_id: userId,
          title: 'Aula Cancelada',
          message: 'Uma aula foi cancelada.',
          type: 'schedule',
          reference_id: classId,
          is_read: false,
        }))
        await supabase.from('notifications').insert(notifications)
        break
      }
      case 'new_material': {
        const { materialId, classId, userIds, materialName } = payload
        const notifications = userIds.map((userId: string) => ({
          user_id: userId,
          title: 'Novo Material',
          message: `Novo material disponível: ${materialName}`,
          type: 'material',
          reference_id: materialId,
          is_read: false,
        }))
        await supabase.from('notifications').insert(notifications)
        break
      }
      case 'low_attendance': {
        const { studentId, classId, rate } = payload
        await supabase.from('notifications').insert({
          user_id: studentId,
          title: 'Frequência Baixa',
          message: `Sua frequência está em ${rate}%.`,
          type: 'attendance',
          reference_id: classId,
          is_read: false,
        })
        break
      }
      case 'new_message': {
        const { conversationId, senderId, messagePreview } = payload
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
        const otherParticipants = (participants || [])
          .filter((p: any) => p.user_id !== senderId)
          .map((p: any) => ({
            user_id: p.user_id,
            title: 'Nova Mensagem',
            message: messagePreview,
            type: 'message',
            reference_id: conversationId,
            is_read: false,
          }))
        if (otherParticipants.length > 0) {
          await supabase.from('notifications').insert(otherParticipants)
        }
        break
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
