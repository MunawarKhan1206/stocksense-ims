'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart2 } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role || 'staff'

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super-admin', 'admin', 'inventory-staff', 'sales-staff', 'viewer'] },
    { name: 'Products',  href: '/products',  icon: Package, roles: ['super-admin', 'admin', 'inventory-staff', 'sales-staff', 'viewer'] },
    { name: 'Sales',     href: '/sales',     icon: ShoppingCart, roles: ['super-admin', 'admin', 'sales-staff', 'viewer'] },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['super-admin', 'admin', 'viewer'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart2, roles: ['super-admin', 'admin', 'viewer'] },
  ].filter(item => item.roles.includes(role))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-borderColor/50 bg-white/80 backdrop-blur-md flex items-center justify-around z-40 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 relative group`}
          >
            <div className={`flex flex-col items-center justify-center transition-transform duration-200 ${isActive ? 'scale-105' : 'hover:scale-105'}`}>
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brandPrimary/10 text-brandPrimary' 
                  : 'text-textMuted group-hover:text-textSecondary hover:bg-gray-100/50'
              }`}>
                <Icon className="w-5 h-5 transition-transform duration-200" />
              </div>
              <span className={`text-[9px] mt-0.5 font-bold transition-all duration-200 ${isActive ? 'text-brandPrimary opacity-100' : 'text-textMuted opacity-0 h-0 overflow-hidden'}`}>
                {item.name}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
