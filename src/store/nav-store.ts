import { create } from 'zustand'

export type ViewId =
  | 'dashboard'
  | 'courses'
  | 'disciplines'
  | 'semesters'
  | 'rooms'
  | 'classes'
  | 'enrollments'
  | 'calendar'
  | 'availability'
  | 'lessons'
  | 'attendance'
  | 'materials'
  | 'messages'
  | 'reports'
  | 'audit'
  | 'ai-assistant'
  | 'student-portal'
  | 'settings'

interface NavState {
  currentView: ViewId
  sidebarOpen: boolean
  setCurrentView: (view: ViewId) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useNavStore = create<NavState>()((set) => ({
  currentView: 'dashboard',
  sidebarOpen: true,
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
