import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, Search, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../shop/CartDrawer'

const NAV_LINKS = [
  { to: '/',        label: 'Home' },
  { to: '/sofas',   label: 'Sofas' },
  { to: '/beds',    label: 'Beds' },
  { to: '/shop',    label: 'Shop All' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { count } = useCart()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobOpen, setMobOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mob menu on route change
  useEffect(() => { setMobOpen(false) }, [location.pathname])

  const inverted = isHome && !scrolled
  const navBg = scrolled ? 'bg-ivory/97 backdrop-blur-md shadow-[0_1px_0_#E8E1D6]' : 'bg-transparent'
  const textCol = inverted ? 'text-white/80 hover:text-white' : 'text-stone hover:text-walnut'
  const logoCol = inverted ? 'text-white' : 'text-walnut'
  const iconCol = inverted ? 'text-white/80 hover:text-white' : 'text-stone hover:text-walnut'
  const hamCol  = inverted ? 'text-white' : 'text-walnut'

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 h-nav z-50 transition-all duration-300 ${navBg} ${mobOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Main navigation"
      >
        <div className="container-site h-full flex items-center justify-between gap-6">
          {/* Hamburger (mobile only) */}
          <button
            className={`md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-2 transition-colors ${hamCol}`}
            onClick={() => setMobOpen(true)}
            aria-label="Open menu"
          >
            <span className="block h-[1.5px] bg-current transition-all" />
            <span className="block h-[1.5px] bg-current transition-all" />
            <span className="block h-[1.5px] bg-current transition-all" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className={`font-display text-2xl font-normal tracking-widest transition-opacity hover:opacity-70 ${logoCol} md:flex-none flex-1 text-center md:text-left`}
          >
            Velour
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`relative text-xs font-medium tracking-widest uppercase pb-1 transition-colors group ${active ? (inverted ? 'text-white' : 'text-walnut') : textCol}`}
                  >
                    {label}
                    <span className={`absolute bottom-0 left-0 h-[1.5px] bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className={`hidden md:flex relative p-2 transition-colors ${iconCol}`}
              onClick={() => setCartOpen(true)}
              aria-label={`Cart (${count} items)`}
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gold text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
            {/* Mobile cart icon */}
            <button
              className={`md:hidden relative p-2 transition-colors ${hamCol}`}
              onClick={() => setCartOpen(true)}
              aria-label={`Cart (${count} items)`}
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gold text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Sidebar ── */}
      <div
        className={`fixed inset-0 z-50 bg-ivory flex flex-col transition-transform duration-300 ease-out ${mobOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Mobile navigation"
      >
        {/* Sidebar Header */}
        <div className="h-nav grid items-center border-b border-bone flex-shrink-0"
          style={{ gridTemplateColumns: '40px 1fr 40px', paddingInline: 'clamp(1rem, 4vw, 2.5rem)' }}
        >
          <button
            onClick={() => setMobOpen(false)}
            className="flex items-center justify-start text-walnut hover:text-gold transition-colors"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.75} />
          </button>
          <span className="font-display text-[1.375rem] font-normal tracking-widest text-walnut text-center">
            Velour
          </span>
          <button
            className="relative flex items-center justify-end text-walnut hover:text-gold transition-colors"
            onClick={() => { setMobOpen(false); setCartOpen(true) }}
            aria-label={`Cart (${count} items)`}
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto px-[clamp(1rem,4vw,2.5rem)] pt-8">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobOpen(false)}
              className="block font-display text-[clamp(1.5rem,5vw,2.25rem)] font-normal text-walnut py-4 border-b border-bone last:border-b-0 hover:text-gold transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-bone flex-shrink-0">
          <a
            href="https://wa.me/447349790597"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-sm font-semibold rounded-sm hover:bg-[#1da851] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Mob overlay */}
      {mobOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobOpen(false)} />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
