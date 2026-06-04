import mongoose from 'mongoose'

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema)
