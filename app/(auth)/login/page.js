'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Mail, Lock, AlertCircle, Eye, EyeOff, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Map raw NextAuth error codes → human-readable messages
function mapAuthError(error) {
  if (!error) return 'Something went wrong. Please try again.'
  const e = error.toLowerCase()
  if (e.includes('credentialssignin') || e.includes('credentials')) {
    return 'Invalid email or password. Please try again.'
  }
  if (e.includes('no user found') || e.includes('email')) {
    return 'No account found with that email address.'
  }
  if (e.includes('incorrect password') || e.includes('password')) {
    return 'Incorrect password. Please try again.'
  }
  if (e.includes('network') || e.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  return 'Sign in failed. Please try again.'
}

const features = [
  'Real-time stock tracking & margin audits',
  'Auto predictive runout velocities & insights',
  'One-click invoice creation & low stock alerts',
]

// Inner component — reads searchParams (requires Suspense boundary)
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read callbackUrl from query string (set by middleware / AppShell redirect)
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const isExpired = searchParams.get('expired') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (res?.error) {
        const msg = mapAuthError(res.error)
        setError(msg)
        toast.error(msg)
      } else {
        toast.success('Signed in successfully!')
        // Redirect to originally requested page, or dashboard
        router.push(decodeURIComponent(callbackUrl))
        router.refresh()
      }
    } catch {
      const msg = 'Unable to connect. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: decodeURIComponent(callbackUrl) })
  }

  return (
    <div className="w-full max-w-sm">

      {/* Session expired banner */}
      {isExpired && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold mb-6">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <span>Your session has expired. Please sign in again to continue.</span>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-textPrimary tracking-tight">Welcome back</h2>
        <p className="text-textSecondary text-sm mt-1">Sign in to manage your inventory workspace</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold mb-5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full h-10 flex items-center justify-center space-x-3 rounded-xl border border-borderColor bg-white hover:bg-gray-50 text-textPrimary text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-borderColor" />
        </div>
        <span className="relative z-10 px-3 bg-brandBg text-[10px] uppercase font-bold text-textMuted">
          or continue with email
        </span>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSignIn} className="space-y-4">

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-textMuted" />
            <Input
              id="login-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-textMuted" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-2.5 text-textMuted hover:text-textPrimary transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center space-x-2">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-borderColor text-brandPrimary accent-brandPrimary cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="text-xs text-textSecondary cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        <Button
          id="login-submit"
          type="submit"
          variant="default"
          className="w-full btn-primary-glow"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing in&hellip;
            </span>
          ) : 'Sign In'}
        </Button>

      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-brandBg overflow-hidden">

      {/* LEFT — Branding panel */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-14 overflow-hidden border-r border-borderColor bg-white">
        {/* Decorative blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-100 opacity-50 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-50 opacity-80 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center space-x-3 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-coral flex items-center justify-center shadow-brand">
            <span className="text-white text-lg font-black">S</span>
          </div>
          <span className="text-textPrimary font-extrabold tracking-tight text-lg">StockSense IMS</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-textPrimary leading-tight">
              Intelligent inventory OS for modern SMEs
            </h1>
            <p className="text-textSecondary text-base leading-relaxed">
              Real-time inventory, zero guesswork. Gain absolute clarity over stock levels,
              sales trends, and supplier workflows.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-brandSuccess border border-emerald-200 mt-0.5 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <p className="text-sm font-medium text-textPrimary">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-textMuted font-mono">
          &copy; {new Date().getFullYear()} StockSense IMS. All rights reserved.
        </div>
      </div>

      {/* RIGHT — Auth Panel */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-6 md:p-12 relative">

        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 flex items-center space-x-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-coral flex items-center justify-center shadow-brand">
            <span className="text-white text-sm font-black">S</span>
          </div>
          <span className="text-textPrimary font-bold text-sm">StockSense IMS</span>
        </div>

        {/* Suspense boundary for useSearchParams */}
        <Suspense fallback={
          <div className="w-full max-w-sm flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-brandPrimary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

      </div>
    </div>
  )
}
