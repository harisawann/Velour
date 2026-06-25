import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Phone, Star } from 'lucide-react'
import ProductCard from '../components/shop/ProductCard'
import api from '../utils/api'

const HERO_SLIDES = [
  {
    title: 'Sofas crafted\nfor British living',
    sub: 'Handcrafted luxury sofas delivered free across the UK',
    cta: { label: 'Browse Sofas', to: '/sofas' },
    bg: 'from-walnut via-walnut-mid to-[#3A2E22]',
    emoji: '🛋',
  },
  {
    title: 'Beds built\nfor deep rest',
    sub: 'Premium bed frames and upholstered headboards for your sanctuary',
    cta: { label: 'Browse Beds', to: '/beds' },
    bg: 'from-[#0F1814] via-[#1A2A20] to-walnut',
    emoji: '🛏',
  },
]

const TRUST = [
  { icon: Truck, label: 'Free UK Delivery', sub: '2–7 working days' },
  { icon: Phone, label: 'Cash on Delivery', sub: 'No advance payment' },
  { icon: Shield, label: '5-Year Guarantee', sub: 'Structural warranty' },
  { icon: Star, label: 'UK Handcrafted', sub: 'Premium materials' },
]

const TESTIMONIALS = [
  { quote: 'The Kensington sofa arrived in perfect condition and immediately became the centrepiece of our living room. Extraordinary quality.', author: 'Sarah M.', loc: 'London' },
  { quote: 'Cash on delivery made the whole process completely stress-free. The bed frame is solid, upholstery flawless.', author: 'Robert K.', loc: 'Surrey' },
  { quote: "I've bought from several premium furniture brands. Velour is in a different league entirely.", author: 'Emma T.', loc: 'Bath' },
]

export default function HomePage() {
  const [slide, setSlide] = useState(0)
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    api.get('/products?limit=8&sort=newest')
      .then(r => setFeatured(r.data.products || []))
      .catch(() => {})
  }, [])

  const s = HERO_SLIDES[slide]

  return (
    <div>
      {/* ── Hero ── */}
      <section className={`relative min-h-screen flex items-center justify-center bg-gradient-to-br ${s.bg} transition-all duration-1000 overflow-hidden`}>
        <div className="absolute inset-0 opacity-5 text-[20rem] flex items-center justify-center select-none pointer-events-none">
          {s.emoji}
        </div>
        <div className="container-site relative z-10 text-center pt-20 pb-24">
          <p className="eyebrow text-gold-light mb-6">British Luxury Furniture</p>
          <h1 className="font-display text-white font-normal mb-6 leading-[1.08]"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', whiteSpace: 'pre-line' }}>
            {s.title}
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">{s.sub}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to={s.cta.to} className="btn-gold px-8 py-4 text-sm">{s.cta.label}</Link>
            <Link to="/shop" className="inline-flex items-center gap-2 text-white/80 text-sm font-medium hover:text-white transition-colors uppercase tracking-widest">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${i === slide ? 'w-6 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-white/30'}`} />
          ))}
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="bg-ivory-dark border-y border-bone">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-bone">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5">
                <Icon size={22} className="text-gold flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold text-walnut tracking-wide">{label}</p>
                  <p className="text-xs text-stone">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Split ── */}
      <section className="section-pad">
        <div className="container-site">
          <div className="text-center mb-12">
            <span className="eyebrow block mb-3">Collections</span>
            <h2 className="font-display text-3xl md:text-4xl font-normal text-walnut">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { to: '/sofas', label: 'Sofas', sub: 'Handcrafted luxury sofas for every living room', emoji: '🛋', bg: 'from-walnut to-walnut-light' },
              { to: '/beds', label: 'Beds', sub: 'Premium beds for the perfect night\'s rest', emoji: '🛏', bg: 'from-[#0F1814] to-walnut-mid' },
            ].map(({ to, label, sub, emoji, bg }) => (
              <Link key={to} to={to}
                className={`relative group bg-gradient-to-br ${bg} rounded-sm overflow-hidden min-h-[320px] flex flex-col justify-end p-10 hover:shadow-xl transition-shadow`}>
                <div className="absolute inset-0 opacity-10 flex items-center justify-end pr-8 text-[10rem] select-none pointer-events-none">
                  {emoji}
                </div>
                <div className="relative z-10">
                  <h3 className="font-display text-3xl font-normal text-white mb-2">{label}</h3>
                  <p className="text-white/70 text-sm mb-5 max-w-xs">{sub}</p>
                  <span className="inline-flex items-center gap-2 text-white text-xs font-semibold tracking-widest uppercase border border-white/30 px-4 py-2 rounded-sm group-hover:bg-white group-hover:text-walnut transition-all">
                    Browse {label} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="section-pad bg-ivory">
          <div className="container-site">
            <div className="text-center mb-12">
              <span className="eyebrow block mb-3">New Arrivals</span>
              <h2 className="font-display text-3xl md:text-4xl font-normal text-walnut mb-3">The Latest Pieces</h2>
              <p className="text-stone max-w-md mx-auto text-sm leading-relaxed">Each piece is handcrafted to order and delivered directly to your door.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="text-center mt-10">
              <Link to="/shop" className="btn-outline px-10">View Full Collection</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="bg-walnut section-pad">
        <div className="container-site">
          <div className="text-center mb-12">
            <span className="eyebrow text-gold-light block mb-3">Customer Reviews</span>
            <h2 className="font-display text-3xl md:text-4xl font-normal text-white">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {TESTIMONIALS.map(({ quote, author, loc }) => (
              <div key={author} className="bg-walnut p-8 md:p-10">
                <div className="text-gold text-sm tracking-[4px] mb-5">★★★★★</div>
                <p className="text-white/85 text-sm leading-relaxed mb-6 font-ui">"{quote}"</p>
                <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">{author} — {loc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="section-pad bg-ivory-dark">
        <div className="container-site">
          <div className="max-w-xl mx-auto text-center">
            <span className="eyebrow block mb-3">Stay Updated</span>
            <h2 className="font-display text-2xl md:text-3xl font-normal text-walnut mb-2">New arrivals & exclusive offers</h2>
            <p className="text-stone text-sm mb-6">Join our mailing list for first access to new collections.</p>
            <form className="flex gap-0 max-w-sm mx-auto" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-bone border-r-0 bg-white text-sm outline-none focus:border-walnut rounded-l-sm" />
              <button type="submit" className="px-5 py-3 bg-walnut text-white text-xs font-bold tracking-widest uppercase hover:bg-walnut-light transition-colors rounded-r-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
