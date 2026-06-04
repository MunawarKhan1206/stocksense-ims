'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional()
})

export default function EditSupplierModal({ isOpen, onClose, supplier, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(supplierSchema)
  })

  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-fill form when supplier changes
  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name || '',
        company: supplier.company || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || ''
      })
    }
  }, [supplier, reset])

  const onSubmit = async (data) => {
    if (!supplier?._id) return
    setLoading(true)
    setSubmitError('')
    try {
      const res = await fetch(`/api/suppliers/${supplier._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update supplier')
      }

      onSuccess()
      onClose()
      toast.success('Supplier updated successfully!')
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || 'Something went wrong')
      toast.error(err.message || 'Failed to update supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Supplier Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="bg-brandDanger/10 border border-brandDanger/20 text-brandDanger p-3 rounded-xl text-xs font-semibold">
              {submitError}
            </div>
          )}

          {/* Supplier Name */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-textSecondary">Contact Full Name *</label>
            <Input
              type="text"
              placeholder="e.g. Zahid Ahmed"
              {...register('name')}
              className={errors.name ? 'border-brandDanger' : ''}
            />
            {errors.name && <span className="text-[10px] text-brandDanger font-semibold">{errors.name.message}</span>}
          </div>

          {/* Company Name */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-textSecondary">Company Name</label>
            <Input
              type="text"
              placeholder="e.g. Lahore Wholesale Hub"
              {...register('company')}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-textSecondary">Email Address</label>
            <Input
              type="email"
              placeholder="e.g. contact@wholesaler.com"
              {...register('email')}
              className={errors.email ? 'border-brandDanger' : ''}
            />
            {errors.email && <span className="text-[10px] text-brandDanger font-semibold">{errors.email.message}</span>}
          </div>

          {/* Phone */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-textSecondary">Phone Number</label>
            <Input
              type="text"
              placeholder="e.g. +92 300 1234567"
              {...register('phone')}
            />
          </div>

          {/* Address */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-textSecondary">Physical Address</label>
            <textarea
              placeholder="Full shop/warehouse location details..."
              {...register('address')}
              className="flex min-h-[60px] w-full rounded-xl border border-borderColor/10 bg-borderColor/5 px-4 py-2 text-sm text-textPrimary placeholder-[#475569] transition-all focus:border-brandPrimary focus:outline-none focus:ring-4 focus:ring-brandPrimary/15"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
