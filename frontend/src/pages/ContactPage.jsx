import React, { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/contact', form)
      toast.success("Message sent! We'll be in touch within 24 hours.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
    }
    setSending(false)
  }

  return (
    <div className="pt-nav">
      {/* Hero */}
      <div className="bg-ivory border-b border-bone py-16">
        <div className="container-site text-center">
          <span className="eyebrow block mb-3">Get in Touch</span>
          <h1 className="font-display text-4xl md:text-5xl font-normal text-walnut">Contact Us</h1>
          <p className="text-stone text-sm mt-3 max-w-md mx-auto">Our team is here to help with any questions about your order or our furniture.</p>
        </div>
      </div>

      <div className="section-pad">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-normal text-walnut mb-5">How to reach us</h2>
                {[
                  [MessageCircle, 'WhatsApp', '+44 7349 790597', 'https://wa.me/447349790597', true],
                  [Phone, 'Phone', '+44 7349 790597', 'tel:+447349790597', false],
                  [Mail, 'Email', 'velour.uk.co@gmail.com', 'velour.uk.co@gmail.com', false],
                ].map(([Icon, label, value, href, highlight]) => (
                  <div key={label} className="flex items-start gap-4 pb-5 border-b border-bone last:border-b-0">
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-[#25D366]' : 'bg-ivory-dark'}`}>
                      <Icon size={18} className={highlight ? 'text-white' : 'text-gold'} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-0.5">{label}</p>
                      <a href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                        className="text-walnut text-sm font-medium hover:text-gold transition-colors">
                        {value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-ivory-dark border border-bone rounded-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-gold" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-walnut uppercase tracking-widest">Business Hours</p>
                </div>
                <div className="space-y-1.5 text-xs text-stone">
                  <div className="flex justify-between"><span>Monday – Friday</span><span className="font-medium text-walnut">9:00 – 18:00</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span className="font-medium text-walnut">10:00 – 16:00</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span className="text-stone-light">Closed</span></div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-bone rounded-sm p-8">
                <h2 className="font-display text-xl font-normal text-walnut mb-6">Send a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Your Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="John Smith" required />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Subject</label>
                    <select className="form-input" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} required>
                      <option value="">Select a subject…</option>
                      <option>Product enquiry</option>
                      <option>Order status</option>
                      <option>Delivery question</option>
                      <option>Return / Exchange</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Message</label>
                    <textarea className="form-input resize-none" rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="How can we help you?" required />
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : 'Send Message'}
                  </button>
                  <p className="text-center text-xs text-stone">Or contact us directly on <a href="https://wa.me/447349790597" target="_blank" rel="noopener noreferrer" className="text-gold font-medium hover:underline">WhatsApp</a> for a faster response.</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
