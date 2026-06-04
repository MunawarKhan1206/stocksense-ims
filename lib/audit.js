import AuditLog from '@/models/AuditLog'

/**
 * Creates an audit log entry in MongoDB
 * @param {Object} session - NextAuth session object
 * @param {String} action - The audit action (e.g. 'ARCHIVE_PRODUCT', 'UPDATE_STOCK')
 * @param {String} targetType - Model type involved (e.g. 'Product', 'Supplier')
 * @param {String|ObjectId} targetId - ID of the target document
 * @param {String} details - Detail message for the audit trace
 */
export async function logAudit(session, action, targetType, targetId, details) {
  try {
    const userId = session?.user?.id
    const userName = session?.user?.name || 'System / Auto'
    const organizationId = session?.user?.organizationId

    if (!userId || !organizationId) {
      console.warn(`Audit Log Warning: Missing userId (${userId}) or organizationId (${organizationId}) for action '${action}'`)
      return
    }

    await AuditLog.create({
      userId,
      userName,
      action,
      targetType,
      targetId,
      details: details || '',
      organizationId,
    })
  } catch (err) {
    console.error('Failed to log audit activity:', err)
  }
}
