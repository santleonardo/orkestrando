import { useAuthStore } from '@/store/auth-store'

function getAuthHeaders(): Record<string, string> {
  const state = useAuthStore.getState()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (state.user) {
    headers['x-user-id'] = state.user.id
    headers['x-user-email'] = state.user.email
  }
  return headers
}

const api = {
  get: (url: string) =>
    fetch(url, { headers: getAuthHeaders() }).then((r) => {
      if (!r.ok) return r.json().then((d) => ({ error: d.error || 'Erro' }))
      return r.json()
    }),

  post: (url: string, data: Record<string, unknown>) =>
    fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => ({ error: d.error || 'Erro' }))
      return r.json()
    }),

  put: (url: string, data: Record<string, unknown>) =>
    fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => ({ error: d.error || 'Erro' }))
      return r.json()
    }),

  delete: (url: string) =>
    fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => ({ error: d.error || 'Erro' }))
      return r.json()
    }),
}

export { api }
