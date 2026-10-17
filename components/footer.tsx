'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Twitter, Linkedin, Mail, Phone, MapPin, ArrowRight} from 'lucide-react'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [siteData, setSiteData] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/site-content')
      .then(res => res.json())
      .then(data => {
        if (data) setSiteData(data)
      })
      .catch(console.error)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || isAuthPage) return null;

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 to-black z-0" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-orange-500/4 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-amber-500/3 rounded-full blur-[100px] z-0" />
      
      {/* Top divider gradient */}
      <div className="h-px bg-linear-to-r from-transparent via-orange-500/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 text-white">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <img src="/images/unicorn-logo.png" alt="Unicorn Fitness Club" className="w-11 h-11" width={44} height={44} />
              <div>
                <span className="text-lg font-bold block text-white">Unicorn Fitness Club</span>
                <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Fit Life · Healthy Life</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              {siteData?.footer?.description || "Owner: Lokesh Meena. Transform your body, elevate your mind with premium fitness in Jaipur, India."}
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/unicornfitnessjaipur', label: 'Instagram' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-2.5 bg-white/6 hover:bg-orange-500 rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-sm mb-6 text-orange-400 tracking-wider uppercase">Navigation</h3>
            <nav className="space-y-2.5 flex flex-col">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Programs', href: '/programs' },
                { label: 'Memberships', href: '/membership' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <div key={item.href} className="hover:translate-x-1 transition-transform duration-200">
                  <Link href={item.href} className="text-sm text-white/50 hover:text-orange-400 transition-colors duration-300 flex items-center gap-1 group">
                    {item.label}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              ))}
            </nav>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-sm mb-6 text-orange-400 tracking-wider uppercase">Resources</h3>
            <nav className="space-y-2.5 flex flex-col">
              {[
                { label: 'Gallery', href: '/gallery' },
                { label: 'Testimonials', href: '/testimonials' },
                { label: 'Blog', href: '/blog' },
                { label: 'Support', href: '/support' },
                { label: 'Sign In', href: '/signin' },
              ].map((item) => (
                <div key={item.href} className="hover:translate-x-1 transition-transform duration-200">
                  <Link href={item.href} className="text-sm text-white/50 hover:text-orange-400 transition-colors duration-300 flex items-center gap-1 group">
                    {item.label}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              ))}
            </nav>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-sm mb-6 text-orange-400 tracking-wider uppercase">Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                <p className="text-white/50">{siteData?.about?.address || "- Tower, Mahal Road, Near Jagatpura Flyover, Jaipur, Rajasthan 302017"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500" />
                <a href={`tel:${(siteData?.about?.phone || "08764360662").replace(/\s+/g, '')}`} className="text-white/50 hover:text-orange-400 transition-colors">
                  {siteData?.about?.phone || "087643 60662"}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500" />
                <a href={`mailto:${siteData?.about?.email || "Unicornfitness3111@gmail.com"}`} className="text-white/50 hover:text-orange-400 transition-colors text-xs">
                  {siteData?.about?.email || "Unicornfitness3111@gmail.com"}
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/30 gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p>&copy; {currentYear} Unicorn Fitness Club, Jaipur. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-orange-400 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-orange-400 transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-orange-400 transition-colors">Cookies</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
