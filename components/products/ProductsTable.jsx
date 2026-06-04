'use client'

import { Edit, Trash2, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ProductsTable({ products = [], onEdit, onDelete }) {
  const { data: session } = useSession()
  const role = session?.user?.role || 'staff'

  const canEdit = ['super-admin', 'admin', 'inventory-staff'].includes(role)
  const canDelete = ['super-admin', 'admin'].includes(role) // Inventory Staff cannot delete
  const showActions = canEdit || canDelete

  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === 'supplier') {
      aVal = a.supplier?.name || ''
      bVal = b.supplier?.name || ''
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center text-xs">#</TableHead>
            <TableHead 
              className="text-xs cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1.5">
                <span>Name</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead 
              className="text-xs cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('sku')}
            >
              <div className="flex items-center space-x-1.5">
                <span>SKU</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead 
              className="text-xs cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center space-x-1.5">
                <span>Category</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead 
              className="text-xs text-right cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('stock')}
            >
              <div className="flex items-center space-x-1.5 justify-end">
                <span>Stock</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead 
              className="text-xs text-right cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center space-x-1.5 justify-end">
                <span>Price (PKR)</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead 
              className="text-xs text-right cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('costPrice')}
            >
              <div className="flex items-center space-x-1.5 justify-end">
                <span>Cost (PKR)</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead 
              className="text-xs cursor-pointer hover:text-brandPrimary select-none transition-colors"
              onClick={() => handleSort('supplier')}
            >
              <div className="flex items-center space-x-1.5">
                <span>Supplier</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            {showActions && <TableHead className="text-xs text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((prod, idx) => {
            const isLowStock = prod.stock <= prod.threshold
            const isOutOfStock = prod.stock === 0
            
            return (
              <TableRow key={prod._id}>
                <TableCell className="text-center text-xs text-textMuted font-mono">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {prod.imageUrl ? (
                       <img 
                         src={prod.imageUrl} 
                         alt={prod.name} 
                         className="w-8 h-8 rounded-lg object-cover border border-borderColor/5 shrink-0"
                         onError={(e) => { e.target.style.display = 'none' }}
                       />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-borderColor/5 border border-borderColor/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-textMuted">
                        IMG
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-textPrimary truncate max-w-[150px]">{prod.name}</span>
                      {prod.description && (
                        <span className="text-[10px] text-textMuted truncate max-w-[150px]">{prod.description}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-textSecondary">{prod.sku}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 border-borderColor/10 text-textSecondary">
                    {prod.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isOutOfStock ? (
                    <Badge variant="danger" className="pulse-red-dot font-bold">OUT OF STOCK</Badge>
                  ) : isLowStock ? (
                    <Badge variant="warning" className="pulse-red-dot font-bold">LOW: {prod.stock}</Badge>
                  ) : (
                    <Badge variant="success" className="font-bold">{prod.stock} units</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs font-semibold font-sans tabular-nums text-textPrimary">
                  Rs. {prod.price?.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-xs text-textSecondary font-mono tabular-nums">
                  Rs. {prod.costPrice?.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-textSecondary">
                  {prod.supplier ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-textPrimary">{prod.supplier.name}</span>
                      {prod.supplier.company && (
                        <span className="text-[10px] text-textMuted">{prod.supplier.company}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-textMuted font-mono">None</span>
                  )}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {canEdit && (
                        <button
                          onClick={() => onEdit(prod)}
                          className="p-1.5 text-textSecondary hover:text-brandPrimary hover:bg-borderColor/5 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(prod)}
                          className="p-1.5 text-textSecondary hover:text-brandDanger hover:bg-borderColor/5 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
