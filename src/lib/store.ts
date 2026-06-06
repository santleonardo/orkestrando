import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface Profile {
  id: string
  role: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone?: string | null
  avatar?: string | null
  department?: string | null
  course?: string | null
  semester?: number | null
  shift?: string | null
  isActive: boolean
}

interface AppState {
  // Auth
  token: string | null
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Navigation
  activeView: string

  // Data caches
  profiles: Profile[]
  subjects: any[]
  rooms: any[]
  classes: any[]
  enrollments: any[]
  attendance: any[]
  materials: any[]
  conversations: any[]
  messages: any[]
  notifications: any[]
  reports: any[]

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  setActiveView: (view: string) => void

  // Data fetchers
  fetchProfiles: () => Promise<void>
  fetchSubjects: () => Promise<void>
  fetchRooms: () => Promise<void>
  fetchClasses: () => Promise<void>
  fetchEnrollments: () => Promise<void>
  fetchAttendance: () => Promise<void>
  fetchMaterials: () => Promise<void>
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  fetchNotifications: () => Promise<void>
  fetchReports: () => Promise<void>

  // CRUD actions
  createProfile: (data: any) => Promise<void>
  updateProfile: (id: string, data: any) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  createSubject: (data: any) => Promise<void>
  updateSubject: (id: string, data: any) => Promise<void>
  deleteSubject: (id: string) => Promise<void>
  createRoom: (data: any) => Promise<void>
  updateRoom: (id: string, data: any) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
  createClass: (data: any) => Promise<void>
  updateClass: (id: string, data: any) => Promise<void>
  deleteClass: (id: string) => Promise<void>
  createEnrollment: (data: any) => Promise<void>
  updateEnrollment: (id: string, data: any) => Promise<void>
  recordAttendance: (records: any[]) => Promise<void>
  createMaterial: (data: any) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
  sendMessage: (conversationId: string, content: string) => Promise<void>
  createConversation: (data: any) => Promise<void>
  createReport: (data: any) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
}

const headers = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

// Unwrap API response - handles both raw arrays and { success, data } envelopes.
// Always returns an array; returns [] on non-ok responses or unexpected shapes.
async function unwrap(res: Response): Promise<any[]> {
  if (!res.ok) return []
  const json = await res.json()
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object' && 'data' in json && Array.isArray(json.data)) {
    return json.data
  }
  return []
}

