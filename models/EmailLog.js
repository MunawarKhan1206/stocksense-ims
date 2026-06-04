import mongoose from 'mongoose'

const EmailLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['restock_request', 'low_stock_alert', 'other']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: {
    type: String,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  supplierEmail: {
    type: String,
    required: true,
  },
  quantitySuggested: {
    type: Number,
  },
  status: {
    type: String,
    required: true,
    enum: ['sent', 'failed', 'pending', 'rejected']
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  error: {
    type: String,
    default: ''
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
})

// Optimizes date sorting on Email Logs audit page
EmailLogSchema.index({ organizationId: 1, sentAt: -1 })
// Optimizes logs searching by product
EmailLogSchema.index({ organizationId: 1, productId: 1 })

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema)
