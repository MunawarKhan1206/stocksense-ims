'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, CheckCircle2, XCircle, Clock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function EmailLogsPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super-admin'
  const isAdmin = session?.user?.role === 'admin'
  const canManageLogs = isSuperAdmin || isAdmin

  const [logs, setLogs] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [supplierFilter, setSupplierFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [retryingId, setRetryingId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [logsRes, suppliersRes] = await Promise.all([
        fetch('/api/email-logs', { cache: 'no-store' }),
        fetch('/api/suppliers', { cache: 'no-store' })
      ])

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(Array.isArray(logsData) ? logsData : [])
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json()
        const suppList = suppliersData.data || suppliersData
        setSuppliers(Array.isArray(suppList) ? suppList : [])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      toast.error('Failed to load email log history data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Retry resend email handler
  const handleResend = async (logId) => {
    setRetryingId(logId)
    const toastId = toast.loading('Resending restock email alert...')
    try {
      const res = await fetch('/api/email-logs/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logId })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend email')
      }

      toast.success('Restock email alert resent successfully!', { id: toastId })
      
      // Update logs list in UI
      setLogs((prev) =>
        prev.map((log) => (log._id === logId ? data.log : log))
      )
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Error occurred while resending email', { id: toastId })
    } finally {
      setRetryingId(null)
    }
  }

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    // Check both populate format and flat format
    const logSuppId = log.supplierId?._id || log.supplierId
    const matchesSupplier =
      supplierFilter === 'All' || logSuppId === supplierFilter

    const matchesStatus =
      statusFilter === 'All' || log.status === statusFilter

    return matchesSupplier && matchesStatus
  })

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight">
          Email Delivery Logs
        </h1>

        <p className="text-xs text-textSecondary mt-0.5">
          Audit trail for automated supplier restock requests and low stock alerts.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-borderColor rounded-lg px-3 py-2.5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

            {/* Supplier */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-textMuted whitespace-nowrap">
                Supplier
              </span>

              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="
                  h-8
                  rounded-md
                  border border-borderColor
                  bg-white
                  px-2.5
                  text-xs
                  outline-none
                  focus:ring-1
                  focus:ring-primary
                  min-w-[170px]
                "
              >
                <option value="All">All Suppliers</option>

                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-textMuted whitespace-nowrap">
                Status
              </span>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  h-8
                  rounded-md
                  border border-borderColor
                  bg-white
                  px-2.5
                  text-xs
                  outline-none
                  focus:ring-1
                  focus:ring-primary
                  min-w-[120px]
                "
              >
                <option value="All">All</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>

          </div>

          {/* Count */}
          <div className="text-[11px] text-textMuted">
            {filteredLogs.length} logs
          </div>

        </div>
      </div>

      {loading ? (

        <div className="bg-white border border-borderColor rounded-lg p-4 space-y-2">
          <Skeleton className="h-8 w-full" />

          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>

      ) : filteredLogs.length === 0 ? (

        <EmptyState
          icon={Mail}
          title={
            supplierFilter !== 'All' || statusFilter !== 'All'
              ? 'No matching logs found'
              : 'No email logs found'
          }
          description={
            supplierFilter !== 'All' || statusFilter !== 'All'
              ? 'Try adjusting your filters.'
              : 'Automated emails sent to suppliers will appear here.'
          }
        />

      ) : (

        <div className="bg-white border border-borderColor rounded-lg overflow-hidden">

          {/* Desktop */}
          <div className="hidden lg:block">

            <table className="w-full table-fixed text-xs">

              <thead className="bg-surfaceBg border-b border-borderColor">

                <tr>

                  <th className="px-3 py-2 text-left font-semibold text-textMuted w-[180px]">
                    Date
                  </th>

                  <th className="px-3 py-2 text-left font-semibold text-textMuted w-[130px]">
                    Type
                  </th>

                  <th className="px-3 py-2 text-left font-semibold text-textMuted">
                    Recipient
                  </th>

                  <th className="px-3 py-2 text-left font-semibold text-textMuted">
                    Product
                  </th>

                  <th className="px-3 py-2 text-left font-semibold text-textMuted w-[90px]">
                    Qty
                  </th>

                  <th className="px-3 py-2 text-left font-semibold text-textMuted w-[110px]">
                    Status
                  </th>

                  {canManageLogs && (
                    <th className="px-3 py-2 text-right font-semibold text-textMuted w-[110px]">
                      Action
                    </th>
                  )}

                </tr>

              </thead>

              <tbody className="divide-y divide-borderColor/50">

                {filteredLogs.map((log) => (

                  <tr
                    key={log._id}
                    className="hover:bg-surfaceBg/40 transition-colors"
                  >

                    {/* Date */}
                    <td className="px-3 py-2">

                      <div className="flex items-center gap-1.5 text-textSecondary">

                        <Clock className="w-3 h-3 flex-shrink-0" />

                        <span className="truncate">
                          {new Date(log.sentAt).toLocaleString()}
                        </span>

                      </div>

                    </td>

                    {/* Type */}
                    <td className="px-3 py-2">

                      <span className="
                        inline-flex
                        px-2 py-0.5
                        rounded
                        text-[10px]
                        font-medium
                        bg-brandPrimary/10
                        text-brandPrimary
                      ">
                        {log.type === 'restock_request'
                          ? 'Restock'
                          : log.type}
                      </span>

                    </td>

                    {/* Recipient */}
                    <td className="px-3 py-2 min-w-0">

                      <div className="min-w-0">

                        <p className="font-medium text-textPrimary truncate">
                          {log.supplierId?.name || 'Unknown'}
                        </p>

                        <p className="text-[10px] text-textMuted truncate">
                          {log.supplierEmail}
                        </p>

                      </div>

                    </td>

                    {/* Product */}
                    <td className="px-3 py-2">

                      <p className="truncate text-textSecondary">
                        {log.productName || log.productId?.name || 'N/A'}
                      </p>

                    </td>

                    {/* Qty */}
                    <td className="px-3 py-2">

                      <span className="font-mono font-semibold">
                        {log.quantitySuggested || '-'}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">

                      {log.status === 'sent' ? (

                        <div className="flex items-center gap-1 text-brandSuccess">

                          <CheckCircle2 className="w-3.5 h-3.5" />

                          <span className="text-[11px] font-medium">
                            Sent
                          </span>

                        </div>

                      ) : (

                        <div className="flex items-center gap-1 text-brandDanger">

                          <XCircle className="w-3.5 h-3.5" />

                          <span className="text-[11px] font-medium">
                            Failed
                          </span>

                        </div>

                      )}

                    </td>

                    {/* Action */}
                    {canManageLogs && (

                      <td className="px-3 py-2 text-right">

                        <button
                          onClick={() => handleResend(log._id)}
                          disabled={retryingId === log._id}
                          className={`
                            h-7
                            px-2.5
                            rounded-md
                            text-[11px]
                            font-medium
                            border
                            inline-flex
                            items-center
                            gap-1
                            transition-colors
                            ${
                              retryingId === log._id
                                ? 'bg-slate-50 text-textMuted border-borderColor cursor-not-allowed'
                                : 'bg-blue-50 text-brandSecondary border-blue-100 hover:bg-blue-100'
                            }
                          `}
                        >
                          <Send className="w-3 h-3" />

                          {retryingId === log._id
                            ? 'Sending'
                            : 'Resend'}
                        </button>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden divide-y divide-borderColor/60">

            {filteredLogs.map((log) => (

              <div
                key={log._id}
                className="p-3 space-y-2"
              >

                {/* Top */}
                <div className="flex items-center justify-between gap-2">

                  <div className="flex items-center gap-1 text-[11px] text-textMuted">
                    <Clock className="w-3 h-3" />

                    <span>
                      {new Date(log.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <span className="
                    text-[10px]
                    font-medium
                    px-2 py-0.5
                    rounded
                    bg-brandPrimary/10
                    text-brandPrimary
                  ">
                    {log.type === 'restock_request'
                      ? 'Restock'
                      : log.type}
                  </span>

                </div>

                {/* Middle */}
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0 flex-1">

                    <p className="font-medium text-sm text-textPrimary truncate">
                      {log.supplierId?.name || 'Unknown'}
                    </p>

                    <p className="text-[11px] text-textMuted truncate">
                      {log.supplierEmail}
                    </p>

                    <p className="text-xs text-textSecondary truncate mt-1">
                      {log.productName || log.productId?.name || 'N/A'}
                    </p>

                  </div>

                  <div className="text-right flex-shrink-0">

                    <p className="text-sm font-semibold">
                      {log.quantitySuggested || '-'}
                    </p>

                    {log.status === 'sent' ? (
                      <div className="flex items-center justify-end gap-1 text-brandSuccess mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px]">Sent</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 text-brandDanger mt-1">
                        <XCircle className="w-3 h-3" />
                        <span className="text-[10px]">Failed</span>
                      </div>
                    )}

                  </div>

                </div>

                {/* Button */}
                {canManageLogs && (
                  <button
                    onClick={() => handleResend(log._id)}
                    disabled={retryingId === log._id}
                    className={`
                      w-full
                      h-8
                      rounded-md
                      text-[11px]
                      font-medium
                      border
                      inline-flex
                      items-center
                      justify-center
                      gap-1
                      transition-colors
                      ${
                        retryingId === log._id
                          ? 'bg-slate-50 text-textMuted border-borderColor cursor-not-allowed'
                          : 'bg-blue-50 text-brandSecondary border-blue-100 hover:bg-blue-100'
                      }
                    `}
                  >
                    <Send className="w-3 h-3" />

                    {retryingId === log._id
                      ? 'Sending'
                      : 'Resend Email'}
                  </button>
                )}

              </div>

            ))}

          </div>

        </div>

      )}
    </div>
  )
}