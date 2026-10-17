'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, TrendingUp, Users, Dumbbell, Activity, PersonStanding } from 'lucide-react'
import type { Program } from '@/lib/types'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs')
        const data = await response.json()
        setPrograms(data)
      } catch (error) {
        console.error('Failed to fetch programs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
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
            Our Programs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground/70"
          >
            Professionally designed programs for every fitness level and goal
          </motion.p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-foreground/70">Loading programs...</p>
          </div>
        ) : (
          <motion.div
            className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {programs.map((program) => (
              <motion.div
                key={program.id}
                variants={itemVariants}
                className="group bg-card rounded-lg border border-border overflow-hidden hover:border-accent hover:shadow-lg transition-all"
              >
                {/* Program Image */}
                <div className="relative h-48 bg-linear-to-br from-accent/20 to-primary/10 overflow-hidden">
                  {(program.image || (program as any).imageUrl) ? (
                    <img
                      src={(program as any).imageUrl || program.image || "/placeholder.svg"}
                      alt={program.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">💪</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {program.name}
                      </h3>
                      <p className="text-foreground/70 text-sm mb-4">
                        Led by {program.trainer}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">
                      {program.level}
                    </span>
                  </div>

                  <p className="text-foreground/70 mb-6">{program.description}</p>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground/70">{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground/70">{program.level}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link 
                    href={`/api/user/programs/enroll?programId=${program.id}`}
                    className="block w-full py-2 bg-accent text-white text-center rounded font-semibold hover:bg-accent/90 transition-all"
                  >
                    Enroll Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Trainers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary dark:bg-gray-950 text-primary-foreground dark:text-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Expert Trainers</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-accent/20 dark:bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                  {trainer.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{trainer.name}</h3>
                <p className="text-primary-foreground/80 dark:text-gray-300 text-sm mb-4">
                  {trainer.specialty}
                </p>
                <p className="text-primary-foreground/60 dark:text-gray-400 text-sm">{trainer.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
    </main>
  )
}

const trainers = [
  {
    icon: <Dumbbell className="w-10 h-10" />,
    name: 'Rajesh Kumar',
    specialty: 'Strength & Conditioning Expert',
    bio: 'Certified strength coach with 12+ years experience in competitive bodybuilding and powerlifting.',
  },
  {
    icon: <PersonStanding className="w-10 h-10" />,
    name: 'Priya Sharma',
    specialty: 'Yoga & Wellness',
    bio: 'Expert yoga instructor specializing in Hatha and Vinyasa with focus on holistic health.',
  },
  {
    icon: <PersonStanding className="w-10 h-10" />,
    name: '- Patel',
    specialty: '- Performance',
    bio: 'Sports performance coach helping athletes achieve peak conditioning and speed.',
  },
]
