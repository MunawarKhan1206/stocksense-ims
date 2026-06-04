import * as React from 'react'
import { cn } from './button'

const DropdownMenuContext = React.createContext({ open: false, setOpen: () => {} })

export function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left" ref={containerRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ asChild, children }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e)
        setOpen(!open)
      }
    })
  }

  return (
    <button type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, className, align = 'right' }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  if (!open) return null

  const alignment = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div
      className={cn(
        'absolute z-50 mt-1.5 w-52 rounded-xl border border-borderColor bg-white p-1 shadow-card-hover origin-top-right animate-fade-in-up',
        alignment,
        className
      )}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ className, children, onClick, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2 text-sm text-textSecondary hover:bg-gray-50 hover:text-textPrimary transition-colors text-left font-medium',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLabel({ className, ...props }) {
  return <div className={cn('px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-textMuted', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('my-1 h-px bg-borderColor', className)} {...props} />
}
