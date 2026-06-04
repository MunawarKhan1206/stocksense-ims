'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart2, Mail, LogOut, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Sidebar({ onClose, profile }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const role = session?.user?.role || 'staff'
  const user = profile || {
    name: session?.user?.email ? session.user.email.split('@')[0] : 'User',
    email: session?.user?.email || '',
    role
  }

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super-admin', 'admin', 'inventory-staff', 'sales-staff', 'viewer'] },
    { name: 'Products',  href: '/products',  icon: Package,          roles: ['super-admin', 'admin', 'inventory-staff', 'sales-staff', 'viewer'] },
    { name: 'Sales',     href: '/sales',     icon: ShoppingCart,     roles: ['super-admin', 'admin', 'sales-staff', 'viewer'] },
    { name: 'Suppliers', href: '/suppliers', icon: Truck,            roles: ['super-admin', 'admin', 'viewer'] },
  ].filter(item => item.roles.includes(role))

  const reportNav = [
    { name: 'Analytics',  href: '/analytics',            icon: BarChart2, roles: ['super-admin', 'admin', 'viewer'] },
    { name: 'Email Logs', href: '/analytics/email-logs', icon: Mail,      roles: ['super-admin', 'admin'] },
  ].filter(item => item.roles.includes(role))

  const getInitials = (name) => {
    if (!name) return 'SS'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  }

  const NavLink = ({ item }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-150 group relative ${
          isActive
            ? 'bg-brandPrimary/8 text-brandPrimary border-l-[3px] border-brandPrimary rounded-l-none font-semibold'
            : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
          isActive ? 'text-brandPrimary' : 'text-textMuted group-hover:text-textPrimary'
        }`} />
        <span className="text-sm font-medium truncate">{item.name}</span>
      </Link>
    )
  }

  return (
    <div className="w-[240px] h-full bg-white border-r border-borderColor flex flex-col justify-between z-50">

      {/* Top Section */}
      <div className="flex flex-col min-h-0">

        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between flex-shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2.5 select-none min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-coral flex items-center justify-center shadow-brand flex-shrink-0">
              <span className="text-white text-lg font-black">S</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-textPrimary font-bold tracking-tight text-sm leading-tight truncate">StockSense IMS</span>
              <span className="text-[10px] text-textMuted font-mono leading-none">IMS v1.0</span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-textMuted hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav — scrollable on very small screens */}
        <div className="px-3 py-2 space-y-5 overflow-y-auto flex-1">
          {mainNav.length > 0 && (
            <div>
              <p className="px-4 text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5">Main</p>
              <nav className="space-y-0.5">
                {mainNav.map((item) => <NavLink key={item.name} item={item} />)}
              </nav>
            </div>
          )}
          {reportNav.length > 0 && (
            <div>
              <p className="px-4 text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1.5">Reports</p>
              <nav className="space-y-0.5">
                {reportNav.map((item) => <NavLink key={item.name} item={item} />)}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-borderColor flex-shrink-0">
        <div className="flex items-center justify-between px-1 py-1.5 gap-2">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <Avatar className="w-8 h-8 border border-borderColor shrink-0">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="bg-gradient-coral text-white text-xs font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-textPrimary truncate leading-tight">{user.name}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                user.role === 'super-admin' ? 'text-purple-600'
                : user.role === 'admin' ? 'text-brandPrimary'
                : 'text-textSecondary'
              }`}>
                {user.role === 'admin' ? 'Store Manager'
                  : user.role === 'super-admin' ? 'Super Admin'
                  : user.role?.replace('-', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-textMuted hover:text-brandPrimary hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  )
}