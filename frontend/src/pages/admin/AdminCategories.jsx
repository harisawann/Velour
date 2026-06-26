import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchCats = async () => {
    setLoading(true)
    try {
      const r = await api.get('/categories')
      setCategories(r.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchCats() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    try {
      const r = await api.post('/admin/categories', { name })
      setCategories(c => [...c, r.data])
      setName('')
      toast.success(`"${r.data.name}" category added`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category')
    }
    setAdding(false)
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? Products in this category won't be deleted but will have no category.`)) return
    try {
      await api.delete(`/admin/categories/${cat._id}`)
      setCategories(c => c.filter(x => x._id !== cat._id))
      toast.success(`"${cat.name}" deleted`)
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-normal text-walnut">Categories</h1>
        <p className="text-stone text-sm mt-1">Manage product categories. These appear in the shop filters and product form.</p>
      </div>

      {/* Add form */}
      <div className="bg-white border border-bone rounded-sm p-6 mb-6">
        <h2 className="font-semibold text-walnut text-sm mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Dining Chair, Coffee Table…"
            className="form-input flex-1"
            required
          />
          <button type="submit" disabled={adding} className="btn-primary whitespace-nowrap disabled:opacity-60">
            {adding ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Plus size={16} /> Add</>
            )}
          </button>
        </form>
      </div>

      {/* Category list */}
      <div className="bg-white border border-bone rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-bone flex items-center gap-2">
          <Tag size={15} className="text-gold" strokeWidth={1.75} />
          <h2 className="font-semibold text-walnut text-sm">All Categories ({categories.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-bone border-t-gold rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-stone text-sm">No categories yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-bone">
            {categories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-ivory-dark rounded-sm flex items-center justify-center">
                    <Tag size={14} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-walnut text-sm">{cat.name}</p>
                    <p className="text-xs text-stone">slug: {cat.slug}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(cat)}
                  className="text-stone hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-stone mt-4">
        💡 The slug is auto-generated from the name and used in URLs and filters.
      </p>
    </div>
  )
}
