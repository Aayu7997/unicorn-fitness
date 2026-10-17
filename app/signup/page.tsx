'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/animated-background'

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const contentType = res.headers.get('content-type')
      let data
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        throw new Error('Server returned an unexpected format.')
      }

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      window.location.href = '/dashboard'
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants mimicking react-native-reanimated springs
  const springVariant: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { 
        delay: custom * 0.1, 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    })
  }

  const leftSpringVariant: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    }
  }

  return (
    <main className="min-h-screen text-gray-900 dark:text-white selection:bg-black/30 dark:selection:bg-white/30 relative overflow-hidden">
      <AnimatedBackground />
      
      
      
      <section className="pt-24 pb-8 sm:pt-28 md:pt-32 md:pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-5xl my-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Side - Branding (Desktop & Tablet) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={leftSpringVariant}
              className="hidden lg:flex flex-col justify-center h-full"
            >
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-3xl p-8 lg:p-12 border border-gray-200/70 dark:border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
                
                <img
                  src="/images/unicorn-logo.png"
                  alt="Unicorn Fitness Club"
                  className="w-20 h-20 lg:w-24 lg:h-24 mb-6 object-contain drop-shadow-2xl"
                />
                
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tighter">
                  Join <span className="text-[#8B7355] dark:text-[#D7C8B4]">Unicorn Fitness Club</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-base lg:text-lg mb-8 tracking-tight">
                  Start your transformation journey at Jaipur's premier fitness destination
                </p>
                <div className="space-y-4 lg:space-y-5">
                  {[
                    '15,000+ successful transformations',
                    'Expert certified trainers',
                    'World-class facilities in Jagatpura',
                    'Personalized fitness programs',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D7C8B4] shadow-[0_0_10px_rgba(215,200,180,0.5)] shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium tracking-tight text-sm lg:text-base">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto">
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={springVariant}
                className="mb-6 sm:mb-8 text-center lg:text-left"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-4">
                  <img
                    src="/images/unicorn-logo.png"
                    alt="Unicorn Fitness Club"
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 object-contain drop-shadow-2xl"
                  />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5 text-gray-900 dark:text-white tracking-tighter">Create Account</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-tight">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-gray-900 hover:text-black dark:text-white dark:hover:text-[#D7C8B4] hover:underline font-bold transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.div>

              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={springVariant}
                className="bg-white/50 dark:bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/70 dark:border-white/10 backdrop-blur-2xl shadow-2xl"
              >
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" suppressHydrationWarning>
                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Name */}
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email Address"
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone Number (Optional)"
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
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
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password (Min 8 chars)"
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        required
                        minLength={8}
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

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <input
                        suppressHydrationWarning
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm Password"
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 bg-white/70 dark:bg-black/35 border border-gray-300/80 dark:border-white/15 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-white/40 focus:bg-white dark:focus:bg-black/50 transition-all text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
                        required
                        disabled={isSubmitting}
                      />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#39FF14]" />
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 px-1 pt-1">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        suppressHydrationWarning
                        type="checkbox"
                        id="terms"
                        required
                        className="peer appearance-none w-4 h-4 rounded-sm border border-gray-400 dark:border-white/20 bg-white dark:bg-black/20 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <label htmlFor="terms" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug">
                      I agree to the{' '}
                      <Link href="/terms-of-service" className="text-gray-900 hover:text-black dark:text-white dark:hover:text-gray-200 hover:underline transition-colors font-semibold">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy-policy" className="text-gray-900 hover:text-black dark:text-white dark:hover:text-gray-200 hover:underline transition-colors font-semibold">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>

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
            </div>
          </div>

          {/* Minimal Auth Footer */}
          <motion.footer
            custom={3}
            initial="hidden"
            animate="visible"
            variants={springVariant}
            className="mt-8 sm:mt-12 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2 pb-6"
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
