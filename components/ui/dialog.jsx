import * as React from 'react'
import { cn } from './button'

const DialogContext = React.createContext({ open: false, setOpen: () => {} })

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ asChild, children, className, ...props }) {
  const { setOpen } = React.useContext(DialogContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e)
        setOpen(true)
      }
    })
  }

  return (
    <button type="button" onClick={() => setOpen(true)} className={className} {...props}>
      {children}
    </button>
  )
}

export function DialogContent({ children, className }) {
  const { open, setOpen } = React.useContext(DialogContext)

  React.useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = 'unset' }
    return () => { document.body.style.overflow = 'unset' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm p-0 md:items-center md:p-4 animate-fade-in-up">
      <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'w-full max-h-[90vh] overflow-y-auto border border-borderColor bg-white p-6 shadow-card-hover transition-all duration-200',
          'rounded-t-2xl md:rounded-2xl md:max-w-lg',
          className
        )}
      >
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-textMuted hover:bg-gray-100 hover:text-textPrimary transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 text-left mb-5', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-xl font-bold tracking-tight text-textPrimary', className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-textSecondary', className)} {...props} />
}
