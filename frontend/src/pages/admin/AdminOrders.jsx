import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, ChevronRight } from 'lucide-react'
import { formatPrice, formatDate, STATUS_COLORS, ORDER_STATUSES } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const page   = parseInt(searchParams.get('page') || '1')
  const LIMIT  = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, sort: 'newest' })
      if (search) params.set('q', search)
      if (status) params.set('status', status)
      const r = await api.get(`/admin/orders?${params}`)
      setOrders(r.data.orders || [])
      setTotal(r.data.total || 0)
    } catch {}
    setLoading(false)
  }, [search, status, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    if (key !== 'page') p.set('page', '1')
    setSearchParams(p)
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      setOrders(o => o.map(order => order._id === orderId ? { ...order, status: newStatus } : order))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-normal text-walnut">Orders</h1>
        <p className="text-stone text-sm mt-1">{total} order{total !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input type="text" placeholder="Search by name, order#…" value={search}
            onChange={e => set('q', e.target.value)} className="form-input pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => set('status', '')}
            className={`px-3 py-2 text-xs font-medium border rounded-sm transition-colors ${!status ? 'bg-walnut text-white border-walnut' : 'border-bone text-stone hover:border-walnut'}`}>
            All
          </button>
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => set('status', s)}
              className={`px-3 py-2 text-xs font-medium border rounded-sm transition-colors ${status === s ? 'bg-walnut text-white border-walnut' : 'border-bone text-stone hover:border-walnut'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-bone rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-bone border-t-gold rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-stone text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bone bg-ivory">
                  {['Order', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-stone whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-bone/50 last:border-b-0 hover:bg-ivory/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order._id}`} className="font-mono text-xs font-semibold text-walnut hover:text-gold transition-colors">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone text-xs">{order.customer?.name}</td>
                    <td className="px-4 py-3 text-stone text-xs">{order.customer?.phone}</td>
                    <td className="px-4 py-3 text-stone text-xs">{order.items?.reduce((s,i) => s + i.qty, 0)}</td>
                    <td className="px-4 py-3 font-semibold text-walnut text-xs">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <select value={order.status}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border-0 cursor-pointer outline-none ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-stone text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order._id}`} className="text-gold hover:text-walnut transition-colors">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => set('page', n)}
              className={`w-9 h-9 rounded-sm text-sm font-medium transition-colors ${n === page ? 'bg-walnut text-white' : 'border border-bone text-stone hover:border-walnut'}`}>
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
