import * as React from 'react'
import { cn } from './button'

function Badge({ className, variant = 'default', ...props }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'

  const variants = {
    default:   'bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20',
    secondary: 'bg-gray-100 text-textSecondary border border-borderColor',
    success:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning:   'bg-amber-50 text-amber-700 border border-amber-200',
    danger:    'bg-red-50 text-red-600 border border-red-200',
    outline:   'text-textSecondary border border-borderColor bg-transparent',
  }

  return <div className={cn(base, variants[variant], className)} {...props} />
}

export { Badge }
