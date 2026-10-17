'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Testimonial } from '@/lib/types'
import { CalendlyCarousel, type CarouselItem } from '@/components/ui/connected-carousel'

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400"
]

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        const data = await response.json()
        setTestimonials(data)
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <main className="min-h-screen bg-background">
      

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-foreground mb-4"
          >
            Member Success Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground/70"
          >
            Real transformations from real members like you
          </motion.p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-foreground/70">Loading testimonials...</p>
          </div>
        ) : (
          <div className="flex justify-center w-full min-h-100">
            {testimonials.length > 0 && (
              <CalendlyCarousel 
                items={testimonials.map((t, i) => {
                  const img = t.imageUrl || t.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
                  return {
                    id: t.id || i,
                    stat: t.transformation || `Rated ${t.rating}/5 Stars`,
                    quote: t.content,
                    author: t.name,
                    role: t.role,
                    defaultImage: img,
                    selectedImage: img,
                    alt: `Portrait of ${t.name}`
                  }
                })} 
              />
            )}
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Our Community Impact</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformation Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Typical Member Journey
          </h2>

          <div className="space-y-8">
            {journey.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6"
              >
                {/* Timeline Dot */}
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  {index < journey.length - 1 && (
                    <div className="w-1 h-20 bg-accent/30 mt-4" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2 pb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-foreground/70">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6 text-foreground"
          >
            Ready to Write Your Success Story?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground/70 mb-8"
          >
            Join our community and begin your transformation today
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            href="/membership"
            className="inline-block px-8 py-4 bg-accent text-accent-foreground rounded font-semibold hover:bg-accent/90 transition-all hover:scale-105 active:scale-95"
          >
            Start Free Trial
          </motion.a>
        </div>
      </section>

      
    </main>
  )
}

const stats = [
  { value: '15K+', label: 'Happy Members' },
  { value: '50K+', label: 'Lives Transformed' },
  { value: '99%', label: 'Satisfaction Rate' },
]

const journey = [
  {
    title: 'Getting Started',
    description: 'Free consultation with our team to understand your goals and design your personalized program.',
  },
  {
    title: 'First Month',
    description: 'Focus on building consistency and learning proper form. Quick energy and confidence boost.',
  },
  {
    title: 'Three Months',
    description: 'Noticeable physical changes, increased strength, and improved endurance.',
  },
  {
    title: 'Six Months',
    description: 'Significant transformation, established healthy habits, and lifestyle changes.',
  },
  {
    title: 'One Year+',
    description: 'Complete body and mind transformation. You are now part of our Elite community.',
  },
]
