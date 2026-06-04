'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU code is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  costPrice: z.coerce.number().min(0, 'Cost cannot be negative'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  threshold: z.coerce.number().min(0, 'Threshold cannot be negative'),
  description: z.string().optional(),
  supplier: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal(''))
})

export default function AddProductModal({ isOpen, onClose, suppliers = [], onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'Electronics',
      price: '',
      costPrice: '',
      stock: 0,
      threshold: 5,
      description: '',
      supplier: '',
      imageUrl: ''
    }
  })

  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          costPrice: Number(data.costPrice),
          stock: Number(data.stock),
          threshold: Number(data.threshold),
          supplier: data.supplier || null
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      reset()
      onSuccess()
      onClose()
      toast.success('Product added successfully!')
    } catch (err) {
      console.error('Error adding product:', err)
      setSubmitError(err.message || 'Something went wrong')
      toast.error(err.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="bg-brandDanger/10 border border-brandDanger/20 text-brandDanger p-3 rounded-xl text-xs font-semibold">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Product Name *</label>
              <Input
                type="text"
                placeholder="e.g. Led Bulb 12W"
                {...register('name')}
                className={errors.name ? 'border-brandDanger' : ''}
              />
              {errors.name && <span className="text-[10px] text-brandDanger font-semibold">{errors.name.message}</span>}
            </div>

            {/* SKU */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">SKU * (Unique Identifier)</label>
              <Input
                type="text"
                placeholder="e.g. ELEC-BULB-12W"
                {...register('sku')}
                className={errors.sku ? 'border-brandDanger' : ''}
              />
              {errors.sku && <span className="text-[10px] text-brandDanger font-semibold">{errors.sku.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Category *</label>
              <Select {...register('category')}>
                <option value="Electronics" className="bg-white text-textPrimary">Electronics</option>
                <option value="Clothing" className="bg-white text-textPrimary">Clothing</option>
                <option value="Food & Beverages" className="bg-white text-textPrimary">Food & Beverages</option>
                <option value="Stationery" className="bg-white text-textPrimary">Stationery</option>
                <option value="Hardware" className="bg-white text-textPrimary">Hardware</option>
                <option value="Other" className="bg-white text-textPrimary">Other</option>
              </Select>
            </div>

            {/* Supplier */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Linked Supplier</label>
              <Select {...register('supplier')}>
                <option value="" className="bg-white text-textPrimary">Select a supplier (Optional)</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id} className="bg-white text-textPrimary">
                    {sup.name} {sup.company ? `(${sup.company})` : ''}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Selling Price (PKR) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 350"
                {...register('price')}
                className={errors.price ? 'border-brandDanger' : ''}
              />
              {errors.price && <span className="text-[10px] text-brandDanger font-semibold">{errors.price.message}</span>}
            </div>

            {/* Cost Price */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Cost Price (PKR) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 220"
                {...register('costPrice')}
                className={errors.costPrice ? 'border-brandDanger' : ''}
              />
              {errors.costPrice && <span className="text-[10px] text-brandDanger font-semibold">{errors.costPrice.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Initial Stock */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Initial Stock *</label>
              <Input
                type="number"
                placeholder="e.g. 100"
                {...register('stock')}
                className={errors.stock ? 'border-brandDanger' : ''}
              />
              {errors.stock && <span className="text-[10px] text-brandDanger font-semibold">{errors.stock.message}</span>}
            </div>

            {/* Threshold */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Low Stock Warning Level *</label>
              <Input
                type="number"
                placeholder="e.g. 5"
                {...register('threshold')}
                className={errors.threshold ? 'border-brandDanger' : ''}
              />
              {errors.threshold && <span className="text-[10px] text-brandDanger font-semibold">{errors.threshold.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Image URL */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Image URL</label>
              <Input
                type="url"
                placeholder="e.g. https://domain.com/image.jpg"
                {...register('imageUrl')}
                className={errors.imageUrl ? 'border-brandDanger' : ''}
              />
              {errors.imageUrl && <span className="text-[10px] text-brandDanger font-semibold">{errors.imageUrl.message}</span>}
            </div>

            {/* Description */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-textSecondary">Description</label>
              <textarea
                placeholder="Product description notes..."
                {...register('description')}
                className="flex min-h-[60px] w-full rounded-xl border border-borderColor/10 bg-borderColor/5 px-4 py-2 text-sm text-textPrimary placeholder-[#475569] transition-all focus:border-brandPrimary focus:outline-none focus:ring-4 focus:ring-brandPrimary/15"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? 'Adding...' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
