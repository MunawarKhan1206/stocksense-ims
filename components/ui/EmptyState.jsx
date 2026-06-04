import React from 'react'
import { Button } from './button'

function EmptyState({ icon: IconComponent, title, description, ctaLabel, ctaAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-white border border-borderColor rounded-2xl p-8 md:p-12 max-w-lg mx-auto my-12 shadow-card">
      {/* Icon Container */}
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 text-brandPrimary">
        {IconComponent && <IconComponent className="w-7 h-7" />}
      </div>
      
      {/* Headings */}
      <h3 className="text-base font-bold text-textPrimary mb-2">{title}</h3>
      <p className="text-textSecondary text-sm mb-6 max-w-xs leading-relaxed">{description}</p>
      
      {/* Action CTA */}
      {ctaLabel && ctaAction && (
        <Button onClick={ctaAction} variant="default" className="btn-primary-glow">
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
