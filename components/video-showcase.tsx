'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { useState } from 'react'

export function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false)

  const videos = [
    {
      title: 'Full Body Strength',
      duration: '45 min',
      level: 'Advanced',
    },
    {
      title: 'HIIT Cardio Blast',
      duration: '30 min',
      level: 'Intermediate',
    },
    {
      title: 'Yoga & Flexibility',
      duration: '60 min',
      level: 'Beginner',
    },
  ]

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
            On-Demand Classes
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            Stream - Train -
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            - 500+ professionally produced workout videos from elite trainers
          </p>
        </motion.div>

        {/* Main video showcase */}
        <motion.div
          className="mb-20 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative h-96 lg:h-150 rounded-3xl overflow-hidden cursor-pointer group">
            <Image
              src="/images/video-showcase.jpg"
              alt="Video showcase"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />

            {/* Play button */}
            <motion.button
              className="absolute inset-0 flex items-center justify-center z-10"
              onClick={() => setIsPlaying(!isPlaying)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-2xl shadow-accent/50"
                animate={{ scale: isPlaying ? 0 : 1 }}
                transition={{ type: 'spring' as const }}
              >
                <Play className="w-8 h-8 text-background fill-background" />
              </motion.div>
            </motion.button>

            {/* Content overlay */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-8 z-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h3 className="text-3xl lg:text-4xl font-bold mb-2">Premium Workout Collection</h3>
              <p className="text-foreground/80">Transform your body in 12 weeks with our signature program</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Video categories */}
        <div className="grid md:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              {/* Background image (placeholder) */}
              <div className="relative h-48 bg-linear-to-br from-accent/20 to-primary/10 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent"
                  whileHover={{ opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Play icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/40 transition-colors">
                    <Play className="w-6 h-6 text-accent fill-accent" />
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-lg font-bold mb-2">{video.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">{video.duration}</span>
                  <span className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-semibold">
                    {video.level}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-20 p-12 bg-linear-to-r from-accent/10 to-primary/10 rounded-3xl text-center border border-accent/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h3 className="text-3xl font-bold mb-4">Unlock Full -</h3>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Join our membership to access all 500+ workout videos, live classes, and personal coaching
          </p>
          <motion.button
            className="px-8 py-4 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
