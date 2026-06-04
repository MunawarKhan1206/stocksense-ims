'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Truck, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import SuppliersTable from '@/components/suppliers/SuppliersTable'
import AddSupplierModal from '@/components/suppliers/AddSupplierModal'
import EditSupplierModal from '@/components/suppliers/EditSupplierModal'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'

import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

function SuppliersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role || 'staff'
  const canManage = ['super-admin', 'admin'].includes(role)

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedSupplier, setSelectedSupplier] = useState(null)

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/suppliers', { cache: 'no-store' })

      if (res.status === 403) {
        router.replace('/forbidden')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load suppliers')
      }

      const data = await res.json()
      const suppData = data.data || data

      setSuppliers(Array.isArray(suppData) ? suppData : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch suppliers database registry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Open Add Modal from command bar
  useEffect(() => {
    const openAdd = searchParams.get('openAdd')

    if (openAdd === 'true') {
      setIsAddOpen(true)
      router.replace('/suppliers')
    }
  }, [searchParams, router])

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((sup) => {
    return (
      sup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Edit supplier
  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier)
    setIsEditOpen(true)
  }

  // Delete supplier
  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteOpen(true)
  }

  // Confirm delete
  const executeDelete = async () => {
    if (!selectedSupplier?._id) return

    try {
      const res = await fetch(`/api/suppliers/${selectedSupplier._id}`, {
        method: 'DELETE'
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete supplier')
      }

      toast.success('Supplier deleted successfully')

      setSelectedSupplier(null)
      setIsDeleteOpen(false)

      fetchSuppliers()
    } catch (err) {
      console.error(err)

      toast.error(err.message || 'Cannot delete supplier')

      setIsDeleteOpen(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight leading-none">
            Suppliers Directory
          </h1>

          <p className="text-sm md:text-base text-textSecondary mt-1">
            Manage partner companies, contact addresses, phone records and catalog links.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsAddOpen(true)}
            variant="default"
            className="btn-primary-glow text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            <span>Add New Supplier</span>
          </Button>
        )}

      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-borderColor rounded-xl p-4">

        <div className="relative w-full md:max-w-xs">

          <Search className="absolute left-3 top-3 w-4 h-4 text-textMuted" />

          <Input
            type="text"
            placeholder="Search by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />

        </div>

      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />

        </div>
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={
            searchTerm
              ? 'No matching suppliers found'
              : 'No suppliers registered yet'
          }
          description={
            searchTerm
              ? 'Try adjusting your search query.'
              : 'Add your first supplier partner to connect them with products.'
          }
          ctaLabel={searchTerm || !canManage ? null : 'Add Supplier'}
          ctaAction={
            searchTerm || !canManage
              ? null
              : () => setIsAddOpen(true)
          }
        />
      ) : (
        <SuppliersTable
          suppliers={filteredSuppliers}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchSuppliers}
      />

      {/* Edit Supplier Modal */}
      <EditSupplierModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedSupplier(null)
        }}
        supplier={selectedSupplier}
        onSuccess={fetchSuppliers}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle className="text-brandDanger">
              Delete Supplier Contact
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-textPrimary font-bold">
                {selectedSupplier?.name}
              </strong>{' '}
              (
              {selectedSupplier?.company || 'Private Distributor'}
              )?
              This action will permanently remove this supplier record.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedSupplier(null)
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={executeDelete}>
              Confirm Delete
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default function SuppliersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">

          <Skeleton className="h-12 w-64" />

          <Skeleton className="h-16 w-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>

        </div>
      }
    >
      <SuppliersPageContent />
    </Suspense>
  )
}