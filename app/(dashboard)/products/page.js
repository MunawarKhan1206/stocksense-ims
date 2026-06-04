'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Package,
  Search,
  Plus,
  SlidersHorizontal
} from 'lucide-react'

import { toast } from 'sonner'

import ProductsTable from '@/components/products/ProductsTable'
import AddProductModal from '@/components/products/AddProductModal'
import EditProductModal from '@/components/products/EditProductModal'

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

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role || 'staff'
  const canAdd = ['super-admin', 'admin', 'inventory-staff'].includes(role)

  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch products + suppliers
  const fetchData = async () => {
    setLoading(true)

    try {
      const [prodRes, suppRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }).then((res) => res.json()),
        fetch('/api/suppliers', { cache: 'no-store' }).then((res) => res.json())
      ])

      const prodData = prodRes.data || prodRes
      const suppData = suppRes.data || suppRes

      setProducts(Array.isArray(prodData) ? prodData : [])
      setSuppliers(Array.isArray(suppData) ? suppData : [])
    } catch (error) {
      console.error('Failed to load products:', error)
      toast.error('Failed to connect to database API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle URL actions
  useEffect(() => {
    const openAdd = searchParams.get('openAdd')
    const editId = searchParams.get('editId')

    if (openAdd === 'true') {
      setIsAddOpen(true)
      router.replace('/products')
    }

    if (editId && products.length > 0) {
      const prod = products.find((p) => p._id === editId)

      if (prod) {
        setSelectedProduct(prod)
        setIsEditOpen(true)
      }

      router.replace('/products')
    }
  }, [searchParams, products, router])

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === 'All' ||
      prod.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Edit product
  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setIsEditOpen(true)
  }

  // Delete product
  const handleDeleteClick = (product) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  // Confirm delete
  const executeDelete = async () => {
    if (!selectedProduct?._id) return

    try {
      const res = await fetch(
        `/api/products/${selectedProduct._id}`,
        {
          method: 'DELETE'
        }
      )

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete product')
      }

      toast.success('Product deleted successfully')

      setSelectedProduct(null)
      setIsDeleteOpen(false)

      fetchData()
    } catch (err) {
      console.error(err)

      toast.error(err.message || 'Cannot delete item.')

      setIsDeleteOpen(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight leading-none">
            Catalog Inventory
          </h1>

          <p className="text-sm md:text-base text-textSecondary mt-1">
            Manage stock catalog lines, prices, warnings and supplier references.
          </p>
        </div>

        {canAdd && (
          <Button
            onClick={() => setIsAddOpen(true)}
            variant="default"
            className="btn-primary-glow text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            <span>Add New Product</span>
          </Button>
        )}

      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-borderColor rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Search */}
        <div className="relative w-full md:max-w-xs">

          <Search className="absolute left-3 top-3 w-4 h-4 text-textMuted" />

          <Input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />

        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">

          <SlidersHorizontal className="w-4 h-4 text-textMuted shrink-0" />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="
              h-10
              w-full
              md:w-48
              rounded-md
              border
              border-borderColor
              bg-white
              px-3
              text-xs
              outline-none
              focus:ring-2
              focus:ring-primary
            "
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food & Beverages">
              Food & Beverages
            </option>
            <option value="Stationery">Stationery</option>
            <option value="Hardware">Hardware</option>
            <option value="Other">Other</option>
          </select>

        </div>

      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white border border-borderColor rounded-xl p-6 space-y-3">

          <Skeleton className="h-10 w-full" />

          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-11 w-full"
            />
          ))}

        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            searchTerm || categoryFilter !== 'All'
              ? 'No search results found'
              : 'No products in catalog yet'
          }
          description={
            searchTerm || categoryFilter !== 'All'
              ? 'Try adjusting your search queries or category filters.'
              : 'Add your first product to start building your inventory catalog.'
          }
          ctaLabel={
            searchTerm || categoryFilter !== 'All'
              ? null
              : 'Add Product'
          }
          ctaAction={
            searchTerm || categoryFilter !== 'All'
              ? null
              : () => setIsAddOpen(true)
          }
        />
      ) : (
        <div className="bg-white border border-borderColor rounded-xl p-4 md:p-6 overflow-hidden">

          <ProductsTable
            products={filteredProducts}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />

        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        suppliers={suppliers}
        onSuccess={fetchData}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        suppliers={suppliers}
        onSuccess={fetchData}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle className="text-brandDanger">
              Delete Catalog Product
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-textPrimary font-bold">
                {selectedProduct?.name}
              </strong>
              ?
              This action will permanently remove this
              product and related stock history logs.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedProduct(null)
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">

          <Skeleton className="h-12 w-64" />

          <Skeleton className="h-16 w-full" />

          <Skeleton className="h-96 w-full" />

        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  )
}