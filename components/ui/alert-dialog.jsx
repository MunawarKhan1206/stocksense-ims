import * as React from 'react'
import { cn } from './button'

const AlertDialogContext = React.createContext({ open: false, setOpen: () => {} })

export function AlertDialog({ open, onOpenChange, children }) {
  return (
    <AlertDialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogTrigger({ asChild, children, className, ...props }) {
  const { setOpen } = React.useContext(AlertDialogContext)

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

export function AlertDialogContent({ children, className }) {
  const { open, setOpen } = React.useContext(AlertDialogContext)

  React.useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = 'unset' }
    return () => { document.body.style.overflow = 'unset' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm p-0 md:items-center md:p-4">
      <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'w-full max-h-[90vh] overflow-y-auto border border-borderColor bg-white p-6 shadow-card-hover',
          'rounded-t-2xl md:rounded-2xl md:max-w-md',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-2 text-left mb-5', className)} {...props} />
}

export function AlertDialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2', className)} {...props} />
}

export function AlertDialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-bold tracking-tight text-textPrimary', className)} {...props} />
}

export function AlertDialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-textSecondary', className)} {...props} />
}

export function AlertDialogAction({ className, onClick, ...props }) {
  const { setOpen } = React.useContext(AlertDialogContext)
  return (
    <button
      type="button"
      onClick={(e) => { if (onClick) onClick(e); setOpen(false) }}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl bg-brandDanger px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all',
        className
      )}
      {...props}
    />
  )
}

export function AlertDialogCancel({ className, onClick, ...props }) {
  const { setOpen } = React.useContext(AlertDialogContext)
  return (
    <button
      type="button"
      onClick={(e) => { if (onClick) onClick(e); setOpen(false) }}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl border border-borderColor bg-white px-4 py-2 text-sm font-semibold text-textSecondary hover:bg-gray-50 hover:text-textPrimary active:scale-[0.98] transition-all',
        className
      )}
      {...props}
    />
  )
}
