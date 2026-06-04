import mongoose from 'mongoose'

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true, // Snapshot to preserve name history if product is updated/deleted
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative'],
  },
  subtotal: {
    type: Number,
    required: true,
  },
})

const SaleSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    trim: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [SaleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  profit: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Cash', 'Card', 'Bank Transfer'],
      message: '{VALUE} is not a valid payment method',
    },
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  status: {
    type: String,
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

SaleSchema.index({ organizationId: 1, invoiceNo: 1 }, { unique: true })

// Optimizes date-based dashboard charts and aggregations
SaleSchema.index({ organizationId: 1, createdAt: -1 })
// Optimizes queries searching for sales containing specific products within an organization
SaleSchema.index({ organizationId: 1, 'items.product': 1 })

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema)
