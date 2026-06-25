import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Truck, Phone, MessageCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  const { orderNumber } = useParams()

  return (
    <div className="pt-nav min-h-screen bg-ivory flex items-center">
      <div className="container-site py-16 max-w-xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-600" strokeWidth={1} />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-normal text-walnut mb-3">
          Order Confirmed!
        </h1>
        <p className="text-stone mb-2 text-sm">
          Thank you for your order. Your reference number is:
        </p>
        <div className="inline-block bg-white border border-bone rounded-sm px-6 py-3 mb-6">
          <span className="font-mono font-bold text-walnut text-lg tracking-widest">{orderNumber}</span>
        </div>
        <p className="text-stone text-sm leading-relaxed mb-8 max-w-md mx-auto">
          We'll contact you within 24 hours to confirm your delivery date. Our team will be in touch on the phone number you provided. Payment is due on delivery — no advance payment needed.
        </p>

        {/* What happens next */}
        <div className="bg-white border border-bone rounded-sm p-6 text-left mb-8">
          <h2 className="font-semibold text-walnut mb-4 text-sm tracking-wider uppercase">What happens next</h2>
          <div className="space-y-4">
            {[
              [Phone,  '1. We call you', 'Our team calls to confirm your order and arrange a delivery date that suits you.'],
              [Truck,  '2. Free delivery', 'Your furniture is dispatched and delivered free to your UK address within 2–7 working days.'],
              [CheckCircle, '3. Pay on arrival', 'Inspect your order before paying. Cash payment only when you\'re happy with your purchase.'],
            ].map(([Icon, title, desc]) => (
              <div key={title} className="flex gap-3">
                <Icon size={18} className="text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold text-walnut">{title}</p>
                  <p className="text-xs text-stone mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary px-8">Continue Shopping</Link>
          <a href="https://wa.me/447349790597" target="_blank" rel="noopener noreferrer"
            className="btn-outline px-8 flex items-center justify-center gap-2">
            <MessageCircle size={16} />
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  )
}
