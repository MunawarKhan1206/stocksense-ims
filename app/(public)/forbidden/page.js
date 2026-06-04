import Link from 'next/link'

export const metadata = {
  title: '403 — Access Denied | StockSense IMS',
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brandBg px-6">
      <div className="flex flex-col items-center text-center max-w-md w-full">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Error code */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted mb-3">
          Error 403
        </p>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary mb-4">
          Access denied
        </h1>

        {/* Description */}
        <p className="text-textSecondary text-sm leading-relaxed mb-10 max-w-xs">
          You don&apos;t have permission to view this page.
          Contact your administrator if you believe this is a mistake.
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-borderColor mb-10" />

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brandPrimary text-white text-sm font-semibold shadow-brand hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-borderColor bg-white text-textPrimary text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Sign In as Different User
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-[11px] text-textMuted font-mono">
          StockSense IMS · &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}
