import mongoose from 'mongoose'

const StockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: {
      values: ['in', 'out', 'adjustment'],
      message: '{VALUE} is not a valid stock movement type',
    },
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    default: '',
    trim: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Optimizes live stock activity feed sorting
StockMovementSchema.index({ organizationId: 1, createdAt: -1 })
// Optimizes product-specific stock ledger history lookups
StockMovementSchema.index({ organizationId: 1, product: 1 })

export default mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema)
