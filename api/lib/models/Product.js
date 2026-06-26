const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  author:   { type: String, required: true },
  loc:      { type: String, default: '' },
  stars:    { type: Number, required: true, min: 1, max: 5 },
  text:     { type: String, required: true },
  date:     { type: String },
  verified: { type: Boolean, default: false },
})

const productSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
category:     { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  desc:         { type: String, default: '' },
  images:       [{ type: String }],
  stock:        { type: Number, default: 0, min: 0 },
  status:       { type: String, enum: ['active', 'draft'], default: 'active' },
  variants: {
    sizes:  [{ type: String }],
    colors: [{ type: String }],
  },
  reviews:      [reviewSchema],
  avgRating:    { type: Number, default: 0 },
  reviewCount:  { type: Number, default: 0 },
}, { timestamps: true })

productSchema.index({ title: 'text', desc: 'text' })
productSchema.index({ category: 1, status: 1 })

module.exports = mongoose.model('Product', productSchema)
