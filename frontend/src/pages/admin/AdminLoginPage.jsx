import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-walnut flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-normal text-white tracking-widest mb-1">Velour</h1>
          <p className="text-white/40 text-xs font-medium tracking-widest uppercase">Admin Portal</p>
        </div>

        <div className="bg-white rounded-sm shadow-2xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-ivory-dark rounded-full mb-6 mx-auto">
            <Lock size={20} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl font-normal text-walnut text-center mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="form-input"
                placeholder="admin@velour.co.uk"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-walnut transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">Velour Furniture — Admin Access Only</p>
      </div>
    </div>
  )
}
