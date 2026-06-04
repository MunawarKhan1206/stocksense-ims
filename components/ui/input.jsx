import * as React from 'react'
import { cn } from './button'

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-borderColor bg-white px-4 py-2 text-sm text-textPrimary placeholder-textMuted transition-all',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus:border-brandPrimary focus:outline-none focus:ring-2 focus:ring-brandPrimary/15',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
