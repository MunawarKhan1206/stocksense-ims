'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function AddSaleModal({ isOpen, onClose, products = [], onSuccess }) {
  const [items, setItems] = useState([
    { product: '', quantity: 1, unitPrice: 0, costPrice: 0, subtotal: 0, stock: 0 }
  ])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleClose = () => {
    setItems([{ product: '', quantity: 1, unitPrice: 0, costPrice: 0, subtotal: 0, stock: 0 }])
    setPaymentMethod('Cash')
    setSubmitError('')
    onClose()
  }

  // Handle product dropdown change
  const handleProductChange = (index, productId) => {
    const newItems = [...items]
    const selectedProd = products.find((p) => p._id === productId)

    if (selectedProd) {
      newItems[index].product = productId
      newItems[index].unitPrice = selectedProd.price
      newItems[index].costPrice = selectedProd.costPrice
      newItems[index].stock = selectedProd.stock
      newItems[index].subtotal = selectedProd.price * newItems[index].quantity
    } else {
      newItems[index].product = ''
      newItems[index].unitPrice = 0
      newItems[index].costPrice = 0
      newItems[index].stock = 0
      newItems[index].subtotal = 0
    }
    setItems(newItems)
  }

  // Handle quantity change
  const handleQuantityChange = (index, quantity) => {
    const newItems = [...items]
    const qty = Math.max(1, Number(quantity) || 1)
    newItems[index].quantity = qty
    newItems[index].subtotal = newItems[index].unitPrice * qty
    setItems(newItems)
  }

  // Add a new row to the sale items list
  const addItemRow = () => {
    setItems([
      ...items,
      { product: '', quantity: 1, unitPrice: 0, costPrice: 0, subtotal: 0, stock: 0 }
    ])
  }

  // Remove a row
  const removeItemRow = (index) => {
    if (items.length === 1) return
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  // Calculate live total and profit
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
  const liveProfit = totalAmount - totalCost

  // Verify if any row has stock violations or unselected products
  const hasValidationErrors = items.some(
    (item) => !item.product || item.quantity > item.stock
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (hasValidationErrors) {
      setSubmitError('Please fix all stock warning issues and select products before submitting.')
      toast.error('Please fix validation issues before submitting')
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.product,
            quantity: item.quantity
          })),
          paymentMethod
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to record sale')
      }

      onSuccess()
      handleClose()
      toast.success('Sales transaction recorded successfully!')
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || 'Failed to save sales transaction')
      toast.error(err.message || 'Failed to save sales transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record New Sales Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-brandDanger/10 border border-brandDanger/20 text-brandDanger p-3 rounded-xl text-xs font-semibold">
              {submitError}
            </div>
          )}

          {/* Table Headers */}
          <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-textMuted uppercase tracking-wider px-2">
            <div className="col-span-5">Product Selector</div>
            <div className="col-span-2 text-right">Available Stock</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Subtotal</div>
            <div className="col-span-1"></div>
          </div>

          {/* Dynamic Item Rows */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const isStockViolated = item.product && item.quantity > item.stock
              
              return (
                <div key={idx} className="flex flex-col space-y-2 border border-borderColor/5 bg-white/[0.01] p-3 rounded-xl md:border-0 md:bg-transparent md:p-0 md:grid md:grid-cols-12 md:gap-3 md:items-center">
                  
                  {/* Product select */}
                  <div className="md:col-span-5">
                    <span className="md:hidden text-[10px] font-bold text-textMuted uppercase mb-1 block">Product</span>
                    <Select 
                      value={item.product} 
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                    >
                      <option value="" className="bg-white text-textPrimary">Choose Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id} disabled={p.stock === 0} className="bg-white text-textPrimary disabled:opacity-50">
                          {p.name} {p.stock === 0 ? '(OUT OF STOCK)' : `(${formatCurrency(p.price)})`}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Stock count */}
                  <div className="flex justify-between items-center md:col-span-2 md:text-right">
                    <span className="md:hidden text-[10px] font-bold text-textMuted uppercase">Stock</span>
                    <span className={`text-xs font-mono font-semibold ${item.stock === 0 ? 'text-brandDanger' : 'text-textSecondary'}`}>
                      {item.product ? `${item.stock} units` : '-'}
                    </span>
                  </div>

                  {/* Quantity input */}
                  <div className="md:col-span-2">
                    <span className="md:hidden text-[10px] font-bold text-textMuted uppercase mb-1 block">Qty</span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      disabled={!item.product}
                      className="text-right"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center md:col-span-2 md:text-right">
                    <span className="md:hidden text-[10px] font-bold text-textMuted uppercase">Subtotal</span>
                    <span className="text-xs font-bold text-textPrimary font-mono">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>

                  {/* Delete row button */}
                  <div className="flex justify-end md:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length === 1}
                      className="p-2 text-textMuted hover:text-brandDanger disabled:opacity-30 rounded-lg hover:bg-borderColor/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stock Warning message */}
                  {isStockViolated && (
                    <div className="col-span-12 flex items-center space-x-1.5 text-[11px] text-brandDanger font-semibold bg-brandDanger/5 border border-brandDanger/10 p-2 rounded-lg mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Warning: Requested quantity ({item.quantity}) exceeds available stock ({item.stock} units)</span>
                    </div>
                  )}

                </div>
              )
            })}
          </div>

          {/* Add Item Button */}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addItemRow} 
            className="w-full border-dashed border-borderColor/10 hover:border-[#FF6B6B]/40 hover:text-[#FF6B6B]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Item Row</span>
          </Button>

          {/* Payment and Live Totals */}
          <div className="border-t border-borderColor/5 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            
            {/* Payment Method */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Payment Method</label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Cash" className="bg-white text-textPrimary">Cash Payment</option>
                <option value="Card" className="bg-white text-textPrimary">Card Payment</option>
                <option value="Bank Transfer" className="bg-white text-textPrimary">Bank Transfer</option>
              </Select>
            </div>

            {/* Calculations Card */}
            <div className="bg-borderColor/2 border border-borderColor/5 p-4 rounded-2xl flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-textSecondary font-medium">
                <span>Estimated Profit:</span>
                <span className={`font-mono font-bold ${liveProfit >= 0 ? 'text-brandSuccess' : 'text-brandDanger'}`}>
                  {formatCurrency(liveProfit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-textPrimary pt-2 border-t border-borderColor/10">
                <span>Grand Total:</span>
                <span className="font-mono text-brandPrimary glow-text-coral">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              disabled={loading || hasValidationErrors}
            >
              {loading ? 'Recording...' : 'Record Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
