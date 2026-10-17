'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from "framer-motion"

export function LoadingScreen() {
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading')

  const dismiss = useCallback(() => {
    setPhase('exiting')
    sessionStorage.setItem('unicorn_visited', 'true')
    setTimeout(() => setPhase('done'), 1000)
  }, [])

  useEffect(() => { if (sessionStorage.getItem('unicorn_visited')) { setPhase('done') } else { const timer = setTimeout(dismiss, 2000); return () => clearTimeout(timer) } }, [dismiss])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        className="fixed inset-0 z-999 flex items-center justify-center bg-[#050505]"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'exiting' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Core Content */}
        <div className="relative flex flex-col items-center justify-center">
          
          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            className="relative w-32 h-32 mb-8"
          >
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
            <img
              src="/images/unicorn-logo.png"
              alt="Unicorn Fitness Logo"
              className="relative z-10 w-full h-full object-contain"
              fetchPriority="high"
            />
          </motion.div>

          {/* Typography */}
          <div className="overflow-hidden mb-2">
            <motion.h1 
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              className="text-3xl md:text-4xl font-bold tracking-tighter text-white"
            >
              UNICORN FITNESS
            </motion.h1>
          </div>
          
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="text-[10px] md:text-xs tracking-[0.4em] text-white/60 uppercase font-medium"
            >
              Premium Training Facility
            </motion.p>
          </div>

          {/* Premium Loading Bar */}
          <motion.div 
            className="absolute -bottom-16 w-px h-12 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="w-full h-full bg-linear-to-b from-transparent via-orange-500 to-transparent"
              initial={{ y: '-100%' }}
              animate={{ y: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}

