'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'

import { useSession } from 'next-auth/react'

import {
  useSearchParams,
  useRouter,
} from 'next/navigation'

import {
  ShoppingCart,
  Plus,
  Calendar,
  RefreshCw,
} from 'lucide-react'

import { toast } from 'sonner'

import SalesTable from '@/components/sales/SalesTable'
import AddSaleModal from '@/components/sales/AddSaleModal'

import { EmptyState } from '@/components/ui/EmptyState'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Skeleton } from '@/components/ui/skeleton'

// ======================================================
// SALES PAGE CONTENT
// ======================================================
function SalesPageContent() {
  const searchParams = useSearchParams()

  const router = useRouter()

  const { data: session } = useSession()

  // ======================================================
  // ROLE PERMISSIONS
  // ======================================================
  const role = session?.user?.role || 'staff'

  const canRecordSale = [
    'super-admin',
    'admin',
    'sales-staff',
  ].includes(role)

  // ======================================================
  // STATE
  // ======================================================
  const [sales, setSales] = useState([])

  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [dateFrom, setDateFrom] = useState('')

  const [dateTo, setDateTo] = useState('')

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false)

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      let salesUrl = '/api/sales'

      const queryParams = []

      if (dateFrom) {
        queryParams.push(
          `from=${encodeURIComponent(dateFrom)}`
        )
      }

      if (dateTo) {
        queryParams.push(
          `to=${encodeURIComponent(dateTo)}`
        )
      }

      if (queryParams.length > 0) {
        salesUrl += `?${queryParams.join('&')}`
      }

      // Parallel API calls
      const [salesRes, productsRes] = await Promise.all([
        fetch(salesUrl, { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' }),
      ])

      // Redirect if forbidden
      if (salesRes.status === 403 || productsRes.status === 403) {
        router.replace('/forbidden')
        return
      }

      // Handle HTTP errors
      if (!salesRes.ok) {
        throw new Error('Failed to fetch sales')
      }

      if (!productsRes.ok) {
        throw new Error('Failed to fetch products')
      }

      const salesJson = await salesRes.json()

      const productsJson = await productsRes.json()

      const salesData =
        salesJson?.data || salesJson || []

      const productsData =
        productsJson?.data || productsJson || []

      setSales(
        Array.isArray(salesData) ? salesData : []
      )

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      )
    } catch (error) {
      console.error(error)

      toast.error(
        error?.message ||
          'Failed to load sales data'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [dateFrom, dateTo])

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ======================================================
  // OPEN MODAL FROM QUERY PARAM
  // ======================================================
  useEffect(() => {
    const openAdd =
      searchParams.get('openAdd')

    if (openAdd === 'true') {
      setIsAddOpen(true)

      router.replace('/sales')
    }
  }, [searchParams, router])

  // ======================================================
  // REFRESH DATA
  // ======================================================
  const handleRefresh = async () => {
    setRefreshing(true)

    await fetchData()

    toast.success('Sales refreshed')
  }

  // ======================================================
  // CLEAR FILTERS
  // ======================================================
  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  // ======================================================
  // PAGE UI
  // ======================================================
  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight">
            Sales Ledger
          </h1>

          <p className="text-sm md:text-base text-textSecondary mt-1">
            Monitor invoices, revenue, payment methods and profits.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </Button>

          {/* Add Sale */}
          {canRecordSale && (
            <Button
              onClick={() => setIsAddOpen(true)}
              className="btn-primary-glow text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />

              Record Sale
            </Button>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* FILTERS */}
      {/* ================================================== */}
      <div className="bg-white border border-borderColor rounded-xl p-4">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Left */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-textMuted" />

              <span className="text-xs font-medium text-textSecondary">
                Filter by date
              </span>
            </div>

            <div className="flex items-center gap-2">

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) =>
                  setDateFrom(e.target.value)
                }
                className="h-9 text-xs"
              />

              <span className="text-xs text-textMuted">
                to
              </span>

              <Input
                type="date"
                value={dateTo}
                onChange={(e) =>
                  setDateTo(e.target.value)
                }
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Right */}
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* CONTENT */}
      {/* ================================================== */}
      {loading ? (
        <div className="bg-white border border-borderColor rounded-xl p-6 space-y-4">

          <Skeleton className="h-10 w-full" />

          {[...Array(6)].map((_, index) => (
            <Skeleton
              key={index}
              className="h-12 w-full"
            />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={
            dateFrom || dateTo
              ? 'No sales found'
              : 'No sales recorded yet'
          }
          description={
            dateFrom || dateTo
              ? 'Try adjusting or clearing your date filters.'
              : 'Record your first sale to begin tracking revenue and inventory.'
          }
          ctaLabel={
            !dateFrom &&
            !dateTo &&
            canRecordSale
              ? 'Record Sale'
              : null
          }
          ctaAction={
            !dateFrom &&
            !dateTo &&
            canRecordSale
              ? () => setIsAddOpen(true)
              : null
          }
        />
      ) : (
        <div className="bg-white border border-borderColor rounded-xl overflow-hidden">

          <div className="p-4 border-b border-borderColor flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold text-textPrimary">
                Transactions
              </h2>

              <p className="text-xs text-textSecondary mt-1">
                {sales.length} sale
                {sales.length !== 1
                  ? 's'
                  : ''}{' '}
                found
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <SalesTable sales={sales} />
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* ADD SALE MODAL */}
      {/* ================================================== */}
      <AddSaleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        products={products}
        onSuccess={fetchData}
      />
    </div>
  )
}

// ======================================================
// PAGE EXPORT
// ======================================================
export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">

          <Skeleton className="h-12 w-64" />

          <Skeleton className="h-16 w-full" />

          <Skeleton className="h-[500px] w-full" />
        </div>
      }
    >
      <SalesPageContent />
    </Suspense>
  )
}