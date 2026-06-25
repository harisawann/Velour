import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  LogOut, Menu, X, ChevronRight, BarChart2
} from 'lucide-react'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/products',  icon: Package,         label: 'Products' },
  { to: '/admin/customers', icon: Users,           label: 'Customers' },
]

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'flex flex-col h-full' : 'hidden lg:flex flex-col h-full'} bg-walnut`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/admin/dashboard" className="font-display text-2xl font-normal text-white tracking-widest">
          Velour
        </Link>
        {mobile && (
          <button onClick={() => setSideOpen(false)} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
      {/* Admin badge */}
      <div className="px-6 py-4 border-b border-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">Logged in as</p>
        <p className="text-white/80 text-sm font-medium truncate">{admin?.email}</p>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to} onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 text-sm font-medium transition-colors ${active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/8'}`}>
              <Icon size={17} strokeWidth={1.75} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </Link>
          )
        })}
      </nav>
      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-1">
          View Store ↗
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-red-400 transition-colors w-full rounded-sm hover:bg-white/5">
          <LogOut size={17} strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0">
        <div className="fixed top-0 left-0 bottom-0 w-56">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSideOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-56">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-walnut border-b border-white/10">
          <button onClick={() => setSideOpen(true)} className="text-white/70 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <span className="font-display text-xl text-white tracking-widest">Velour</span>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
