import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    // e.g., 'ARCHIVE_PRODUCT', 'UPDATE_STOCK', 'RESEND_EMAIL', 'ARCHIVE_SUPPLIER', 'EDIT_SUPPLIER'
  },
  targetType: {
    type: String,
    required: true,
    // e.g., 'Product', 'Supplier', 'EmailLog', 'Sale'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
