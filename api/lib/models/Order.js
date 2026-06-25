const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title:     { type: String, required: true },
  price:     { type: Number, required: true },
  qty:       { type: Number, required: true, min: 1 },
  size:      { type: String, default: null },
  color:     { type: String, default: null },
  image:     { type: String, default: null },
})

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    name:  { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  shipping: {
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    postcode: { type: String, required: true },
    region:   { type: String, required: true },
    notes:    { type: String, default: '' },
  },
  items:         [orderItemSchema],
  total:         { type: Number, required: true },
  paymentMethod: { type: String, default: 'cod' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true })

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `VLR-${String(count + 1).padStart(5, '0')}`
  }
  next()
})

orderSchema.index({ 'customer.email': 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Order', orderSchema)
