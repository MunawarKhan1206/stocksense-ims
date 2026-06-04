'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export default function ClientProviders({ children }) {
  useEffect(() => {
    // Intercept global fetch to inject active x-organization-id header (for Super Admins)
    const originalFetch = window.fetch
    window.fetch = async function (url, options = {}) {
      const selectedOrgId = localStorage.getItem('selectedOrgId')
      if (selectedOrgId) {
        options.headers = {
          ...options.headers,
          'x-organization-id': selectedOrgId,
        }
      }
      return originalFetch(url, options)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
