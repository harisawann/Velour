import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Users, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { formatPrice, formatDate, STATUS_COLORS } from '../../utils/helpers'
import api from '../../utils/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders?limit=5&sort=newest'),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data.orders || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-bone border-t-gold rounded-full animate-spin" />
    </div>
  )

  const STAT_CARDS = [
    { label: 'Total Orders',   value: stats?.totalOrders ?? 0,             icon: ShoppingBag, color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Revenue',        value: formatPrice(stats?.totalRevenue ?? 0), icon: TrendingUp,  color: 'text-green-600', bg: 'bg-green-50', isStr: true },
    { label: 'Active Products',value: stats?.totalProducts ?? 0,           icon: Package,     color: 'text-purple-600',bg: 'bg-purple-50' },
    { label: 'Customers',      value: stats?.totalCustomers ?? 0,          icon: Users,       color: 'text-gold',     bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-normal text-walnut">Dashboard</h1>
        <p className="text-stone text-sm mt-1">Welcome back. Here's what's happening with Velour.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, isStr }) => (
          <div key={label} className="bg-white border border-bone rounded-sm p-5">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-sm ${bg} mb-3`}>
              <Icon size={20} className={color} strokeWidth={1.75} />
            </div>
            <p className="text-2xl font-semibold text-walnut">{isStr ? value : value.toLocaleString()}</p>
            <p className="text-xs text-stone mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {(stats?.pendingOrders ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''} awaiting confirmation
            </p>
          </div>
          <Link to="/admin/orders?status=Pending" className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1">
            Review <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white border border-bone rounded-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bone">
          <h2 className="font-semibold text-walnut text-sm">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-gold font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-stone text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bone">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-stone">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-bone/50 last:border-b-0 hover:bg-ivory transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${order._id}`} className="font-mono font-semibold text-walnut hover:text-gold transition-colors text-xs">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-stone">{order.customer?.name}</td>
                    <td className="px-6 py-4 text-stone">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 font-semibold text-walnut">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
