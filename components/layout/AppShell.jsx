'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect, createContext, useContext } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import CommandBar from './CommandBar'

export const CommandBarContext = createContext(null)
export const useCommandBar = () => useContext(CommandBarContext)

const PUBLIC_ROUTES = ['/login']


export default function AppShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Redirect immediately when unauthenticated on protected routes
  useEffect(() => {
    if (status === 'unauthenticated' && !isPublicRoute) {
      router.push('/login')
    }
  }, [status, isPublicRoute, router])

  useEffect(() => {
    if (isPublicRoute) return
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandBarOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsSidebarOpen(false)
        setIsCommandBarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPublicRoute])

  useEffect(() => { setIsSidebarOpen(false) }, [pathname])

  useEffect(() => {
    if (isSidebarOpen || isCommandBarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isSidebarOpen, isCommandBarOpen])

  if (isPublicRoute) {
    return <main className="min-h-screen bg-surfaceBg">{children}</main>
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surfaceBg">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-brandPrimary/20 blur-xl scale-150 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center shadow-brand">
              <span className="text-white text-3xl font-black tracking-tight">S</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-bold tracking-tight text-textPrimary">StockSense IMS</h1>
            <p className="text-textMuted text-xs font-medium tracking-widest uppercase">
              Loading workspace
            </p>
          </div>
          <div className="w-40 h-[3px] bg-borderColor rounded-full overflow-hidden">
            <div className="h-full bg-gradient-coral rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surfaceBg">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-brandDanger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-textPrimary font-medium">Session expired</p>
          <p className="text-textMuted text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <CommandBarContext.Provider value={{ open: () => setIsCommandBarOpen(true) }}>
      <div className="h-screen w-full flex bg-surfaceBg text-textPrimary antialiased overflow-hidden">

        <CommandBar isOpen={isCommandBarOpen} setIsOpen={setIsCommandBarOpen} />

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-[240px] shrink-0 sticky top-0 h-screen">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[240px] md:hidden shadow-2xl">
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenCommandBar={() => setIsCommandBarOpen(true)}
          />
          <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="p-4 md:p-6 lg:p-8 pb-28 md:pb-8 min-h-full">
              {children}
            </div>
          </main>
        </div>

        <MobileNav />
      </div>
    </CommandBarContext.Provider>
  )
}
