'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Info, Dumbbell, CreditCard, Image as ImageIcon, Star, Phone } from 'lucide-react'
import { NavBar } from '@/components/ui/tubelight-navbar'
import { ThemeToggle } from './theme-toggle'
import { usePathname } from 'next/navigation'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const headerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    setIsLoadingUser(true)
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoadingUser(false))
  }, [pathname])

  // Optimized scroll handler â€” uses r- throttling instead of Framer Motion useScroll
  const updateHeader = useCallback(() => {
    const latest = window.scrollY
    const diff = latest - lastScrollY.current

    if (diff > 5 && latest > 200) {
      setIsHidden(true)
    } else if (diff < -5) {
      setIsHidden(false)
    }

    setIsScrolled(latest > 80)
    lastScrollY.current = latest
    ticking.current = false
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateHeader)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateHeader])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'About', url: '/about', icon: Info },
    { name: 'Programs', url: '/programs', icon: Dumbbell },
    { name: 'Memberships', url: '/membership', icon: CreditCard },
    { name: 'Gallery', url: '/gallery', icon: ImageIcon },
    { name: 'Testimonials', url: '/testimonials', icon: Star },
    { name: 'Contact', url: '/contact', icon: Phone },
  ]

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] as const },
    },
    open: {
      opacity: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  const mobileNavItemVariants = {
    closed: { opacity: 0, x: -40 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.06,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  }

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) return null;

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-background/60 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-black/5`}
        style={{
          transform: isHidden ? 'translateY(-100%)' : 'translateY(0%)',
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.5s, border-color 0.5s, box-shadow 0.5s',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/unicorn-logo.png"
              alt="Unicorn Fitness Club"
              className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
              width={40}
              height={40}
            />
            <span className={`text-base font-bold hidden sm:inline tracking-tight text-foreground`}>
              Unicorn Fitness Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavBar items={navItems} className="hidden lg:block absolute left-1/2 -translate-x-1/2" />

          {/* CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {isLoadingUser ? (
              <div className="hidden sm:block w-24 h-10 bg-accent/10 rounded-full animate-pulse" />
            ) : user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="hidden sm:flex items-center gap-2 px-1 pr-4 py-1 text-sm font-semibold bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  {user.name.charAt(0)}
                </div>
                <span className="text-foreground/90 group-hover:text-foreground">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : pathname === '/signin' ? (
              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-accent hover:bg-accent/90 rounded-full transition-all duration-300 shadow-lg shadow-accent/20 hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            ) : (
              <Link
                href="/signin"
                className="hidden sm:inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-accent hover:bg-accent/90 rounded-full transition-all duration-300 shadow-lg shadow-accent/20 hover:scale-105 active:scale-95"
              >
                Sign In
              </Link>
            )}


            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 hover:scale-105 active:scale-95 hover:bg-accent/10 text-foreground`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl lg:hidden"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <nav className="flex flex-col justify-center items-start h-full px-12 py-20 space-y-2">
              {navItems.map((item, i) => {
                const isActive = pathname === item.url
                return (
                  <motion.div
                    key={item.url}
                    custom={i}
                    variants={mobileNavItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <Link
                      href={item.url}
                      className={`text-4xl md:text-5xl font-bold transition-colors duration-300 block py-2 ${
                        isActive ? 'text-accent' : 'text-foreground/70 hover:text-foreground'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                )
              })}

              <motion.div
                custom={navItems.length}
                variants={mobileNavItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="pt-8 w-full"
              >
                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="block px-6 py-4 text-center text-sm font-semibold text-accent border border-accent/40 rounded-xl hover:bg-accent/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : pathname === '/signin' ? (
                  <Link
                    href="/signup"
                    className="block px-6 py-4 text-center text-sm font-semibold text-accent border border-accent/40 rounded-xl hover:bg-accent/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Account (Sign Up)
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="block px-6 py-4 text-center text-sm font-semibold text-accent border border-accent/40 rounded-xl hover:bg-accent/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </motion.div>

              {/* Contact info in mobile menu */}
              <motion.div
                custom={navItems.length + 1}
                variants={mobileNavItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="pt-8 text-sm text-foreground/40"
              >
                <p>087643 60662</p>
                <p>- Tower, Mahal Road, Jaipur</p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
