import React, { useEffect, useState, useCallback } from 'react'
import { Search, Mail, Phone } from 'lucide-react'
import { formatDate, formatPrice } from '../../utils/helpers'
import api from '../../utils/api'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (search) params.set('q', search)
      const r = await api.get(`/admin/customers?${params}`)
      setCustomers(r.data.customers || [])
      setTotal(r.data.total || 0)
    } catch {}
    setLoading(false)
  }, [search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-normal text-walnut">Customers</h1>
        <p className="text-stone text-sm mt-1">{total} customer{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
        <input type="text" placeholder="Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)} className="form-input pl-9 py-2 text-sm" />
      </div>

      <div className="bg-white border border-bone rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-bone border-t-gold rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-stone text-sm">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bone bg-ivory">
                  {['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'First Order', 'Last Order'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-stone whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c._id} className="border-b border-bone/50 last:border-b-0 hover:bg-ivory/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-walnut">{c.name}</td>
                    <td className="px-5 py-3">
                      <a href={`mailto:${c.email}`} className="text-stone hover:text-gold transition-colors flex items-center gap-1.5">
                        <Mail size={13} />{c.email}
                      </a>
                    </td>
                    <td className="px-5 py-3">
                      <a href={`tel:${c.phone}`} className="text-stone hover:text-gold transition-colors flex items-center gap-1.5">
                        <Phone size={13} />{c.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-stone">{c.orderCount}</td>
                    <td className="px-5 py-3 font-semibold text-walnut">{formatPrice(c.totalSpent)}</td>
                    <td className="px-5 py-3 text-stone text-xs">{c.firstOrder ? formatDate(c.firstOrder) : '—'}</td>
                    <td className="px-5 py-3 text-stone text-xs">{c.lastOrder ? formatDate(c.lastOrder) : '—'}</td>
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
