import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'inventory-staff', 'sales-staff', 'viewer'],
    default: 'admin',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  image: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound indexes for multi-tenant speed and security
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true })
UserSchema.index({ organizationId: 1, role: 1 })

export default mongoose.models.User || mongoose.model('User', UserSchema)
