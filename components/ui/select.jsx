import * as React from 'react'
import { cn } from './button'

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          'flex h-10 w-full rounded-xl border border-borderColor bg-white px-4 py-2 pr-10 text-sm text-textPrimary appearance-none transition-all',
          'focus:border-brandPrimary focus:outline-none focus:ring-2 focus:ring-brandPrimary/15',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 cursor-pointer',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-textMuted">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  )
})
Select.displayName = 'Select'

export { Select }
