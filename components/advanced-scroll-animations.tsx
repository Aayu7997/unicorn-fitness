'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export function AdvancedScrollAnimations() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // - progress bar
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
              markers: false,
            },
            transformOrigin: '0% 50%',
            ease: 'none',
          }
        )
      }

      // Staggered text animation
      if (textRef.current) {
        const spans = textRef.current.querySelectorAll('span')
        if (spans.length > 0) {
          gsap.to(spans, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.02,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-32 px-6 sm:px-8 lg:px-12">
      {/* Progress bar */}
      <motion.div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-accent to-primary z-50"
        style={{ transformOrigin: '0% 50%' }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            - -
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">Cinematic Scroll Effects</h2>
          <p className="text-lg text-foreground/70">
            Scroll down to see GS- ScrollTrigger animations in action
          </p>
        </motion.div>

        {/* - heading */}
        <motion.h3
          ref={textRef}
          className="text-4xl lg:text-5xl font-bold text-center mb-16 leading-tight"
        >
          {'Watch as elements animate smoothly with every scroll'.split('').map((char, idx) => (
            <span key={idx} className="inline-block opacity-0">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </motion.h3>

        {/* Parallax boxes */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.8,
                delay: item * 0.15,
                ease: [0.34, 1.56, 0.64, 1] as const,
              }}
              className="p-8 bg-card border border-border rounded-2xl hover:border-accent/50 transition-all"
            >
              <div className="w-full h-40 bg-linear-to-br from-accent/20 to-primary/10 rounded-xl mb-6" />
              <h4 className="text-xl font-bold mb-3">Effect {item}</h4>
              <p className="text-foreground/70">
                Each card reveals with a smooth scale and translate animation as you scroll
              </p>
            </motion.div>
          ))}
        </div>

        {/* Timeline sequence */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-12 bg-linear-to-r from-accent/10 to-primary/10 rounded-2xl border border-accent/20"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Timeline Orchestration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: step * 0.1, duration: 0.6 }}
                className="p-4 bg-accent/20 rounded-lg text-center"
              >
                <div className="text-3xl font-bold text-accent mb-2">{step}</div>
                <p className="text-sm text-foreground/70">Phase {step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info box */}
        <motion.div
          className="mt-16 p-8 bg-card border border-border rounded-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <p className="text-foreground/70 leading-relaxed">
            These animations use GS-'s ScrollTrigger plugin with custom easing curves, stagger effects, and timeline sequencing. - optimized for 60fps performance across devices.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
