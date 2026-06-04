import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found | StockSense IMS',
}

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brandBg px-6">
      <div className="flex flex-col items-center text-center max-w-md w-full">

        {/* Logo mark */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brandPrimary to-brandSecondary flex items-center justify-center shadow-brand mb-8">
          <span className="text-white text-2xl font-black select-none">S</span>
        </div>

        {/* Error code */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted mb-3">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary mb-4">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-textSecondary text-sm leading-relaxed mb-10 max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Head back to your workspace to continue.
        </p>

        {/* Divider line */}
        <div className="w-12 h-px bg-borderColor mb-10" />

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brandPrimary text-white text-sm font-semibold shadow-brand hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-borderColor bg-white text-textPrimary text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-[11px] text-textMuted font-mono">
          StockSense IMS · &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}
