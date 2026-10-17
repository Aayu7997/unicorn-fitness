'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, Users, Target, Smartphone, Award } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: '- Training',
    description: 'AI-powered workout plans tailored to your goals and fitness level.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Form coaching and injury prevention with certified trainers.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join a supportive community of 15,000+ active members.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Real-time progress monitoring and personalized insights.',
  },
  {
    icon: Smartphone,
    title: 'Mobile -',
    description: 'Track workouts, access classes, and message trainers on-the-go.',
  },
  {
    icon: Award,
    title: 'Certifications',
    description: '- trainers are internationally certified and continuously educated.',
  },
]

export function FeaturesShowcase() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1] as const,
      },
    },
  }

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
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
            Why Choose Elite
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            Premium Features for Champions
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to achieve your fitness goals with world-class support
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-8 bg-card border border-border rounded-2xl hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10"
              >
                {/* Icon */}
                <motion.div
                  className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors"
                  whileHover={{ rotate: 6, scale: 1.1 }}
                >
                  <Icon className="w-7 h-7 text-accent" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>

                {/* Underline */}
                <motion.div
                  className="h-1 bg-linear-to-r from-accent to-transparent mt-4 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
                  viewport={{ once: true }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Background decoration */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
    </section>
  )
}
