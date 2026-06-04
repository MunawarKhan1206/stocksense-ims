'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Menu, Search, Bell, AlertTriangle, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function TopBar({ onOpenSidebar, onOpenCommandBar, profile }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const user = profile || {
    name: session?.user?.email ? session.user.email.split('@')[0] : 'User',
    image: null
  }
  const [notifications, setNotifications] = useState([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationRef = useRef(null)

  const [orgs, setOrgs] = useState([])
  const [selectedOrg, setSelectedOrg] = useState('all')

  const isSuperAdmin = session?.user?.role === 'super-admin'

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard'
      case '/products':  return 'Inventory Products'
      case '/sales':     return 'Sales Ledger'
      case '/suppliers': return 'Suppliers Directory'
      case '/analytics': return 'Analytics & Reports'
      default:           return 'StockSense IMS'
    }
  }

  useEffect(() => {
    if (!isSuperAdmin) return
    const fetchOrgs = async () => {
      try {
        const res = await fetch('/api/organizations')
        if (res.ok) {
          const data = await res.json()
          setOrgs(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load organizations:', err)
      }
    }
    fetchOrgs()
    setSelectedOrg(localStorage.getItem('selectedOrgId') || 'all')
  }, [isSuperAdmin])

  const handleOrgChange = (e) => {
    const val = e.target.value
    setSelectedOrg(val)
    if (val === 'all') {
      localStorage.removeItem('selectedOrgId')
    } else {
      localStorage.setItem('selectedOrgId', val)
    }
    window.location.reload()
  }

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts/low-stock')
        if (res.ok) {
          const data = await res.json()
          setNotifications(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  }

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-borderColor bg-white/90 backdrop-blur-md flex items-center justify-between px-4 md:px-6">

      {/* Left: Hamburger + Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 text-textMuted hover:text-textPrimary hover:bg-gray-100 rounded-lg transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold tracking-tight text-textPrimary">
          {getPageTitle()}
        </h2>
        {isSuperAdmin && (
          <>
            <span className="text-textMuted">/</span>
            <select
              value={selectedOrg}
              onChange={handleOrgChange}
              className="h-8 text-xs font-semibold rounded-lg border border-borderColor bg-gray-50 text-textPrimary px-2 focus:ring-1 focus:ring-brandPrimary focus:outline-none"
            >
              <option value="all">🌐 All Stores</option>
              {orgs.map((org) => (
                <option key={org._id} value={org._id}>
                  🏢 {org.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Center: Search */}
      <div className="hidden sm:block max-w-sm w-full mx-4">
        <button
          onClick={onOpenCommandBar}
          className="w-full flex items-center justify-between h-9 px-3 rounded-xl border border-borderColor bg-gray-50 hover:bg-gray-100 text-sm text-textMuted hover:text-textSecondary transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search anything...</span>
          </div>
          <kbd className="hidden md:inline-flex h-4 select-none items-center gap-1 rounded border border-borderColor bg-white px-1.5 font-mono text-[9px] font-medium text-textMuted">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Notification + Avatar */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Mobile Search */}
        <button
          onClick={onOpenCommandBar}
          className="sm:hidden p-2 text-textMuted hover:text-textPrimary hover:bg-gray-100 rounded-lg transition-all"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`p-2 rounded-lg transition-all relative ${
              isNotificationOpen ? 'bg-gray-100 text-textPrimary' : 'text-textMuted hover:text-textPrimary hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brandPrimary text-white text-[8px] font-black rounded-full flex items-center justify-center pulse-red-dot">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-borderColor bg-white shadow-card-hover p-1.5 overflow-hidden z-50 animate-fade-in-up">
              <div className="px-4 py-2.5 border-b border-borderColor flex items-center justify-between">
                <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">Low Stock Alerts</span>
                {notifications.length > 0 && (
                  <Badge variant="danger" className="text-[10px] py-0 px-2">
                    {notifications.length} items
                  </Badge>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-textMuted">
                    ✅ No low-stock alerts. All good!
                  </div>
                ) : (
                  notifications.map((prod) => (
                    <div
                      key={prod._id}
                      className="px-4 py-2.5 hover:bg-gray-50 flex items-start space-x-3 rounded-xl border-b border-borderColor last:border-0 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-brandDanger shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-textPrimary truncate">{prod.name}</p>
                        <p className="text-[10px] text-textMuted mt-0.5">
                          SKU: <span className="font-mono">{prod.sku}</span> • Stock: <span className="text-brandDanger font-bold">{prod.stock}</span>/{prod.threshold}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Avatar className="w-8 h-8 border border-borderColor select-none cursor-pointer">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-gradient-coral text-white text-xs font-bold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>

    </header>
  )
}
