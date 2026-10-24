// Small fetch wrapper: adds the JWT token and turns error responses into exceptions
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const STATUS_COLORS = { Booked: 'primary', Completed: 'success', Cancelled: 'secondary' }

// '2026-11-05 11:00:00' -> 'Thu, 5 Nov 2026, 11:00 am'
export const formatDateTime = (value) =>
  new Date(value.replace(' ', 'T')).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })

export const formatDate = (value) =>
  new Date(value.replace(' ', 'T')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
