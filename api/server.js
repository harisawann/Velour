require('dotenv').config()
const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')
const jwt        = require('jsonwebtoken')

const Product  = require('./lib/models/Product')
const Order    = require('./lib/models/Order')
const Admin    = require("./lib/models/Admin")
const Message  = require("./lib/models/Message")
const auth     = require('./lib/auth')
const { upload, cloudinary } = require('./lib/cloudinary')

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
    const images = req.files?.map(f => f.path) || []
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
      update.images = req.files.map(f => f.path)
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

// ── Contact Messages (Public) ───────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: 'All fields are required' })
    await Message.create({ name, email, subject, message })
    res.status(201).json({ message: 'Message sent successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin Messages ──────────────────────────────────────────
app.get('/api/admin/messages', auth, async (req, res) => {
  try {
    const { read, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const filter = {}
    if (read === 'true') filter.read = true
    if (read === 'false') filter.read = false
    const [messages, total, unread] = await Promise.all([
      Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Message.countDocuments(filter),
      Message.countDocuments({ read: false }),
    ])
    res.json({ messages, total, unread })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/admin/messages/:id/read', auth, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    if (!msg) return res.status(404).json({ message: 'Message not found' })
    res.json(msg)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.delete('/api/admin/messages/:id', auth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Categories (Public) ─────────────────────────────────────
const Category = require('./lib/models/Category')

async function seedCategories() {
  const count = await Category.countDocuments()
  if (count === 0) {
    await Category.insertMany([
      { name: 'Sofa', slug: 'sofa', order: 1 },
      { name: 'Bed',  slug: 'bed',  order: 2 },
    ])
    console.log('✅ Default categories seeded')
  }
}
mongoose.connection.once('open', seedCategories)

app.get('/api/categories', async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1, name: 1 }).lean()
    res.json(cats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin Categories ────────────────────────────────────────
app.post('/api/admin/categories', auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' })
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const count = await Category.countDocuments()
    const cat = await Category.create({ name: name.trim(), slug, order: count + 1 })
    res.status(201).json(cat)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Category already exists' })
    res.status(500).json({ message: err.message })
  }
})

app.delete('/api/admin/categories/:id', auth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Email Reply ─────────────────────────────────────────────
app.post('/api/admin/messages/:id/reply', auth, async (req, res) => {
  try {
    const { replyText } = req.body
    if (!replyText?.trim()) return res.status(400).json({ message: 'Reply text is required' })

    const msg = await Message.findById(req.params.id)
    if (!msg) return res.status(404).json({ message: 'Message not found' })

    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Velour Furniture" <${process.env.GMAIL_USER}>`,
      to: msg.email,
      subject: `Re: ${msg.subject}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1C1814;">
          <div style="border-bottom: 2px solid #C9A96E; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 400; letter-spacing: 4px; margin: 0; color: #1C1814;">VELOUR</h1>
            <p style="font-size: 11px; color: #8B7355; letter-spacing: 2px; text-transform: uppercase; margin: 4px 0 0;">Premium Furniture</p>
          </div>
          <p style="color: #6B5B4E; font-size: 14px; margin-bottom: 8px;">Hi ${msg.name},</p>
          <div style="font-size: 15px; line-height: 1.8; color: #1C1814; margin-bottom: 32px; white-space: pre-wrap;">${replyText}</div>
          <div style="border-top: 1px solid #E8E1D6; padding-top: 16px; margin-top: 32px;">
            <p style="font-size: 12px; color: #8B7355; margin: 0;">Warm regards,</p>
            <p style="font-size: 13px; font-weight: 600; color: #1C1814; margin: 4px 0;">The Velour Team</p>
            <p style="font-size: 11px; color: #A09890; margin: 4px 0;">velour.uk.co@gmail.com</p>
          </div>
          <div style="background: #F9F6F1; border-top: 1px solid #E8E1D6; margin-top: 32px; padding: 16px; font-size: 11px; color: #A09890;">
            <p style="margin: 0;">Original message: "${msg.message}"</p>
          </div>
        </div>
      `,
    })

    await Message.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ message: 'Reply sent successfully' })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ message: 'Failed to send reply: ' + err.message })
  }
})
