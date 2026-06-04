import mongoose from 'mongoose'

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
  },
  company: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
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
})

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema)
