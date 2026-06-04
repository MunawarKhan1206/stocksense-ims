import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const base = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brandPrimary/30 disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    default:   'bg-gradient-coral text-white shadow-brand hover:shadow-[0_6px_20px_rgba(255,77,109,0.4)] hover:scale-[1.01]',
    secondary: 'bg-white border border-borderColor text-textPrimary hover:bg-gray-50 hover:border-gray-300',
    success:   'bg-brandSuccess text-white shadow-sm hover:opacity-90',
    danger:    'bg-brandDanger text-white shadow-sm hover:opacity-90',
    outline:   'border border-borderColor bg-transparent hover:bg-gray-50 text-textPrimary',
    ghost:     'bg-transparent hover:bg-gray-100 text-textSecondary hover:text-textPrimary',
    link:      'text-brandPrimary underline-offset-4 hover:underline bg-transparent p-0 h-auto font-normal',
  }

  const sizes = {
    default: 'h-10 px-5 py-2',
    sm:      'h-8 rounded-lg px-3 py-1.5 text-xs',
    lg:      'h-11 rounded-xl px-8',
    icon:    'h-9 w-9 rounded-xl',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button }
