import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('velour_admin_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/admin/me')
        .then(res => setAdmin(res.data))
        .catch(() => {
          localStorage.removeItem('velour_admin_token')
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/admin/login', { email, password })
    const { token, admin: adminData } = res.data
    localStorage.setItem('velour_admin_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setAdmin(adminData)
    return adminData
  }

  const logout = () => {
    localStorage.removeItem('velour_admin_token')
    delete api.defaults.headers.common['Authorization']
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be within AdminAuthProvider')
  return ctx
}
