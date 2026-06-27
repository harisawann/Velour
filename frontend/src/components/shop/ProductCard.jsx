import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Eye } from 'lucide-react'
import { formatPrice } from '../../utils/helpers'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [imgErr, setImgErr] = useState(false)

  const handleQuickAdd = (e) => {
    e.preventDefault()
    addItem(product, 1)
    toast.success(`${product.title} added to cart`)
  }

const emoji = '🛋'
  const mainImg = !imgErr && product.images?.[0]

  return (
<Link to={`/product/${product._id}`} className="product-card group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-ivory-dark aspect-[4/3]">
        {mainImg ? (
          <img
            src={mainImg}
            alt={product.title}
            className="product-card-img w-full h-full object-cover"
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-ivory to-ivory-dark">
            {emoji}
          </div>
        )}
        {/* Badge */}
        {product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-gold text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm">
            Sale
          </span>
        )}
        {/* Hover actions */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-2 bg-walnut text-white text-xs font-semibold tracking-widest uppercase px-4 py-2.5 rounded-sm hover:bg-walnut-light transition-colors shadow-lg"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
<p className="eyebrow text-[10px] mb-1">{product.category}</p>
        <h3 className="font-display text-base font-normal text-walnut leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors">
          {product.title}
        </h3>
        {/* Stars */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-gold text-xs tracking-[3px]">{'★'.repeat(Math.round(product.avgRating))}{'☆'.repeat(5 - Math.round(product.avgRating))}</span>
            <span className="text-[10px] text-stone">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-walnut font-semibold">{formatPrice(product.price)}</span>
          {product.comparePrice > product.price && (
            <span className="text-stone-light text-sm line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-red-600 mt-1 font-medium">Out of stock</p>
        )}
      </div>
    </Link>
  )
}
