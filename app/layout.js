import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import ClientProviders from '@/components/providers/ClientProviders'
import AppShell from '@/components/layout/AppShell'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

export const metadata = {
  title: 'StockSense IMS — Intelligent Inventory OS',
  description:
    'Real-time inventory management, sales tracking, and business analytics for modern SMEs.',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full ${jakarta.variable}`}>
      <body className="h-full overflow-hidden bg-brandBg antialiased font-sans">
        <ClientProviders>
          <AppShell>
            {children}
          </AppShell>
        </ClientProviders>
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
