'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

export function TransformationShowcase() {
  const [isHovered, setIsHovered] = useState(false)

  const transformations = [
    {
      name: 'Sarah Chen',
      before: '200 lbs',
      after: '155 lbs',
      duration: '6 months',
      change: '-45 lbs',
    },
    {
      name: 'Marcus Johnson',
      before: '20% BF',
      after: '12% BF',
      duration: '4 months',
      change: '-8%',
    },
    {
      name: '- Rodriguez',
      before: 'Sedentary',
      after: 'Marathon Ready',
      duration: '12 weeks',
      change: 'Complete transformation',
    },
  ]

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-linear-to-b from-card/50 to-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Real Results
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            Member Transformations
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Witness the incredible journeys of our members who achieved their goals
          </p>
        </motion.div>

        {/* Main showcase */}
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Image Section */}
          <motion.div
            className="relative h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src="/images/feature-before-after.jpg"
              alt="Transformation before and after"
              fill
              className="object-cover"
            />
            <motion.div
              className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/80"
              animate={{ opacity: isHovered ? 0.5 : 0.2 }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: isHovered ? 1.1 : 1 }}
            >
              <motion.div
                className="text-5xl lg:text-6xl font-bold text-foreground text-center"
                animate={{ y: isHovered ? -10 : 0 }}
              >
                <span className="block text-accent">500+</span>
                <span className="text-lg">Success Stories</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              <h3 className="text-3xl font-bold mb-4">Proven Results</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Our members consistently achieve their fitness goals through our personalized programs and expert guidance. - weight loss: 20-50 lbs. - strength gain: 200+ lbs on compound lifts.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="p-6 bg-card border border-border rounded-xl">
                <p className="text-3xl font-bold text-accent mb-2">92%</p>
                <p className="text-sm text-foreground/70">Goal - Rate</p>
              </div>
              <div className="p-6 bg-card border border-border rounded-xl">
                <p className="text-3xl font-bold text-accent mb-2">8 weeks</p>
                <p className="text-sm text-foreground/70">- to Notice Change</p>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.button
              className="px-8 py-4 bg-accent text-background font-bold rounded-xl w-full hover:bg-accent/90 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Transformation
            </motion.button>
          </div>
        </motion.div>

        {/* Transformations Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {transformations.map((trans, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              className="p-8 bg-card border border-border rounded-2xl hover:border-accent/50 transition-all"
            >
              <p className="text-sm text-accent font-semibold uppercase mb-4">{trans.duration}</p>
              <h4 className="text-2xl font-bold mb-6">{trans.name}</h4>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-foreground/70 text-sm mb-1">Before</p>
                  <p className="text-lg font-semibold">{trans.before}</p>
                </div>
                <motion.div
                  className="h-1 bg-linear-to-r from-accent to-transparent rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                />
                <div>
                  <p className="text-foreground/70 text-sm mb-1">-</p>
                  <p className="text-lg font-semibold text-accent">{trans.after}</p>
                </div>
              </div>

              <p className="text-center py-4 px-4 bg-accent/10 rounded-lg text-accent font-bold">
                {trans.change}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
