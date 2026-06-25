require('dotenv').config()
const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')
const jwt        = require('jsonwebtoken')

const Product  = require('./lib/models/Product')
const Order    = require('./lib/models/Order')
const Admin    = require('./lib/models/Admin')
const auth     = require('./lib/auth')
const { upload, cloudinary, uploadToCloudinary } = require('./lib/cloudinary')

const app = express()

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api', limiter)

// ── DB Connection ───────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    seedAdmin()
  })
  .catch(err => console.error('❌ MongoDB error:', err))

async function seedAdmin() {
  const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL })
  if (!exists) {
    await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
    console.log('✅ Admin seeded:', process.env.ADMIN_EMAIL)
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════

// ── Products ────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { category, q, sort = 'newest', page = 1, limit = 12 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filter = { status: 'active' }
    if (category) filter.category = category
    if (q) filter.$text = { $search: q }

    const sortMap = {
      newest:     { createdAt: -1 },
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      az:          { title: 1 },
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(filter),
    ])

    res.json({ products, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Orders ──────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, shipping, items, total, paymentMethod } = req.body
    if (!customer?.name || !customer?.email || !customer?.phone)
      return res.status(400).json({ message: 'Customer details required' })
    if (!items?.length)
      return res.status(400).json({ message: 'No items in order' })

    const order = await Order.create({ customer, shipping, items, total, paymentMethod })
    res.status(201).json({ orderNumber: order.orderNumber, orderId: order._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Track order ─────────────────────────────────────────────
app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber status createdAt shipping.city items total')
      .lean()
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES (protected)
// ═══════════════════════════════════════════════════════════

// ── Auth ────────────────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email: email?.toLowerCase() })
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, admin: { email: admin.email, id: admin._id } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/admin/me', auth, (req, res) => {
  res.json({ email: req.admin.email, id: req.admin._id })
})

// ── Stats ───────────────────────────────────────────────────
app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const [totalOrders, pendingOrders, totalProducts, revenueResult] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Product.countDocuments({ status: 'active' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
    ])

    // Unique customers by email
    const customerEmails = await Order.distinct('customer.email')
    const totalCustomers = customerEmails.length

    res.json({
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: revenueResult[0]?.total || 0,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin Orders ────────────────────────────────────────────
app.get('/api/admin/orders', auth, async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const filter = {}
    if (status) filter.status = status
    if (q) {
      filter.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'customer.name': { $regex: q, $options: 'i' } },
        { 'customer.email': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } },
      ]
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Order.countDocuments(filter),
    ])
    res.json({ orders, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/admin/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean()
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/admin/orders/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const valid = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled']
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' })
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin Products ──────────────────────────────────────────
app.get('/api/admin/products', auth, async (req, res) => {
  try {
    const { category, q, page = 1, limit = 50, sort = 'newest' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const filter = {}
    if (category) filter.category = category
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { desc:  { $regex: q, $options: 'i' } },
    ]
    const sortMap = { newest: { createdAt: -1 }, 'price-asc': { price: 1 }, az: { title: 1 } }
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(filter),
    ])
    res.json({ products, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/admin/products', auth, upload.array('images', 6), async (req, res) => {
  try {
    const { title, category, price, comparePrice, desc, stock, status, sizes, colors } = req.body
    const images = []
    for (const file of req.files || []) {
      const url = await uploadToCloudinary(file.buffer, file.mimetype)
      images.push(url)
    }
    const product = await Product.create({
      title, category, desc, status: status || 'active',
      price: Number(price),
      comparePrice: Number(comparePrice) || 0,
      stock: Number(stock) || 0,
      images,
      variants: {
        sizes:  sizes  ? sizes.split(',').map(s => s.trim()).filter(Boolean)  : [],
        colors: colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      },
    })
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.put('/api/admin/products/:id', auth, upload.array('images', 6), async (req, res) => {
  try {
    const { title, category, price, comparePrice, desc, stock, status, sizes, colors } = req.body
    const update = {
      title, category, desc, status,
      price: Number(price),
      comparePrice: Number(comparePrice) || 0,
      stock: Number(stock) || 0,
      'variants.sizes':  sizes  ? sizes.split(',').map(s => s.trim()).filter(Boolean)  : [],
      'variants.colors': colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [],
    }
    if (req.files?.length) {
      const urls = []
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, file.mimetype)
        urls.push(url)
      }
      update.images = urls
    }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.delete('/api/admin/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    // Delete images from Cloudinary
    for (const url of product.images || []) {
      const publicId = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
      await cloudinary.uploader.destroy(publicId).catch(() => {})
    }
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin Customers ─────────────────────────────────────────
app.get('/api/admin/customers', auth, async (req, res) => {
  try {
    const { q, limit = 50 } = req.query
    const matchStage = q
      ? { $match: { $or: [
          { 'customer.name':  { $regex: q, $options: 'i' } },
          { 'customer.email': { $regex: q, $options: 'i' } },
        ]}}
      : { $match: {} }

    const customers = await Order.aggregate([
      matchStage,
      { $sort: { createdAt: -1 } },
      { $group: {
          _id:         '$customer.email',
          name:        { $first: '$customer.name' },
          email:       { $first: '$customer.email' },
          phone:       { $first: '$customer.phone' },
          orderCount:  { $sum: 1 },
          totalSpent:  { $sum: '$total' },
          firstOrder:  { $min: '$createdAt' },
          lastOrder:   { $max: '$createdAt' },
      }},
      { $project: { _id: 1, name: 1, email: 1, phone: 1, orderCount: 1, totalSpent: 1, firstOrder: 1, lastOrder: 1 } },
      { $limit: parseInt(limit) },
    ])

    res.json({ customers, total: customers.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Health ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV }))

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Velour API running on port ${PORT}`))
