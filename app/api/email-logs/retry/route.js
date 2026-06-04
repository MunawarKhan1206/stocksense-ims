import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import EmailLog from '@/models/EmailLog'
import Product from '@/models/Product'
import Supplier from '@/models/Supplier'
import Organization from '@/models/Organization'
import { sendRestockEmail } from '@/lib/emailService'
import { getSessionOrReject, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'
import { logAudit } from '@/lib/audit'

export async function POST(req) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    // Role check: Only Super Admin and Org Admin can retry/resend emails
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const { logId } = await req.json()
    if (!logId) {
      return NextResponse.json({ error: 'Log ID is required.' }, { status: 400 })
    }

    const emailLog = await EmailLog.findById(logId)
    if (!emailLog) {
      return NextResponse.json({ error: 'Email log not found.' }, { status: 404 })
    }

    // Tenant Check: Org Admins can only retry logs belonging to their own organization
    if (session.user.role !== 'super-admin' && emailLog.organizationId?.toString() !== session.user.organizationId?.toString()) {
      return rejectForbidden()
    }

    // Load active or archived references to build the email payload
    const product = emailLog.productId ? await Product.findById(emailLog.productId) : null
    const supplier = emailLog.supplierId ? await Supplier.findById(emailLog.supplierId) : null
    const org = emailLog.organizationId ? await Organization.findById(emailLog.organizationId) : null

    const payload = {
      productName: product?.name || emailLog.productName || 'Unknown Product',
      sku: product?.sku || 'N/A',
      supplierEmail: supplier?.email || emailLog.supplierEmail,
      supplierName: supplier?.name || 'Supplier',
      currentStock: product?.stock !== undefined ? product.stock : 0,
      threshold: product?.threshold !== undefined ? product.threshold : 5,
      suggestedQuantity: emailLog.quantitySuggested || 5,
      imageUrl: product?.imageUrl || '',
      orgName: org?.name || 'StockSense IMS',
      managerName: session.user.name,
      managerPhone: '',
      productId: emailLog.productId,
      supplierId: emailLog.supplierId,
      organizationId: emailLog.organizationId,
    }

    // Resend the email
    const result = await sendRestockEmail(payload)

    // Update the log record with the new result
    emailLog.status = result.sent ? 'sent' : 'failed'
    emailLog.error = result.error || ''
    emailLog.sentAt = new Date()
    await emailLog.save()

    // Write audit log
    await logAudit(
      session,
      'RESEND_EMAIL',
      'EmailLog',
      emailLog._id,
      `Manually resent restock request for '${payload.productName}' to supplier '${payload.supplierName}' (${payload.supplierEmail}). Result: ${emailLog.status}`
    )

    if (!result.sent) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email resent successfully!', log: emailLog })
  } catch (error) {
    return handleApiError(error, 'POST /api/email-logs/retry')
  }
}
