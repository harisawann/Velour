import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package, User, MapPin, Phone, Mail, CreditCard, Clock } from 'lucide-react'
import { formatPrice, formatDate, STATUS_COLORS, ORDER_STATUSES } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    api.get(`/admin/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => { toast.error('Order not found'); navigate('/admin/orders') })
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus })
      setOrder(o => ({ ...o, status: newStatus }))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      toast.error(err.message)
    }
    setUpdating(false)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-bone border-t-gold rounded-full animate-spin" />
    </div>
  )

  if (!order) return null

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-stone hover:text-walnut transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Orders
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-normal text-walnut">#{order.orderNumber}</h1>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
          </div>
          <p className="text-stone text-sm flex items-center gap-1.5">
            <Clock size={13} /> Placed {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone font-medium">Update status:</span>
          <select
            value={order.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={updating}
            className="form-input py-2 text-sm max-w-[160px] disabled:opacity-60 cursor-pointer"
          >
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white border border-bone rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-bone flex items-center gap-2">
              <Package size={16} className="text-gold" strokeWidth={1.75} />
              <h2 className="font-semibold text-walnut text-sm">Order Items</h2>
            </div>
            <div className="divide-y divide-bone">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-16 h-16 bg-ivory-dark rounded-sm overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {item.category === 'sofa' ? '🛋' : '🛏'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-walnut text-sm truncate">{item.title}</p>
                    {item.variant && <p className="text-xs text-stone mt-0.5">{item.variant}</p>}
                    <p className="text-xs text-stone mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-walnut text-sm">{formatPrice(item.price * item.qty)}</p>
                    <p className="text-xs text-stone">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-ivory border-t border-bone">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-walnut">Order Total</span>
                <span className="text-lg font-semibold text-walnut">{formatPrice(order.total)}</span>
              </div>
              {order.paymentMethod && (
                <p className="text-xs text-stone mt-1 flex items-center gap-1.5">
                  <CreditCard size={12} /> Payment: {order.paymentMethod}
                </p>
              )}
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping && (
            <div className="bg-white border border-bone rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-bone flex items-center gap-2">
                <MapPin size={16} className="text-gold" strokeWidth={1.75} />
                <h2 className="font-semibold text-walnut text-sm">Delivery Address</h2>
              </div>
              <div className="px-6 py-4 text-sm text-stone space-y-1">
                {order.shipping.address && <p>{order.shipping.address}</p>}
                {order.shipping.city && <p>{order.shipping.city}</p>}
                {order.shipping.postcode && <p>{order.shipping.postcode}</p>}
                {order.shipping.country && <p>{order.shipping.country}</p>}
                {order.shipping.notes && (
                  <div className="mt-3 pt-3 border-t border-bone">
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone mb-1">Delivery Notes</p>
                    <p className="text-stone">{order.shipping.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right — Customer */}
        <div className="space-y-6">
          <div className="bg-white border border-bone rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-bone flex items-center gap-2">
              <User size={16} className="text-gold" strokeWidth={1.75} />
              <h2 className="font-semibold text-walnut text-sm">Customer</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <p className="font-medium text-walnut">{order.customer?.name}</p>
              {order.customer?.email && (
                <a href={`mailto:${order.customer.email}`}
                  className="flex items-center gap-2 text-sm text-stone hover:text-gold transition-colors">
                  <Mail size={14} /> {order.customer.email}
                </a>
              )}
              {order.customer?.phone && (
                <a href={`tel:${order.customer.phone}`}
                  className="flex items-center gap-2 text-sm text-stone hover:text-gold transition-colors">
                  <Phone size={14} /> {order.customer.phone}
                </a>
              )}
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-white border border-bone rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-bone">
              <h2 className="font-semibold text-walnut text-sm">Order Progress</h2>
            </div>
            <div className="px-6 py-4">
              {ORDER_STATUSES.filter(s => s !== 'Cancelled').map((s, i, arr) => {
                const currentIdx = arr.indexOf(order.status)
                const stepIdx = i
                const isDone = stepIdx <= currentIdx && order.status !== 'Cancelled'
                const isCurrent = s === order.status && order.status !== 'Cancelled'
                return (
                  <div key={s} className="flex items-start gap-3 mb-4 last:mb-0">
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-[10px] font-bold
                      ${isCurrent ? 'bg-gold text-white' : isDone ? 'bg-green-500 text-white' : 'bg-bone text-stone'}`}>
                      {isDone && !isCurrent ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-gold' : isDone ? 'text-walnut' : 'text-stone'}`}>{s}</p>
                    </div>
                  </div>
                )
              })}
              {order.status === 'Cancelled' && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</div>
                  Order Cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
