import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative'],
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  threshold: {
    type: Number,
    default: 5,
    min: [0, 'Threshold cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Electronics', 'Clothing', 'Food & Beverages', 'Stationery', 'Hardware', 'Other'],
      message: '{VALUE} is not a valid category',
    },
  },
  imageUrl: {
    type: String,
    default: '',
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update standard updatedAt field on save
ProductSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

ProductSchema.index(
  { organizationId: 1, sku: 1 },
  { unique: true, partialFilterExpression: { isArchived: false } }
)

// Optimizes dashboard loading and sorting by product creation date
ProductSchema.index({ organizationId: 1, createdAt: -1 })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
