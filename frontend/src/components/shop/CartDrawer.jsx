import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/helpers'

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total, count } = useCart()
  const navigate = useNavigate()

  const goCheckout = () => { onClose(); navigate('/checkout') }

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-bone flex-shrink-0">
          <h2 className="font-display text-xl font-normal">Your Cart ({count})</h2>
          <button onClick={onClose} className="p-1 text-stone hover:text-walnut transition-colors" aria-label="Close cart">
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <ShoppingBag size={48} className="text-bone" strokeWidth={1} />
              <div>
                <p className="font-display text-lg font-normal text-walnut mb-1">Your cart is empty</p>
                <p className="text-sm text-stone">Browse our collection to find your perfect piece.</p>
              </div>
              <button onClick={onClose} className="btn-primary mt-2">Browse Collection</button>
            </div>
          ) : (
            <ul className="divide-y divide-bone">
              {items.map(item => (
                <li key={item._key} className="flex gap-4 py-5">
                  {/* Image */}
                  <div className="w-20 h-20 bg-ivory-dark rounded-sm overflow-hidden flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">{item.category === 'sofa' ? '🛋' : '🛏'}</div>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-walnut truncate">{item.title}</p>
                    {item.size && <p className="text-xs text-stone mt-0.5">Size: {item.size}</p>}
                    {item.color && <p className="text-xs text-stone">Colour: {item.color}</p>}
                    <p className="text-sm font-semibold text-walnut mt-1">{formatPrice(item.price)}</p>
                    {/* Qty */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-bone rounded-sm">
                        <button onClick={() => item.qty === 1 ? removeItem(item._key) : updateQty(item._key, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone hover:text-walnut transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(item._key, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone hover:text-walnut transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item._key)} className="text-stone hover:text-red-600 transition-colors" aria-label="Remove">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {/* Subtotal */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-walnut">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-bone flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone">Subtotal</span>
              <span className="font-semibold text-walnut">{formatPrice(total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone">
              <span>Delivery</span>
              <span className="text-green-700 font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-walnut border-t border-bone pt-3">
              <span>Total</span>
              <span className="text-lg">{formatPrice(total)}</span>
            </div>
            <button onClick={goCheckout} className="btn-primary w-full text-center justify-center">
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-stone">Cash on delivery · Free UK delivery</p>
          </div>
        )}
      </div>
    </>
  )
}
