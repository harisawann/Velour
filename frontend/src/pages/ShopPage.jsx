import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/shop/ProductCard'
import api from '../utils/api'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'az', label: 'Name A–Z' },
]

export default function ShopPage({ category = 'all', title, subtitle }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') || ''
  const sort   = searchParams.get('sort') || 'newest'
  const page   = parseInt(searchParams.get('page') || '1')
  const LIMIT  = 12

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, page, limit: LIMIT })
      if (category !== 'all') params.set('category', category)
      if (search) params.set('q', search)
      const r = await api.get(`/products?${params}`)
      setProducts(r.data.products || [])
      setTotal(r.data.total || 0)
    } catch {}
    setLoading(false)
  }, [category, sort, search, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams)
    p.set(key, val)
    if (key !== 'page') p.set('page', '1')
    setSearchParams(p)
  }

  const clearSearch = () => {
    const p = new URLSearchParams(searchParams)
    p.delete('q')
    p.set('page', '1')
    setSearchParams(p)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Hero */}
      <div className="bg-ivory pt-[calc(64px+4rem)] pb-10 border-b border-bone">
        <div className="container-site">
          <span className="eyebrow block mb-3">Collection</span>
          <h1 className="font-display text-4xl md:text-5xl font-normal text-walnut mb-2">
            {title || 'The Full Collection'}
          </h1>
          {subtitle && <p className="text-stone text-sm max-w-md mt-2">{subtitle}</p>}
        </div>
      </div>

      <div className="section-pad-sm">
        <div className="container-site">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6 pb-6 border-b border-bone">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => set('q', e.target.value)}
                className="form-input pl-9 pr-8 py-2 text-sm"
              />
              {search && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-walnut">
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Sort + count */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone">{total} product{total !== 1 ? 's' : ''}</span>
              <select value={sort} onChange={e => set('sort', e.target.value)}
                className="form-input py-2 text-sm w-auto cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-bone aspect-[4/3] rounded-sm mb-3" />
                  <div className="h-3 bg-bone rounded w-1/3 mb-2" />
                  <div className="h-4 bg-bone rounded w-3/4 mb-2" />
                  <div className="h-4 bg-bone rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl font-normal text-walnut mb-2">No products found</p>
              <p className="text-stone text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => set('page', n)}
                  className={`w-9 h-9 rounded-sm text-sm font-medium transition-colors ${n === page ? 'bg-walnut text-white' : 'border border-bone text-stone hover:border-walnut hover:text-walnut'}`}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
