'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook for subscribing to Supabase Realtime channel changes on a table.
 */
export function useRealtimeChannel<T extends { [key: string]: unknown }>(
  channelName: string,
  table: string,
  callback: (payload: {
    eventType: string
    new: T
    old: T
  }) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!channelName || !table) return

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table,
        },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as T,
            old: payload.old as T,
          })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [channelName, table, callback, supabase])

  return { isConnected }
}

/**
 * Hook for tracking presence state in a Supabase Realtime channel.
 */
export function useRealtimePresence<T extends { [key: string]: unknown }>(
  channelName: string,
  userState?: T
) {
  const [presenceState, setPresenceState] = useState<Map<string, T>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!channelName) return

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userState ? JSON.stringify(userState) : undefined,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<Map<string, T>>()
        const newState = new Map<string, T>()
        for (const [key, values] of Object.entries(state)) {
          if (values && values.length > 0) {
            newState.set(key, values[0])
          }
        }
        setPresenceState(newState)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setPresenceState((prev) => {
          const next = new Map(prev)
          for (const presence of newPresences) {
            next.set(key, presence as T)
          }
          return next
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setPresenceState((prev) => {
          const next = new Map(prev)
          // Remove only if there are no remaining presences
          const currentPresences = channel.presenceState()
          const remaining = currentPresences[key]
          if (!remaining || remaining.length === 0) {
            next.delete(key)
          }
          return next
        })
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED' && userState) {
          channel.track(userState)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setIsConnected(false)
        setPresenceState(new Map())
      }
    }
  }, [channelName, supabase])

  const trackPresence = (state: T) => {
    if (channelRef.current) {
      channelRef.current.track(state)
    }
  }

  const untrackPresence = () => {
    if (channelRef.current) {
      channelRef.current.untrack()
    }
  }

  return {
    isConnected,
    presenceState: Object.fromEntries(presenceState) as Record<string, T>,
    onlineCount: presenceState.size,
    trackPresence,
    untrackPresence,
  }
}
