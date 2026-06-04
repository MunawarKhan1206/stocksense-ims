'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

export default function SalesTable({ sales = [] }) {
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getPaymentBadgeVariant = (method) => {
    switch (method) {
      case 'Cash':
        return 'success'
      case 'Card':
        return 'secondary'
      case 'Bank Transfer':
        return 'default'
      default:
        return 'outline'
    }
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="text-xs">Invoice No</TableHead>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs text-right">Items Count</TableHead>
            <TableHead className="text-xs text-right">Total Amount (PKR)</TableHead>
            <TableHead className="text-xs text-right">Net Profit (PKR)</TableHead>
            <TableHead className="text-xs">Payment Method</TableHead>
            <TableHead className="text-xs">Recorded By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const isExpanded = expandedRows.has(sale._id)
            const date = new Date(sale.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            const totalItemsQty = sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

            return (
              <React.Fragment key={sale._id}>
                {/* Main Row */}
                <TableRow
                  className="cursor-pointer hover:bg-borderColor/4"
                  onClick={() => toggleRow(sale._id)}
                >
                  <TableCell className="text-center">
                    <button className="p-1 text-textSecondary hover:text-textPrimary rounded-lg">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-textPrimary tracking-wider">
                    {sale.invoiceNo}
                  </TableCell>
                  <TableCell className="text-xs text-textSecondary">
                    {date}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono text-textPrimary font-semibold">
                    {totalItemsQty}
                  </TableCell>
                  <TableCell className="text-xs text-right font-bold text-[#34D399] tabular-nums">
                    Rs. {sale.totalAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-right font-bold text-[#34D399] tabular-nums">
                    Rs. {sale.profit?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentBadgeVariant(sale.paymentMethod)}>
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-textSecondary">
                    {sale.recordedBy?.name || 'StockSense IMS Staff'}
                  </TableCell>
                </TableRow>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <TableRow className="bg-white/[0.01] hover:bg-white/[0.01] border-l-2 border-brandPrimary">
                    <TableCell colSpan={8} className="p-6">
                      <div className="rounded-xl border border-borderColor/5 bg-brandSidebar/50 p-4 overflow-x-auto">
                        <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-textMuted uppercase tracking-wider">
                          <Eye className="w-4 h-4 text-brandSecondary" />
                          <span>Invoice Items Details Breakdown</span>
                        </div>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-borderColor/5 text-textSecondary font-semibold">
                              <th className="py-2 px-3">Product Name</th>
                              <th className="py-2 px-3 text-right">Quantity</th>
                              <th className="py-2 px-3 text-right">Unit Price (PKR)</th>
                              <th className="py-2 px-3 text-right">Subtotal (PKR)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items?.map((item, idx) => (
                              <tr key={idx} className="border-b border-white/[0.02] last:border-0 hover:bg-borderColor/2">
                                <td className="py-2.5 px-3 font-medium text-textPrimary">{item.productName}</td>
                                <td className="py-2.5 px-3 text-right font-mono text-textSecondary">{item.quantity}</td>
                                <td className="py-2.5 px-3 text-right font-mono text-textSecondary">Rs. {item.unitPrice?.toLocaleString()}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-textPrimary tabular-nums">Rs. {item.subtotal?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
