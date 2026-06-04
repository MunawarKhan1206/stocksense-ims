'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect, createContext, useContext, Suspense } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import CommandBar from './CommandBar'

export const CommandBarContext = createContext(null)
export const useCommandBar = () => useContext(CommandBarContext)

function AppShellInner({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)

  // Fetch profile details from database securely
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/users/me')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setProfile(data)
        })
        .catch((err) => console.error('Failed to load profile:', err))
    }
  }, [status])

  // Keyboard shortcuts
  useEffect(() => {
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
  }, [])

  useEffect(() => { setIsSidebarOpen(false) }, [pathname])

  useEffect(() => {
    if (isSidebarOpen || isCommandBarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isSidebarOpen, isCommandBarOpen])

  // ── LOADING — branded splash ──
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

  // ── AUTHENTICATED — full dashboard shell ──
  return (
    <CommandBarContext.Provider value={{ open: () => setIsCommandBarOpen(true) }}>
      <div className="h-screen w-full flex bg-surfaceBg text-textPrimary antialiased overflow-hidden">

        <CommandBar isOpen={isCommandBarOpen} setIsOpen={setIsCommandBarOpen} />

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-[240px] shrink-0 sticky top-0 h-screen">
          <Sidebar profile={profile} />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[240px] md:hidden shadow-2xl">
              <Sidebar onClose={() => setIsSidebarOpen(false)} profile={profile} />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenCommandBar={() => setIsCommandBarOpen(true)}
            profile={profile}
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

export default function AppShell({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-surfaceBg">
        <div className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center shadow-brand animate-pulse">
          <span className="text-white text-3xl font-black">S</span>
        </div>
      </div>
    }>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  )
}
