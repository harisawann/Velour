import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X } from 'lucide-react'
import { formatPrice } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title: '', category: '', price: '', comparePrice: '', desc: '',
  stock: '', status: 'active',
  variants: { sizes: '', colors: '' },
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product
    ? { ...product, variants: { sizes: product.variants?.sizes?.join(', ') || '', colors: product.variants?.colors?.join(', ') || '' } }
    : EMPTY_FORM
  )
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState(product?.images || [])
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories').then(r => {
      setCategories(r.data || [])
      if (!form.category && r.data.length > 0) {
        setForm(f => ({ ...f, category: r.data[0].slug }))
      }
    }).catch(() => {})
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setVar = (key, val) => setForm(f => ({ ...f, variants: { ...f.variants, [key]: val } }))

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('category', form.category)
      fd.append('price', form.price)
      fd.append('comparePrice', form.comparePrice || '')
      fd.append('desc', form.desc)
      fd.append('stock', form.stock)
      fd.append('status', form.status)
      fd.append('sizes', form.variants.sizes)
      fd.append('colors', form.variants.colors)
      images.forEach(img => fd.append('images', img))

      if (product?._id) {
        await api.put(`/admin/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated')
      } else {
        await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-sm w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bone">
          <h2 className="font-semibold text-walnut">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-stone hover:text-walnut transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Product Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="form-input" placeholder="Kensington Velvet Sofa" required />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="form-input" required>
                <option value="">Select category…</option>
                {categories.map(c => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="form-input">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="form-label">Price (£) *</label>
              <input type="number" min="0" step="1" value={form.price} onChange={e => set('price', e.target.value)} className="form-input" placeholder="1299" required />
            </div>
            <div>
              <label className="form-label">Compare Price (£)</label>
              <input type="number" min="0" step="1" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} className="form-input" placeholder="1599 (optional)" />
            </div>
            <div>
              <label className="form-label">Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} className="form-input" placeholder="10" />
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={4} className="form-input resize-none" placeholder="Describe the product in detail…" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Sizes (comma-separated)</label>
              <input value={form.variants.sizes} onChange={e => setVar('sizes', e.target.value)} className="form-input" placeholder="2-seater, 3-seater, Corner" />
            </div>
            <div>
              <label className="form-label">Colours (comma-separated)</label>
              <input value={form.variants.colors} onChange={e => setVar('colors', e.target.value)} className="form-input" placeholder="Velvet Grey, Ivory, Charcoal" />
            </div>
          </div>
          <div>
            <label className="form-label">Product Images</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-bone rounded-sm cursor-pointer hover:border-walnut transition-colors bg-ivory/50">
              <ImageIcon size={24} className="text-stone mb-2" strokeWidth={1.5} />
              <span className="text-xs text-stone">Click to upload images</span>
              <span className="text-[10px] text-stone-light mt-0.5">JPG, PNG, WebP · Max 10MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square rounded-sm overflow-hidden bg-ivory-dark">
                    <img src={src} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center py-2.5">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-60">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50, sort: 'newest' })
      if (search) params.set('q', search)
      if (cat) params.set('category', cat)
      const r = await api.get(`/admin/products?${params}`)
      setProducts(r.data.products || [])
      setTotal(r.data.total || 0)
    } catch {}
    setLoading(false)
  }, [search, cat])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/products/${id}`)
      setProducts(p => p.filter(pr => pr._id !== id))
      toast.success('Product deleted')
    } catch (err) {
      toast.error(err.message)
    }
    setDeleting(null)
  }

  const getCatName = (slug) => categories.find(c => c.slug === slug)?.name || slug

  return (
    <div className="p-6 lg:p-8">
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchProducts}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-normal text-walnut">Products</h1>
          <p className="text-stone text-sm mt-1">{total} product{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input type="text" placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)} className="form-input pl-9 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat('')}
            className={`px-4 py-2 text-xs font-medium border rounded-sm transition-colors ${cat === '' ? 'bg-walnut text-white border-walnut' : 'border-bone text-stone hover:border-walnut'}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setCat(c.slug)}
              className={`px-4 py-2 text-xs font-medium border rounded-sm transition-colors ${cat === c.slug ? 'bg-walnut text-white border-walnut' : 'border-bone text-stone hover:border-walnut'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-bone rounded-sm p-4">
              <div className="bg-bone aspect-[4/3] rounded mb-3" />
              <div className="h-3 bg-bone rounded w-2/3 mb-2" />
              <div className="h-4 bg-bone rounded w-full mb-2" />
              <div className="h-3 bg-bone rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl font-normal text-walnut mb-2">No products yet</p>
          <p className="text-stone text-sm mb-5">Add your first product to get started.</p>
          <button onClick={() => setModal('add')} className="btn-primary"><Plus size={16} /> Add Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product._id} className="bg-white border border-bone rounded-sm overflow-hidden group">
              <div className="aspect-[4/3] bg-ivory-dark overflow-hidden relative">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛋</div>
                )}
                <div className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {product.status}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-stone uppercase tracking-widest mb-1">{getCatName(product.category)}</p>
                <p className="font-medium text-walnut text-sm truncate mb-1">{product.title}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-walnut text-sm">{formatPrice(product.price)}</span>
                  <span className="text-xs text-stone">Stock: {product.stock ?? '—'}</span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-bone">
                  <button onClick={() => setModal(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-stone hover:text-walnut transition-colors py-1.5 border border-bone hover:border-walnut rounded-sm">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} disabled={deleting === product._id}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-stone hover:text-red-600 transition-colors py-1.5 border border-bone hover:border-red-200 rounded-sm disabled:opacity-50">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
