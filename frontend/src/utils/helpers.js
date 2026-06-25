export const formatPrice = (p) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(p)

export const formatDate = (d) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const clsx = (...classes) => classes.filter(Boolean).join(' ')

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled']

export const STATUS_COLORS = {
  Pending:    'bg-amber-100 text-amber-800',
  Confirmed:  'bg-blue-100 text-blue-800',
  Dispatched: 'bg-purple-100 text-purple-800',
  Delivered:  'bg-green-100 text-green-800',
  Cancelled:  'bg-red-100 text-red-800',
}