export const useStore = create<AppState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  activeView: 'landing',
  profiles: [],
  subjects: [],
  rooms: [],
  classes: [],
  enrollments: [],
  attendance: [],
  materials: [],
  conversations: [],
  messages: [],
  notifications: [],
  reports: [],

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user || !data.session) {
        throw new Error(error?.message || 'Credenciais inválidas')
      }
      // Fetch profile from our API
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      })
      if (!res.ok) throw new Error('Perfil não encontrado. Contate o administrador.')
      const { data: profile } = await res.json()
      set({ token: data.session.access_token, user: profile, isAuthenticated: true, isLoading: false, activeView: 'dashboard' })
    } catch (error: any) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data: any) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Registration failed')
      }
      const result = await res.json()
      set({ token: result.token, user: result.user, isAuthenticated: true, isLoading: false, activeView: 'dashboard' })
    } catch (error: any) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      activeView: 'landing',
      profiles: [],
      subjects: [],
      rooms: [],
      classes: [],
      enrollments: [],
      attendance: [],
      materials: [],
      conversations: [],
      messages: [],
      notifications: [],
      reports: [],
    })
  },

  setActiveView: (view: string) => set({ activeView: view }),

  fetchProfiles: async () => {
    const { token } = get()
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/profiles?role=COORDINATOR', { headers: headers(token) }),
        fetch('/api/profiles?role=PROFESSOR', { headers: headers(token) }),
        fetch('/api/profiles?role=STUDENT', { headers: headers(token) }),
      ])
      const safeJson = async (r: Response): Promise<any[]> => {
        if (!r.ok) return []
        const j = await r.json()
        return Array.isArray(j) ? j : []
      }
      const [coordinators, professors, students] = await Promise.all([
        safeJson(r1), safeJson(r2), safeJson(r3),
      ])
      set({ profiles: [...coordinators, ...professors, ...students] })
    } catch (e) { console.error(e) }
  },

  fetchSubjects: async () => {
    const { token } = get()
    try {
      const res = await fetch('/api/subjects', { headers: headers(token) })
      set({ subjects: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchRooms: async () => {
    const { token } = get()
    try {
      const res = await fetch('/api/rooms', { headers: headers(token) })
      set({ rooms: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchClasses: async () => {
    const { token, user } = get()
    try {
      let url = '/api/classes'
      if (user?.role === 'PROFESSOR') url += `?teacherId=${user.id}`
      if (user?.role === 'STUDENT') url += `?studentId=${user.id}`
      const res = await fetch(url, { headers: headers(token) })
      set({ classes: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchEnrollments: async () => {
    const { token } = get()
    try {
      const res = await fetch('/api/enrollments', { headers: headers(token) })
      set({ enrollments: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchAttendance: async () => {
    const { token } = get()
    try {
      const res = await fetch('/api/attendance', { headers: headers(token) })
      set({ attendance: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchMaterials: async () => {
    const { token } = get()
    try {
      const res = await fetch('/api/materials', { headers: headers(token) })
      set({ materials: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchConversations: async () => {
    const { token, user } = get()
    try {
      const res = await fetch(`/api/conversations?profileId=${user?.id}`, { headers: headers(token) })
      set({ conversations: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchMessages: async (conversationId: string) => {
    const { token } = get()
    try {
      const res = await fetch(`/api/conversations/messages?conversationId=${conversationId}`, { headers: headers(token) })
      set({ messages: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchNotifications: async () => {
    const { token, user } = get()
    try {
      const res = await fetch(`/api/notifications?profileId=${user?.id}`, { headers: headers(token) })
      set({ notifications: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  fetchReports: async () => {
    const { token } = get()
    try {
      const res = await fetch('/api/reports', { headers: headers(token) })
      set({ reports: await unwrap(res) })
    } catch (e) { console.error(e) }
  },

  createProfile: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/profiles', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchProfiles()
  },

  updateProfile: async (id: string, data: any) => {
    const { token } = get()
    const res = await fetch(`/api/profiles/${id}`, {
      method: 'PUT', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchProfiles()
  },

  deleteProfile: async (id: string) => {
    const { token } = get()
    await fetch(`/api/profiles/${id}`, { method: 'DELETE', headers: headers(token) })
    get().fetchProfiles()
  },

  createSubject: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/subjects', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchSubjects()
  },

  updateSubject: async (id: string, data: any) => {
    const { token } = get()
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'PUT', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchSubjects()
  },

  deleteSubject: async (id: string) => {
    const { token } = get()
    await fetch(`/api/subjects/${id}`, { method: 'DELETE', headers: headers(token) })
    get().fetchSubjects()
  },

  createRoom: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/rooms', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchRooms()
  },

  updateRoom: async (id: string, data: any) => {
    const { token } = get()
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'PUT', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchRooms()
  },

  deleteRoom: async (id: string) => {
    const { token } = get()
    await fetch(`/api/rooms/${id}`, { method: 'DELETE', headers: headers(token) })
    get().fetchRooms()
  },

  createClass: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/classes', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchClasses()
  },

  updateClass: async (id: string, data: any) => {
    const { token } = get()
    const res = await fetch(`/api/classes/${id}`, {
      method: 'PUT', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchClasses()
  },

  deleteClass: async (id: string) => {
    const { token } = get()
    await fetch(`/api/classes/${id}`, { method: 'DELETE', headers: headers(token) })
    get().fetchClasses()
  },

  createEnrollment: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/enrollments', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchEnrollments()
  },

  updateEnrollment: async (id: string, data: any) => {
    const { token } = get()
    const res = await fetch(`/api/enrollments/${id}`, {
      method: 'PUT', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchEnrollments()
  },

  recordAttendance: async (records: any[]) => {
    const { token } = get()
    const res = await fetch('/api/attendance', {
      method: 'POST', headers: headers(token), body: JSON.stringify(records),
    })
    if (!res.ok) throw await res.json()
    get().fetchAttendance()
  },

  createMaterial: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/materials', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchMaterials()
  },

  deleteMaterial: async (id: string) => {
    const { token } = get()
    await fetch(`/api/materials/${id}`, { method: 'DELETE', headers: headers(token) })
    get().fetchMaterials()
  },

  sendMessage: async (conversationId: string, content: string) => {
    const { token, user } = get()
    const res = await fetch('/api/conversations/messages', {
      method: 'POST', headers: headers(token),
      body: JSON.stringify({ conversationId, senderId: user?.id, content }),
    })
    if (!res.ok) throw await res.json()
    get().fetchMessages(conversationId)
    get().fetchConversations()
  },

  createConversation: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/conversations', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchConversations()
  },

  createReport: async (data: any) => {
    const { token } = get()
    const res = await fetch('/api/reports', {
      method: 'POST', headers: headers(token), body: JSON.stringify(data),
    })
    if (!res.ok) throw await res.json()
    get().fetchReports()
  },

  markNotificationRead: async (id: string) => {
    const { token } = get()
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT', headers: headers(token),
    })
    get().fetchNotifications()
  },
}))
