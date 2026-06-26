const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true })

messageSchema.index({ createdAt: -1 })
messageSchema.index({ read: 1 })

module.exports = mongoose.model('Message', messageSchema)
