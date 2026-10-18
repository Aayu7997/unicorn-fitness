'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/animated-background'

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D7C8B4] animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })

  // Load remembered email on component mount and handle URL errors
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('ufc_remember_email')
      if (savedEmail) {
        setFormData(prev => ({
          ...prev,
          email: savedEmail,
          remember: true
        }))
      }
    } catch {
      // Ignore if localStorage is disabled in privacy mode
    }

    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'OAuthFailed' || errorParam === 'O-') {
        setError('Google sign-in failed. Please try again or use your email and password.')
      } else {
        setError(decodeURIComponent(errorParam))
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
          ...(requires2FA && { twoFactorCode: twoFactorCode.trim() }),
        }),
      })

      const data = await res.json()

      if (data.requires2FA) {
        setRequires2FA(true)
        setIsSubmitting(false)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Sign in failed. Please try again.')
        return
      }

      // Persist or clear remembered email preference
      try {
        if (formData.remember) {
          localStorage.setItem('ufc_remember_email', formData.email.trim())
        } else {
          localStorage.removeItem('ufc_remember_email')
        }
      } catch {
        // Safe fallback
      }

      const redirect = searchParams.get('redirect')
      const isAdmin = data.user?.role === 'admin'

      if (isAdmin) {
        // Admins must ALWAYS go to the admin panel. Never redirect admins to user dashboard or plan enrollment.
        if (redirect && redirect.startsWith('/admin') && !redirect.startsWith('//')) {
          window.location.href = redirect
        } else {
          window.location.href = '/admin'
        }
      } else {
        // Normal members must NEVER be redirected to admin routes
        if (redirect && !redirect.startsWith('/admin') && redirect.startsWith('/') && !redirect.startsWith('//')) {
          window.location.href = redirect
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants mimicking react-native-reanimated springs
  const springVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1, 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    })
  }

  return (
    <main className="min-h-screen text-gray-900 dark:text-white selection:bg-black/30 dark:selection:bg-white/30 relative overflow-hidden">
      <AnimatedBackground />
      
      

      <section className="pt-24 pb-8 sm:pt-28 md:pt-32 md:pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-105 mx-auto my-auto">
          <motion.div
             custom={0}
             initial="hidden"
             animate="visible"
             variants={springVariant}
             className="text-center mb-6 sm:mb-8"
          >
            <img
              src="/images/unicorn-logo.png"
              alt="Unicorn Fitness Club"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 md:mb-5 object-contain drop-shadow-2xl"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tighter">Welcome Back</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-tight">Sign in to your account</p>
          </motion.div>

          {/* Toggle Tabs */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={springVariant}
            className="flex bg-gray-200/60 dark:bg-white/10 rounded-full p-1 mb-6 sm:mb-8 border border-gray-300/60 dark:border-white/15 backdrop-blur-xl shadow-lg"
          >
            <div className="flex-1 py-2 sm:py-2.5 rounded-full items-center text-center bg-white dark:bg-white/90 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="font-bold text-black text-xs sm:text-sm tracking-tight">Log In</span>
            </div>
            <Link href="/signup" className="flex-1 py-2 sm:py-2.5 rounded-full items-center text-center hover:bg-gray-300/40 dark:hover:bg-white/5 transition-colors">
              <span className="font-bold text-gray-500 dark:text-gray-400 text-xs sm:text-sm tracking-tight">Sign Up</span>
            </Link>
          </motion.div>

          {/* Glass Card Form */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={springVariant}
            className="bg-white/50 dark:bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/70 dark:border-white/10 backdrop-blur-2xl shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" suppressHydrationWarning>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              {requires2FA ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl space-y-1">
                    <ShieldCheck className="w-8 h-8 text-orange-500 mx-auto mb-1" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enter the 6-digit verification code from your authenticator app</p>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      suppressHydrationWarning
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="123456"
                      autoFocus
                      required
                      className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl text-center text-lg font-mono tracking-widest text-gray-900 dark:text-white placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || twoFactorCode.trim().length !== 6}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-extrabold tracking-tight rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] mt-3 sm:mt-4 text-sm sm:text-base"
                    whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying code...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => { setRequires2FA(false); setTwoFactorCode(''); setError('') }}
                    className="w-full text-center text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors pt-1"
                  >
                    ← Back to email and password
                  </button>
                </div>
              ) : (
                <>
                  {/* Email */}
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        placeholder="Email address"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        placeholder="Password"
                        required
                        disabled={isSubmitting}
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

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between px-1 pt-1 text-xs sm:text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={formData.remember}
                          onChange={(e) => setFormData({...formData, remember: e.target.checked})}
                          className="peer appearance-none w-4 h-4 rounded-sm border border-gray-400 dark:border-white/20 bg-white dark:bg-black/20 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-extrabold tracking-tight rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] mt-3 sm:mt-4 text-sm sm:text-base"
                    whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </motion.button>
                </>
              )}

              {/* Divider */}
              <div className="flex items-center my-4 sm:my-6 opacity-40">
                <div className="flex-1 border-t border-gray-400 dark:border-white/20" />
                <span className="px-4 text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">OR</span>
                <div className="flex-1 border-t border-gray-400 dark:border-white/20" />
              </div>

              {/* Social Login */}
              <button
                type="button"
                onClick={() => window.location.href = '/api/auth/google'}
                className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 bg-white/60 dark:bg-white/5 border border-gray-300/60 dark:border-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white font-bold text-sm tracking-tight"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
          </motion.div>

          {/* Minimal Auth Footer */}
          <motion.footer
            custom={3}
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
