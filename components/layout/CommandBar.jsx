'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Package, ShoppingCart, Truck, Plus, ArrowRight, LayoutDashboard, BarChart2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function CommandBar({ isOpen, setIsOpen }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, salesRes, suppRes] = await Promise.all([
          fetch('/api/products').then((res) => res.json()),
          fetch('/api/sales').then((res) => res.json()),
          fetch('/api/suppliers').then((res) => res.json()),
        ])
        setProducts(Array.isArray(prodRes) ? prodRes : [])
        setSales(Array.isArray(salesRes?.data) ? salesRes.data : Array.isArray(salesRes) ? salesRes : [])
        setSuppliers(Array.isArray(suppRes) ? suppRes : [])
      } catch (err) {
        console.error('Error fetching command bar data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isOpen])

  const handleNavigate = useCallback((path) => {
    router.push(path)
    setIsOpen(false)
  }, [router, setIsOpen])

  // Predefined lists
  const navigationItems = useMemo(() => [
    { id: 'nav-dashboard', category: 'Navigation', title: 'Go to Dashboard', action: () => handleNavigate('/dashboard'), icon: LayoutDashboard },
    { id: 'nav-products',  category: 'Navigation', title: 'Go to Products',  action: () => handleNavigate('/products'),  icon: Package },
    { id: 'nav-sales',     category: 'Navigation', title: 'Go to Sales',     action: () => handleNavigate('/sales'),     icon: ShoppingCart },
    { id: 'nav-suppliers', category: 'Navigation', title: 'Go to Suppliers', action: () => handleNavigate('/suppliers'), icon: Truck },
    { id: 'nav-analytics', category: 'Navigation', title: 'Go to Analytics', action: () => handleNavigate('/analytics'), icon: BarChart2 },
  ], [handleNavigate])

  const quickActions = useMemo(() => [
    { id: 'act-add-product',  category: 'Quick Actions', title: 'Add Product',  action: () => { router.push('/products?openAdd=true');  setIsOpen(false) }, shortcut: '⌥P', icon: Plus },
    { id: 'act-record-sale',  category: 'Quick Actions', title: 'Record Sale',  action: () => { router.push('/sales?openAdd=true');     setIsOpen(false) }, shortcut: '⌥S', icon: Plus },
    { id: 'act-add-supplier', category: 'Quick Actions', title: 'Add Supplier', action: () => { router.push('/suppliers?openAdd=true'); setIsOpen(false) }, shortcut: '⌥V', icon: Plus },
  ], [router, setIsOpen])

  // Filter based on query
  const filteredNav = useMemo(() => query 
    ? navigationItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    : navigationItems, [query, navigationItems])

  const filteredActions = useMemo(() => query
    ? quickActions.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    : quickActions, [query, quickActions])

  const filteredProducts = useMemo(() => query 
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())) 
    : products.slice(0, 3), [query, products])

  const filteredSales = useMemo(() => query 
    ? sales.filter((s) => s.invoiceNo.toLowerCase().includes(query.toLowerCase())) 
    : sales.slice(0, 3), [query, sales])

  const filteredSuppliers = useMemo(() => query 
    ? suppliers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.company?.toLowerCase().includes(query.toLowerCase())) 
    : suppliers.slice(0, 3), [query, suppliers])

  // Construct flat list with indices for keyboard navigation
  const {
    selectableItems,
    navWithIndex,
    actionsWithIndex,
    productsWithIndex,
    salesWithIndex,
    suppliersWithIndex
  } = useMemo(() => {
    let currentIndex = 0
    const navWithIndex = filteredNav.map(item => ({ ...item, globalIndex: currentIndex++ }))
    const actionsWithIndex = filteredActions.map(item => ({ ...item, globalIndex: currentIndex++ }))
    const productsWithIndex = filteredProducts.map(p => ({
      id: p._id,
      title: p.name,
      subtitle: p.sku,
      badge: `${p.stock} units`,
      badgeType: p.stock <= p.threshold ? 'danger' : 'success',
      icon: Package,
      action: () => handleNavigate('/products'),
      globalIndex: currentIndex++
    }))
    const salesWithIndex = filteredSales.map(s => ({
      id: s._id,
      title: s.invoiceNo,
      subtitle: `by ${s.recordedBy?.name || 'Admin'}`,
      badge: `Rs. ${s.totalAmount?.toLocaleString()}`,
      badgeType: 'success-text',
      icon: ShoppingCart,
      action: () => handleNavigate('/sales'),
      globalIndex: currentIndex++
    }))
    const suppliersWithIndex = filteredSuppliers.map(s => ({
      id: s._id,
      title: s.name,
      subtitle: s.company ? `(${s.company})` : '',
      icon: Truck,
      action: () => handleNavigate('/suppliers'),
      globalIndex: currentIndex++
    }))

    const items = [
      ...navWithIndex,
      ...actionsWithIndex,
      ...productsWithIndex,
      ...salesWithIndex,
      ...suppliersWithIndex
    ]

    return {
      selectableItems: items,
      navWithIndex,
      actionsWithIndex,
      productsWithIndex,
      salesWithIndex,
      suppliersWithIndex
    }
  }, [filteredNav, filteredActions, filteredProducts, filteredSales, filteredSuppliers, handleNavigate])

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, isOpen])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (selectableItems.length ? (prev + 1) % selectableItems.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (selectableItems.length ? (prev - 1 + selectableItems.length) % selectableItems.length : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = selectableItems[selectedIndex]
        if (selected) {
          selected.action()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, selectableItems, setIsOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-black/25 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <div className="w-full max-w-xl border border-borderColor bg-white rounded-2xl shadow-card-hover overflow-hidden relative z-10 flex flex-col max-h-[65vh] animate-fade-in-up">
        {/* Input */}
        <div className="flex items-center px-4 border-b border-borderColor h-12 bg-gray-50">
          <Search className="w-4.5 h-4.5 text-textMuted shrink-0 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent border-0 outline-none text-textPrimary placeholder-textMuted text-sm focus:ring-0"
            placeholder="Search products, invoices, suppliers, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center rounded border border-borderColor bg-white px-1.5 font-mono text-[9px] font-medium text-textMuted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-brandPrimary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectableItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-textMuted">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {navWithIndex.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5 px-2 mt-4 first:mt-0">Navigation</div>
                  {navWithIndex.map((item) => {
                    const Icon = item.icon
                    const isSelected = item.globalIndex === selectedIndex
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border-l-2 cursor-pointer transition-all group ${
                          isSelected 
                            ? 'bg-brandPrimary/5 border-brandPrimary' 
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4 text-textSecondary shrink-0" />
                          <span className="text-sm font-medium text-textPrimary">{item.title}</span>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 text-textMuted transition-opacity ${item.globalIndex === selectedIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      </div>
                    )
                  })}
                </div>
              )}

              {actionsWithIndex.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5 px-2 mt-4 first:mt-0">Quick Actions</div>
                  {actionsWithIndex.map((action) => {
                    const Icon = action.icon
                    const isSelected = action.globalIndex === selectedIndex
                    return (
                      <div
                        key={action.id}
                        onClick={action.action}
                        onMouseEnter={() => setSelectedIndex(action.globalIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border-l-2 cursor-pointer transition-all group ${
                          isSelected 
                            ? 'bg-brandPrimary/5 border-brandPrimary' 
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4 text-brandPrimary shrink-0" />
                          <span className="text-sm font-medium text-textPrimary">{action.title}</span>
                        </div>
                        <kbd className="inline-flex h-4.5 select-none items-center rounded border border-borderColor bg-gray-50 px-1.5 font-mono text-[9px] font-medium text-textMuted">
                          {action.shortcut}
                        </kbd>
                      </div>
                    )
                  })}
                </div>
              )}

              {productsWithIndex.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5 px-2 mt-4 first:mt-0">Products</div>
                  {productsWithIndex.map((p) => {
                    const isSelected = p.globalIndex === selectedIndex
                    return (
                      <div
                        key={p.id}
                        onClick={p.action}
                        onMouseEnter={() => setSelectedIndex(p.globalIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border-l-2 cursor-pointer transition-all group ${
                          isSelected 
                            ? 'bg-brandPrimary/5 border-brandPrimary' 
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="w-4 h-4 text-brandSecondary shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-textPrimary">{p.title}</span>
                            <span className="text-xs text-textMuted ml-2 font-mono">{p.subtitle}</span>
                          </div>
                        </div>
                        <Badge variant={p.badgeType} className="text-[10px]">
                          {p.badge}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}

              {salesWithIndex.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5 px-2 mt-4 first:mt-0">Sales Invoices</div>
                  {salesWithIndex.map((s) => {
                    const isSelected = s.globalIndex === selectedIndex
                    return (
                      <div
                        key={s.id}
                        onClick={s.action}
                        onMouseEnter={() => setSelectedIndex(s.globalIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border-l-2 cursor-pointer transition-all group ${
                          isSelected 
                            ? 'bg-brandPrimary/5 border-brandPrimary' 
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="w-4 h-4 text-brandPrimary shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-textPrimary">{s.title}</span>
                            <span className="text-xs text-textMuted ml-2">{s.subtitle}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brandSuccess">{s.badge}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {suppliersWithIndex.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5 px-2 mt-4 first:mt-0">Suppliers</div>
                  {suppliersWithIndex.map((s) => {
                    const isSelected = s.globalIndex === selectedIndex
                    return (
                      <div
                        key={s.id}
                        onClick={s.action}
                        onMouseEnter={() => setSelectedIndex(s.globalIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border-l-2 cursor-pointer transition-all group ${
                          isSelected 
                            ? 'bg-brandPrimary/5 border-brandPrimary' 
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Truck className="w-4 h-4 text-brandWarning shrink-0" />
                          <span className="text-sm font-medium text-textPrimary">{s.title}</span>
                          {s.subtitle && <span className="text-xs text-textMuted">{s.subtitle}</span>}
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 text-textMuted transition-opacity ${s.globalIndex === selectedIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-borderColor text-[10px] text-textMuted font-medium select-none shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 border border-borderColor bg-white rounded shadow-sm font-mono text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 border border-borderColor bg-white rounded shadow-sm font-mono text-[9px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 border border-borderColor bg-white rounded shadow-sm font-mono text-[9px]">ESC</kbd> Close
            </span>
          </div>
          <span className="font-mono text-[9px]">StockSense Search</span>
        </div>
      </div>
    </div>
  )
}