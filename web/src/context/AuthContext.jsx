import { createContext, useContext, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext()

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  // Keep the logged-in user in state and localStorage
  const updateUser = (next) => {
    localStorage.setItem('user', JSON.stringify(next))
    setUser(next)
  }

  const saveSession = ({ token, user }) => {
    localStorage.setItem('token', token)
    updateUser(user)
  }

  const login = async (email, password) => saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }))

  const register = async (form) => saveSession(await api('/auth/register', { method: 'POST', body: form }))

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
