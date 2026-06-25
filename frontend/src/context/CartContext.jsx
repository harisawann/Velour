import React, { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'velour_cart'

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(
        i => i.productId === action.item.productId &&
             i.size === action.item.size &&
             i.color === action.item.color
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i === existing ? { ...i, qty: i.qty + action.item.qty } : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i._key !== action.key) }
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i._key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      }
    case 'CLEAR':
      return { items: [] }
    case 'LOAD':
      return { items: action.items }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) })
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product, qty = 1, size = null, color = null) => {
    const _key = `${product._id}-${size}-${color}-${Date.now()}`
    dispatch({
      type: 'ADD',
      item: {
        _key,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || null,
        category: product.category,
        size,
        color,
        qty,
      },
    })
  }

  const removeItem = (key) => dispatch({ type: 'REMOVE', key })
  const updateQty = (key, qty) => dispatch({ type: 'UPDATE_QTY', key, qty })
  const clearCart = () => dispatch({ type: 'CLEAR' })

  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = state.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
