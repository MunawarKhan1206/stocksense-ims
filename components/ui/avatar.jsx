import * as React from 'react'
import { cn } from './button'

function Avatar({ className, children, ...props }) {
  return (
    <div 
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-borderColor', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({ src, className, alt = '' }) {
  if (!src) return null
  return (
    <img 
      src={src} 
      alt={alt} 
      className={cn('aspect-square h-full w-full object-cover', className)} 
    />
  )
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <div 
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-gradient-coral font-bold text-white text-sm uppercase', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
