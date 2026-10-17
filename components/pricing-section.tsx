'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from '@/lib/gsap'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
export function PricingSection({ plans }: { plans: any[] }) {
  if (!plans || plans.length === 0) return null
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1] as const,
      },
    },
  }

  return (
    <section className="py-28 px-6 sm:px-8 lg:px-12 relative overflow-hidden section-contained">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Membership Plans
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">Choose Your Path</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Flexible plans designed for every fitness level and budget
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} itemVariants={itemVariants} />
          ))}
        </motion.div>

        {/* Money back guarantee */}
        <motion.div
          className="mt-20 p-8 bg-linear-to-r from-accent/5 via-accent/10 to-accent/5 border border-accent/15 rounded-2xl text-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-accent/5 to-transparent" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />
          <p className="text-lg relative z-10">
            <span className="font-bold text-accent">30-day money-back guarantee.</span>{' '}
            No questions asked. If you&apos;re not completely satisfied, we&apos;ll refund your membership.
          </p>
        </motion.div>
      
        {/* Payment Disclaimer */}
        <motion.div
          className="mt-6 p-4 bg-card/5 border border-border rounded-xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-amber-400 font-bold">Note:</span> For payment related changes, please visit our desk or call us directly.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function PricingCard({ plan, itemVariants }: { plan: any; itemVariants: any }) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    // GS- quickTo for zero-rerender tilt (replaces React state setTilt)
    const xTo = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power2.out' })
    const yTo = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power2.out' })

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      xTo(y * -8)
      yTo(x * 8)
    }

    const handleMouseLeave = () => {
      xTo(0)
      yTo(0)
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      className={`relative p-8 rounded-3xl transition-colors duration-300 group ${
        plan.popular
          ? 'border-2 border-accent/40 bg-linear-to-b from-accent/10 via-accent/5 to-background md:scale-105 shadow-2xl shadow-accent/10'
          : 'border border-border bg-card hover:border-accent/30'
      }`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Gradient border glow for popular */}
      {plan.popular && (
        <>
          <div className="absolute -inset-[1px] bg-linear-to-r from-orange-500/20 via-amber-400/20 to-orange-500/20 rounded-3xl -z-10 blur-sm" />
          
          {/* Shimmer beam */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/[0.07] to-transparent" />
          </div>
        </>
      )}

      {/* Popular badge — CSS animation instead of Framer Motion infinite */}
      {plan.popular && (
        <div
          className="absolute -top-4 left-1/2 px-5 py-1.5 bg-linear-to-r from-orange-500 to-amber-400 text-foreground text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-500/25"
          style={{ animation: 'badge-float 3s ease-in-out infinite' }}
        >
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <p className="text-foreground/60 text-sm mb-6">{plan.description}</p>

      {/* Price */}
      <div className="mb-8">
        <span className="text-5xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
        <span className="text-foreground/50 ml-2">/{plan.period}</span>
      </div>

      {/* CTA Button */}
      <Link
        href={`/api/enroll?planId=${plan.id}`}
        className={`w-full py-4 flex items-center justify-center rounded-xl font-bold mb-8 transition-all duration-300 relative overflow-hidden hover:scale-[1.03] active:scale-[0.97] ${
          plan.popular
            ? 'bg-linear-to-r from-orange-500 to-amber-500 text-foreground hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/20'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        Get Started
      </Link>

      {/* Features — plain divs instead of motion.div per feature */}
      <div className="space-y-3.5">
        {plan.features.map((feature: string, featureIndex: number) => (
          <div
            key={featureIndex}
            className="flex items-start gap-3"
          >
            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-accent" />
            </div>
            <span className="text-foreground/70 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
