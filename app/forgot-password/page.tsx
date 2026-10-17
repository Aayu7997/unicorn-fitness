'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2
} from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/animated-background'

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D7C8B4] animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialEmail = searchParams.get('email') || ''
  const initialToken = searchParams.get('token') || ''

  // Step 1: Request Code | Step 2: Verify Code & Reset | Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(initialToken ? 2 : 1)
  const [email, setEmail] = useState(initialEmail)
  const [token, setToken] = useState(initialToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Auto-redirect countdown on success
  const [redirectCountdown, setRedirectCountdown] = useState(4)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 3 && redirectCountdown > 0) {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1)
      }, 1000)
    } else if (step === 3 && redirectCountdown === 0) {
      router.push('/signin')
    }
    return () => clearInterval(timer)
  }, [step, redirectCountdown, router])

  // Step 1: Request OTP Reset Code
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send verification code. Please try again.')
        return
      }

      setStep(2)
      setCooldown(60)
    } catch {
      setError('Network error. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code in Step 2
  const handleResendCode = async () => {
    if (cooldown > 0 || isResending) return
    setError('')
    setIsResending(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to resend code. Please try again.')
        return
      }

      setCooldown(60)
    } catch {
      setError('Network error. Failed to resend verification code.')
    } finally {
      setIsResending(false)
    }
  }

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanToken = token.trim()
    if (!cleanToken || cleanToken.length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: cleanToken,
          password: newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password. Please verify the code.')
        return
      }

      setStep(3)
    } catch {
      setError('Network error. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const springVariant: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -16,
      transition: { duration: 0.2 },
    },
  }

  return (
    <main className="min-h-screen text-gray-900 dark:text-white selection:bg-black/30 dark:selection:bg-white/30 relative overflow-hidden flex flex-col justify-between">
      <AnimatedBackground />

      <section className="pt-24 pb-8 sm:pt-28 md:pt-32 md:pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-110 mx-auto my-auto">
          {/* Header Branding */}
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-block group">
              <img
                src="/images/unicorn-logo.png"
                alt="Unicorn Fitness Club"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 md:mb-5 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tighter">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Password Reset!'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-tight">
              {step === 1 && "Enter your registered email to receive an OTP code"}
              {step === 2 && "Check your inbox for the 6-digit verification code"}
              {step === 3 && "Your credentials have been securely updated"}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= 1 ? 'w-10 bg-orange-500' : 'w-6 bg-gray-300 dark:bg-white/10'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= 2 ? 'w-10 bg-orange-500' : 'w-6 bg-gray-300 dark:bg-white/10'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === 3 ? 'w-10 bg-orange-500' : 'w-6 bg-gray-300 dark:bg-white/10'
              }`}
            />
          </div>

          {/* Glass Card Form */}
          <div className="bg-white/50 dark:bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/70 dark:border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* STEP 1: Enter Email */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  variants={springVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleRequestCode}
                  className="space-y-4 sm:space-y-5"
                  suppressHydrationWarning
                >
                  {error && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm font-medium text-center">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-extrabold tracking-tight rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] text-sm sm:text-base mt-2"
                    whileHover={!isLoading ? { scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.99 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Verification Code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </motion.button>

                  <div className="pt-2 text-center">
                    <Link
                      href="/signin"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: Enter OTP & New Password */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  variants={springVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleResetPassword}
                  className="space-y-4 sm:space-y-4.5"
                  suppressHydrationWarning
                >
                  {error && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm font-medium text-center">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}


                  {/* Email Reminder with Edit action */}
                  <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-gray-200/50 dark:border-white/5 text-xs text-gray-600 dark:text-gray-400">
                    <span className="truncate mr-2">
                      Code sent to: <strong className="text-gray-900 dark:text-white">{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 font-semibold text-orange-500 hover:text-orange-400 shrink-0"
                    >
                      <Edit2 className="w-3 h-3" />
                      Change
                    </button>
                  </div>

                  {/* 6-Digit OTP Token */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all font-mono font-bold tracking-[0.3em] text-center text-lg sm:text-xl text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                        placeholder="••••••"
                        required
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      New Password (Min 8 Chars)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        placeholder="Re-enter new password"
                        required
                        minLength={8}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {confirmPassword && newPassword === confirmPassword && (
                        <CheckCircle2 className="absolute right-11 top-1/2 -translate-y-1/2 w-5 h-5 text-[#39FF14]" />
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-extrabold tracking-tight rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] text-sm sm:text-base mt-2"
                    whileHover={!isLoading ? { scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.99 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Set New Password'
                    )}
                  </motion.button>

                  {/* Resend Code Action */}
                  <div className="pt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={cooldown > 0 || isResending}
                      onClick={handleResendCode}
                      className="inline-flex items-center gap-1.5 font-semibold text-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: Success Screen */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={springVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center py-4 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-pulse">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      Password Reset Successfully!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                      Your new password has been applied. Redirecting to sign in within {redirectCountdown}s...
                    </p>
                  </div>

                  <Link
                    href="/signin"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-black text-white dark:bg-white dark:text-black font-extrabold tracking-tight rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg text-sm sm:text-base mt-2"
                  >
                    Sign In Now
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Minimal Auth Footer */}
          <motion.footer
            custom={2}
            initial="hidden"
            animate="visible"
            variants={springVariant}
            className="mt-6 sm:mt-8 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2 pb-6"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium">
              <Link href="/terms-of-service" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/privacy-policy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact Support
              </Link>
            </div>
            <p className="opacity-60 text-[11px]">
              © {new Date().getFullYear()} Unicorn Fitness Club. All rights reserved.
            </p>
          </motion.footer>
        </div>
      </section>
    </main>
  )
}
