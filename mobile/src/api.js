import Constants from 'expo-constants'
import { Platform } from 'react-native'

// The phone reaches the API on the laptop's Wi-Fi address. Expo already knows that address
// (it is in hostUri, e.g. "192.168.1.5:8081"), so reuse its host with the API port.
function apiBase() {
  if (Platform.OS === 'web') return 'http://localhost:5003/api'
  const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost'
  return `http://${host}:5003/api`
}

export const API_URL = apiBase()

let token = null
export const setToken = (value) => {
  token = value
}

// fetch wrapper: adds the JWT token and turns error responses into exceptions
export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(`Cannot reach the server at ${API_URL}. Is it running, and is the phone on the same Wi-Fi?`)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

// '2026-11-05 11:00:00' -> 'Thu, 5 Nov, 11:00 am'
export const formatDateTime = (value) =>
  new Date(value.replace(' ', 'T')).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  })

export const COLORS = {
  primary: '#0f766e',
  light: '#ecfdf5',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  danger: '#dc2626',
  background: '#f2f7f7',
}
