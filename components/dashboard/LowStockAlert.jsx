'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

export default function LowStockAlert({ products = [] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-brandPrimary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-textPrimary tracking-tight">Low Stock Alerts</h3>
            <p className="text-xs text-textSecondary">Products below minimum stock threshold</p>
          </div>
        </div>
        {products.length > 0 && (
          <Badge variant="danger" className="font-mono text-[10px]">
            {products.length} items
          </Badge>
        )}
      </div>

      <div className="mt-4 overflow-x-auto min-h-[200px]">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-brandSuccess mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-textPrimary">Inventory Healthy</p>
            <p className="text-xs text-textMuted mt-1 max-w-[200px]">No products are below their minimum stock threshold.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((prod) => (
                <TableRow key={prod._id}>
                  <TableCell className="font-semibold text-xs max-w-[130px] truncate">{prod.name}</TableCell>
                  <TableCell className="text-xs font-mono text-textSecondary">{prod.sku}</TableCell>
                  <TableCell className="text-xs text-right">
                    <span className="text-brandPrimary font-black tabular-nums">{prod.stock}</span>
                  </TableCell>
                  <TableCell className="text-xs text-right text-textMuted font-mono">{prod.threshold}</TableCell>
                  <TableCell className="text-xs text-right">
                    <Link href={`/products?editId=${prod._id}`}>
                      <Button size="sm" variant="secondary" className="h-7 text-[10px] px-2.5 border-red-200 text-brandPrimary hover:bg-red-50 hover:border-brandPrimary">
                        Restock
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {products.length > 0 && (
        <div className="mt-4 pt-3 border-t border-borderColor flex justify-end">
          <Link href="/products" className="text-xs font-bold text-brandPrimary hover:underline flex items-center space-x-1">
            <span>Manage Inventory</span>
            <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </div>
      )}
    </Card>
  )
}
