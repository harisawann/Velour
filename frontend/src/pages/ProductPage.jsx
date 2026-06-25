import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Truck, Shield, Phone, Star, ChevronLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice, formatDate } from '../utils/helpers'
import ProductCard from '../components/shop/ProductCard'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [mainImg, setMainImg] = useState(0)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data)
        setSize(r.data.variants?.sizes?.[0] || null)
        setColor(r.data.variants?.colors?.[0] || null)
        setMainImg(0)
        // Fetch related
        return api.get(`/products?category=${r.data.category}&limit=4`)
      })
      .then(r => setRelated((r.data.products || []).filter(p => p._id !== id).slice(0, 4)))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-bone border-t-gold rounded-full animate-spin" />
    </div>
  )
  if (!product) return null

  const handleAddToCart = () => {
    addItem(product, qty, size, color)
    toast.success('Added to cart')
  }

  const handleBuyNow = () => {
    addItem(product, qty, size, color)
    navigate('/checkout')
  }

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.stars, 0) / product.reviews.length
    : 0

  return (
    <div className="pt-nav">
      <div className="container-site py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone mb-8">
          <Link to="/" className="hover:text-walnut transition-colors">Home</Link>
          <span>›</span>
          <Link to={`/${product.category === 'sofa' ? 'sofas' : 'beds'}`} className="hover:text-walnut transition-colors">
            {product.category === 'sofa' ? 'Sofas' : 'Beds'}
          </Link>
          <span>›</span>
          <span className="text-walnut">{product.title}</span>
        </nav>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Gallery */}
          <div>
            <div className="bg-ivory-dark aspect-[4/3] rounded-sm overflow-hidden mb-3">
              {product.images?.[mainImg] ? (
                <img src={product.images[mainImg]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {product.category === 'sofa' ? '🛋' : '🛏'}
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    className={`aspect-square rounded-sm overflow-hidden border-2 transition-colors ${i === mainImg ? 'border-walnut' : 'border-transparent'}`}>
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="eyebrow block mb-2">{product.category === 'sofa' ? 'Sofas' : 'Beds'}</span>
            <h1 className="font-display text-3xl md:text-4xl font-normal text-walnut leading-tight mb-3">
              {product.title}
            </h1>
            {/* Rating */}
            {product.reviews?.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gold tracking-[3px] text-sm">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                <span className="text-xs text-stone">({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-semibold text-walnut">{formatPrice(product.price)}</span>
              {product.comparePrice > product.price && (
                <span className="text-stone line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
            <p className="text-stone text-sm leading-relaxed mb-6">{product.desc}</p>

            {/* Variants */}
            {product.variants?.sizes?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone mb-2">
                  Size: <span className="text-walnut">{size}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      className={`px-4 py-2 text-xs font-medium border rounded-sm transition-colors ${size === s ? 'bg-walnut text-white border-walnut' : 'border-bone text-stone hover:border-walnut hover:text-walnut'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.variants?.colors?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone mb-2">
                  Colour: <span className="text-walnut">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.colors.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`px-4 py-2 text-xs font-medium border rounded-sm transition-colors ${color === c ? 'bg-walnut text-white border-walnut' : 'border-bone text-stone hover:border-walnut hover:text-walnut'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border border-bone rounded-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-stone hover:text-walnut text-lg">−</button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="w-10 h-11 flex items-center justify-center text-stone hover:text-walnut text-lg">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingBag size={16} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              className="btn-outline w-full justify-center py-3 mb-5 disabled:opacity-50">
              Buy Now — Pay on Delivery
            </button>

            {/* Trust */}
            <div className="border border-bone rounded-sm p-4 space-y-2.5">
              {[
                [Truck, 'Free UK delivery · 2–7 working days'],
                [Phone, 'Cash on delivery — no advance payment'],
                [Shield, '5-year structural guarantee'],
              ].map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-3 text-xs text-stone">
                  <Icon size={15} className="text-gold flex-shrink-0" strokeWidth={1.5} />
                  <span>{text}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 text-xs">
                <Phone size={15} className="text-gold flex-shrink-0" strokeWidth={1.5} />
                <a href="https://wa.me/447349790597" target="_blank" rel="noopener noreferrer"
                  className="text-gold font-semibold hover:underline">WhatsApp: +44 7349 790597</a>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div className="border-t border-bone pt-12 mb-16">
            <h2 className="font-display text-2xl font-normal text-walnut mb-8">Customer Reviews</h2>
            <div className="space-y-6 max-w-2xl">
              {product.reviews.map((r, i) => (
                <div key={i} className="pb-6 border-b border-bone last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-walnut">{r.author}</p>
                      <p className="text-xs text-stone-light">{r.loc} · {r.date}</p>
                    </div>
                    <span className="text-gold text-xs tracking-[3px]">{'★'.repeat(r.stars)}</span>
                  </div>
                  <p className="text-sm text-stone leading-relaxed">{r.text}</p>
                  {r.verified && <span className="text-[10px] text-green-600 font-medium mt-1 block">✓ Verified purchase</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-bone pt-12">
            <h2 className="font-display text-2xl font-normal text-walnut mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
