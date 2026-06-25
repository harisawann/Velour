import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Truck, Phone, Shield, ChevronRight } from 'lucide-react'

const UK_REGIONS = [
  'England - London','England - South East','England - South West','England - East',
  'England - West Midlands','England - East Midlands','England - North West',
  'England - North East','England - Yorkshire','Wales','Scotland','Northern Ireland',
]

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  if (items.length === 0) {
    navigate('/')
    return null
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
        shipping: {
          address: data.address,
          city: data.city,
          postcode: data.postcode.toUpperCase(),
          region: data.region,
          notes: data.notes,
        },
        items: items.map(i => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          qty: i.qty,
          size: i.size,
          color: i.color,
          image: i.image,
        })),
        total,
        paymentMethod: 'cod',
      }
      const res = await api.post('/orders', payload)
      clearCart()
      navigate(`/order-success/${res.data.orderNumber}`)
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="pt-nav bg-ivory min-h-screen">
      <div className="container-site py-12">
        <h1 className="font-display text-3xl font-normal text-walnut mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <div className="bg-white border border-bone rounded-sm p-6">
              <h2 className="font-display text-lg font-normal text-walnut mb-5">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input {...register('name', { required: 'Full name is required' })} className="form-input" placeholder="John Smith" />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} className="form-input" placeholder="john@example.com" type="email" />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input {...register('phone', { required: 'Phone number is required', pattern: { value: /^[\d\s+\-()]{10,}$/, message: 'Invalid phone number' } })} className="form-input" placeholder="07700 900000" type="tel" />
                    {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white border border-bone rounded-sm p-6">
              <h2 className="font-display text-lg font-normal text-walnut mb-5">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Street Address *</label>
                  <input {...register('address', { required: 'Address is required' })} className="form-input" placeholder="123 High Street, Flat 2" />
                  {errors.address && <p className="form-error">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">City / Town *</label>
                    <input {...register('city', { required: 'City is required' })} className="form-input" placeholder="London" />
                    {errors.city && <p className="form-error">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Postcode *</label>
                    <input {...register('postcode', { required: 'Postcode is required', pattern: { value: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, message: 'Invalid UK postcode' } })} className="form-input" placeholder="SW1A 1AA" />
                    {errors.postcode && <p className="form-error">{errors.postcode.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="form-label">Region *</label>
                  <select {...register('region', { required: 'Region is required' })} className="form-input">
                    <option value="">Select region…</option>
                    {UK_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.region && <p className="form-error">{errors.region.message}</p>}
                </div>
                <div>
                  <label className="form-label">Delivery Notes (optional)</label>
                  <textarea {...register('notes')} rows={3} className="form-input resize-none" placeholder="e.g. Leave with neighbour, ring bell twice…" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-bone rounded-sm p-6">
              <h2 className="font-display text-lg font-normal text-walnut mb-2">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 border border-gold/30 bg-gold-pale rounded-sm mt-4">
                <div className="w-5 h-5 rounded-full border-2 border-gold bg-gold flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-walnut">Cash on Delivery</p>
                  <p className="text-xs text-stone mt-0.5">Pay in cash when your order arrives. No advance payment required.</p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-60">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order…
                </span>
              ) : (
                <>Place Order — Pay on Delivery <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-bone rounded-sm p-6 sticky top-20">
              <h2 className="font-display text-lg font-normal text-walnut mb-5">Order Summary</h2>
              <ul className="space-y-4 mb-5">
                {items.map(item => (
                  <li key={item._key} className="flex gap-3">
                    <div className="w-14 h-14 bg-ivory-dark rounded-sm overflow-hidden flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">{item.category === 'sofa' ? '🛋' : '🛏'}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-walnut truncate">{item.title}</p>
                      {item.size && <p className="text-xs text-stone">{item.size}</p>}
                      <p className="text-xs text-stone">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-walnut flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-bone pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Delivery</span>
                  <span className="text-green-700 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Payment</span>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <div className="flex justify-between font-semibold text-walnut text-base border-t border-bone pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              {/* Trust */}
              <div className="mt-5 space-y-2">
                {[[Truck,'Free UK delivery'],[Phone,'Cash on delivery'],[Shield,'5-year guarantee']].map(([Icon,text]) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-stone">
                    <Icon size={13} className="text-gold flex-shrink-0" strokeWidth={1.5} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
